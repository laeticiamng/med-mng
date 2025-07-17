-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE content_type AS ENUM ('song', 'quiz', 'flashcard', 'article');

-- Users profile extension
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  specialization TEXT,
  study_level difficulty_level DEFAULT 'beginner',
  daily_goal INTEGER DEFAULT 30, -- minutes per day
  streak_days INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- in minutes
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Medical topics taxonomy
CREATE TABLE medical_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  parent_id UUID REFERENCES medical_topics(id),
  difficulty_level difficulty_level NOT NULL,
  description TEXT,
  icon_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Songs table (extending existing)
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  topic_id UUID REFERENCES medical_topics(id),
  title TEXT NOT NULL,
  artist TEXT,
  suno_id TEXT UNIQUE,
  audio_url TEXT,
  image_url TEXT,
  lyrics TEXT,
  medical_content JSONB, -- structured medical info
  duration INTEGER, -- in seconds
  play_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Learning sessions
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type content_type NOT NULL,
  topic_id UUID REFERENCES medical_topics(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  score DECIMAL(5,2),
  notes TEXT,
  feedback JSONB
);

-- Quiz questions
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES medical_topics(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- array of {text, is_correct, explanation}
  difficulty_level difficulty_level NOT NULL,
  explanation TEXT,
  references TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- User progress tracking
CREATE TABLE user_progress (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  topic_id UUID REFERENCES medical_topics(id),
  mastery_level DECIMAL(3,2) DEFAULT 0, -- 0 to 1
  last_reviewed TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, topic_id)
);

-- Subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Generation quotas
CREATE TABLE generation_quotas (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  daily_limit INTEGER DEFAULT 5,
  daily_used INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 100,
  monthly_used INTEGER DEFAULT 0,
  last_reset_daily TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  last_reset_monthly TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Achievements/Badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  points INTEGER DEFAULT 0,
  criteria JSONB NOT NULL
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (user_id, achievement_id)
);

-- Playlists
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  topic_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE playlist_songs (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (playlist_id, song_id)
);

-- Likes/Favorites
CREATE TABLE user_likes (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type content_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (user_id, content_id, content_type)
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Indexes for performance
CREATE INDEX idx_songs_user_id ON songs(user_id);
CREATE INDEX idx_songs_topic_id ON songs(topic_id);
CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_content ON learning_sessions(content_id, content_type);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view public songs" ON songs
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own songs" ON songs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON learning_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to reset daily quotas
CREATE OR REPLACE FUNCTION reset_daily_quotas()
RETURNS void AS $$
BEGIN
  UPDATE generation_quotas
  SET daily_used = 0,
      last_reset_daily = TIMEZONE('utc'::text, NOW())
  WHERE last_reset_daily < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_last_date DATE;
  v_current_date DATE;
BEGIN
  SELECT DATE(MAX(started_at)) INTO v_last_date
  FROM learning_sessions
  WHERE user_id = p_user_id
    AND completed_at IS NOT NULL;
  
  IF v_last_date IS NULL THEN
    RETURN 0;
  END IF;
  
  v_current_date := CURRENT_DATE;
  
  -- Check if user studied today or yesterday
  IF v_last_date >= v_current_date - INTERVAL '1 day' THEN
    -- Count consecutive days
    WITH RECURSIVE streak_days AS (
      SELECT DATE(started_at) as study_date
      FROM learning_sessions
      WHERE user_id = p_user_id
        AND completed_at IS NOT NULL
        AND DATE(started_at) = v_last_date
      
      UNION
      
      SELECT DATE(ls.started_at)
      FROM learning_sessions ls
      JOIN streak_days sd ON DATE(ls.started_at) = sd.study_date - INTERVAL '1 day'
      WHERE ls.user_id = p_user_id
        AND ls.completed_at IS NOT NULL
    )
    SELECT COUNT(DISTINCT study_date) INTO v_streak FROM streak_days;
  END IF;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

