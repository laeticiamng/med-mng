-- Advanced Search System Migration
-- Enables full-text search, search history, and analytics

-- Create search_history table to track user searches
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  search_type VARCHAR(20) NOT NULL DEFAULT 'global', -- 'global', 'posts', 'users', 'teams', 'wellness'
  filters JSONB, -- Store filters used: {category: 'wellness', dateRange: '7d', ...}
  results_count INT DEFAULT 0,
  clicked_result_id UUID, -- Track if user clicked a result
  clicked_result_type VARCHAR(20), -- 'post', 'user', 'team', 'wellness'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search suggestions/trending table
CREATE TABLE IF NOT EXISTS search_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL UNIQUE,
  search_count INT DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  suggestion_type VARCHAR(20) NOT NULL DEFAULT 'trending', -- 'trending', 'recent', 'popular'
  category VARCHAR(50), -- Optional category context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_logs table for analytics
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  total_results INT DEFAULT 0,
  search_time_ms INT, -- How long the search took
  search_type VARCHAR(20) NOT NULL DEFAULT 'global',
  user_count INT DEFAULT 0, -- How many users performed this search
  popularity_score FLOAT DEFAULT 0, -- Based on search frequency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history USING GIN(to_tsvector('french', query));
CREATE INDEX IF NOT EXISTS idx_search_suggestions_query ON search_suggestions(query);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_search_count ON search_suggestions(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_search_query ON search_logs USING GIN(to_tsvector('french', search_query));

-- Create indexes on main content tables for full-text search
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING GIN(to_tsvector('french', title || ' ' || COALESCE(content, '')));
CREATE INDEX IF NOT EXISTS idx_posts_title_search ON posts(title);
CREATE INDEX IF NOT EXISTS idx_users_profile_search ON users USING GIN(to_tsvector('french', username || ' ' || COALESCE(bio, '')));
CREATE INDEX IF NOT EXISTS idx_teams_search ON teams USING GIN(to_tsvector('french', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_wellness_search ON wellness_entries USING GIN(to_tsvector('french', COALESCE(notes, '')));

-- Create triggers for timestamps
CREATE OR REPLACE FUNCTION update_search_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_search_suggestions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

DROP TRIGGER IF EXISTS update_search_history_timestamp ON search_history;
CREATE TRIGGER update_search_history_timestamp
  BEFORE UPDATE ON search_history
  FOR EACH ROW
  EXECUTE FUNCTION update_search_history_timestamp();

DROP TRIGGER IF EXISTS update_search_suggestions_timestamp ON search_suggestions;
CREATE TRIGGER update_search_suggestions_timestamp
  BEFORE UPDATE ON search_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_search_suggestions_timestamp();

-- RLS Policies
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own search history
CREATE POLICY "Users can view own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create search history entries
CREATE POLICY "Users can create search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own search history
CREATE POLICY "Users can update own search history" ON search_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Search suggestions are public (read-only)
CREATE POLICY "Anyone can view search suggestions" ON search_suggestions
  FOR SELECT USING (true);

-- Search logs are public (read-only)
CREATE POLICY "Anyone can view search logs" ON search_logs
  FOR SELECT USING (true);

-- Anon users can't insert/update search data
CREATE POLICY "Authenticated users can create search history" ON search_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() IS NOT NULL);

-- Create function to update search suggestions
CREATE OR REPLACE FUNCTION update_search_suggestion(p_query TEXT, p_category VARCHAR)
RETURNS VOID AS $$
BEGIN
  INSERT INTO search_suggestions (query, search_count, suggestion_type, category)
  VALUES (p_query, 1, 'trending', p_category)
  ON CONFLICT (query)
  DO UPDATE SET
    search_count = search_suggestions.search_count + 1,
    last_searched = NOW();
END;
$$ LANGUAGE PLPGSQL;

-- Create function for global search across multiple tables
CREATE OR REPLACE FUNCTION global_search(
  p_query TEXT,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  type VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  relevance FLOAT
) AS $$
DECLARE
  v_search_vector TSQUERY;
BEGIN
  v_search_vector := plainto_tsquery('french', p_query);

  RETURN QUERY
  -- Posts
  SELECT
    p.id,
    p.title,
    LEFT(p.content, 200) as content,
    'post'::VARCHAR(20) as type,
    p.created_at,
    ts_rank(to_tsvector('french', p.title || ' ' || COALESCE(p.content, '')), v_search_vector) as relevance
  FROM posts p
  WHERE to_tsvector('french', p.title || ' ' || COALESCE(p.content, '')) @@ v_search_vector
    AND p.is_deleted = false
  UNION ALL
  -- Users
  SELECT
    u.id,
    u.username,
    COALESCE(u.bio, '') as content,
    'user'::VARCHAR(20) as type,
    u.created_at,
    ts_rank(to_tsvector('french', u.username || ' ' || COALESCE(u.bio, '')), v_search_vector) as relevance
  FROM users u
  WHERE to_tsvector('french', u.username || ' ' || COALESCE(u.bio, '')) @@ v_search_vector
  UNION ALL
  -- Teams
  SELECT
    t.id,
    t.name,
    COALESCE(t.description, '') as content,
    'team'::VARCHAR(20) as type,
    t.created_at,
    ts_rank(to_tsvector('french', t.name || ' ' || COALESCE(t.description, '')), v_search_vector) as relevance
  FROM teams t
  WHERE to_tsvector('french', t.name || ' ' || COALESCE(t.description, '')) @@ v_search_vector
    AND (t.visibility = 'public' OR t.visibility = 'internal')
  UNION ALL
  -- Wellness Entries
  SELECT
    we.id,
    we.activity_type,
    COALESCE(we.notes, '') as content,
    'wellness'::VARCHAR(20) as type,
    we.created_at,
    ts_rank(to_tsvector('french', we.activity_type || ' ' || COALESCE(we.notes, '')), v_search_vector) as relevance
  FROM wellness_entries we
  WHERE to_tsvector('french', we.activity_type || ' ' || COALESCE(we.notes, '')) @@ v_search_vector

  ORDER BY relevance DESC, created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE PLPGSQL;

-- Create function to search posts with filters
CREATE OR REPLACE FUNCTION search_posts(
  p_query TEXT,
  p_category VARCHAR DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category VARCHAR(50),
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  comment_count INT,
  relevance FLOAT
) AS $$
DECLARE
  v_search_vector TSQUERY;
BEGIN
  v_search_vector := plainto_tsquery('french', p_query);

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    LEFT(p.content, 300) as content,
    p.category,
    p.author_id,
    p.created_at,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = false)::INT as comment_count,
    ts_rank(to_tsvector('french', p.title || ' ' || COALESCE(p.content, '')), v_search_vector) as relevance
  FROM posts p
  WHERE to_tsvector('french', p.title || ' ' || COALESCE(p.content, '')) @@ v_search_vector
    AND p.is_deleted = false
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_start_date IS NULL OR DATE(p.created_at) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(p.created_at) <= p_end_date)
  ORDER BY relevance DESC, p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE PLPGSQL;

-- Create function to search users with filters
CREATE OR REPLACE FUNCTION search_users(
  p_query TEXT,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  bio TEXT,
  avatar_url TEXT,
  relevance FLOAT
) AS $$
DECLARE
  v_search_vector TSQUERY;
BEGIN
  v_search_vector := plainto_tsquery('french', p_query);

  RETURN QUERY
  SELECT
    u.id,
    u.username,
    u.bio,
    u.avatar_url,
    ts_rank(to_tsvector('french', u.username || ' ' || COALESCE(u.bio, '')), v_search_vector) as relevance
  FROM users u
  WHERE to_tsvector('french', u.username || ' ' || COALESCE(u.bio, '')) @@ v_search_vector
  ORDER BY relevance DESC, u.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE PLPGSQL;

-- Insert initial trending searches
INSERT INTO search_suggestions (query, search_count, suggestion_type, category)
VALUES
  ('bien-être', 5, 'trending', 'wellness'),
  ('meditation', 4, 'trending', 'wellness'),
  ('apprentissage', 3, 'trending', 'learning'),
  ('santé mentale', 3, 'trending', 'wellness'),
  ('productivité', 2, 'trending', 'productivity'),
  ('fitness', 2, 'trending', 'wellness'),
  ('motivation', 2, 'trending', 'motivation'),
  ('développement personnel', 1, 'trending', 'learning')
ON CONFLICT (query) DO NOTHING;

COMMIT;
