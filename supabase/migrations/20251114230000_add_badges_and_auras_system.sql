-- Badges and Auras Gamification System

-- Badge definitions table
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_emoji TEXT NOT NULL,
  color TEXT DEFAULT 'bg-blue-600',
  category TEXT NOT NULL, -- achievement, streak, social, wellness, learning
  criteria_type TEXT NOT NULL, -- activity_count, streak_days, post_count, comment_count, goal_completed, etc.
  criteria_value INTEGER NOT NULL,
  rarity TEXT DEFAULT 'common', -- common, uncommon, rare, epic, legendary
  unlock_at_percentage BOOLEAN DEFAULT FALSE, -- Whether it unlocks at a percentage of total criteria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_definitions ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- User auras table
CREATE TABLE IF NOT EXISTS user_auras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  aura_color TEXT DEFAULT 'blue', -- blue, green, purple, gold, red, orange
  aura_intensity TEXT DEFAULT 'low', -- low, medium, high, intense
  last_level_up TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gamification stats table
CREATE TABLE IF NOT EXISTS gamification_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  streaks_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  goals_completed INTEGER DEFAULT 0,
  activities_logged INTEGER DEFAULT 0,
  community_contributions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  rank INTEGER,
  score INTEGER DEFAULT 0,
  badges_count INTEGER DEFAULT 0,
  aura_level INTEGER DEFAULT 1,
  week_points INTEGER DEFAULT 0,
  month_points INTEGER DEFAULT 0,
  all_time_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at);
CREATE INDEX idx_user_auras_user_id ON user_auras(user_id);
CREATE INDEX idx_user_auras_level ON user_auras(current_level);
CREATE INDEX idx_gamification_stats_user_id ON gamification_stats(user_id);
CREATE INDEX idx_gamification_stats_total_points ON gamification_stats(total_points);
CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(rank);
CREATE INDEX idx_leaderboard_score ON leaderboard_entries(score);
CREATE INDEX idx_leaderboard_week_points ON leaderboard_entries(week_points);

-- Enable RLS
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_auras ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies - badge_definitions (public read)
CREATE POLICY "badge_definitions_select_public" ON badge_definitions
  FOR SELECT USING (TRUE);

-- RLS Policies - user_badges (user can see own, admins can manage all)
CREATE POLICY "user_badges_select_own" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_badges_select_public" ON user_badges
  FOR SELECT USING (TRUE);

CREATE POLICY "user_badges_insert_service" ON user_badges
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "user_badges_update_service" ON user_badges
  FOR UPDATE USING (TRUE);

-- RLS Policies - user_auras (user can see own)
CREATE POLICY "user_auras_select_own" ON user_auras
  FOR SELECT USING (auth.uid() = user_id OR TRUE);

CREATE POLICY "user_auras_insert_service" ON user_auras
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "user_auras_update_service" ON user_auras
  FOR UPDATE USING (TRUE);

-- RLS Policies - gamification_stats (user can see own)
CREATE POLICY "gamification_stats_select_own" ON gamification_stats
  FOR SELECT USING (auth.uid() = user_id OR TRUE);

CREATE POLICY "gamification_stats_insert_service" ON gamification_stats
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "gamification_stats_update_service" ON gamification_stats
  FOR UPDATE USING (TRUE);

-- RLS Policies - leaderboard_entries (public read)
CREATE POLICY "leaderboard_select_public" ON leaderboard_entries
  FOR SELECT USING (TRUE);

CREATE POLICY "leaderboard_insert_service" ON leaderboard_entries
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "leaderboard_update_service" ON leaderboard_entries
  FOR UPDATE USING (TRUE);

-- Trigger to update updated_at for badge_definitions
CREATE TRIGGER update_badge_definitions_updated_at
  BEFORE UPDATE ON badge_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for user_auras
CREATE TRIGGER update_user_auras_updated_at
  BEFORE UPDATE ON user_auras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for gamification_stats
CREATE TRIGGER update_gamification_stats_updated_at
  BEFORE UPDATE ON gamification_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for leaderboard_entries
CREATE TRIGGER update_leaderboard_entries_updated_at
  BEFORE UPDATE ON leaderboard_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default badge definitions
INSERT INTO badge_definitions (name, description, icon_emoji, color, category, criteria_type, criteria_value, rarity) VALUES
  -- Activity Badges
  ('First Steps', 'Complete your first wellness activity', '👣', 'bg-blue-600', 'achievement', 'activity_count', 1, 'common'),
  ('Activity Enthusiast', 'Complete 25 wellness activities', '🏃', 'bg-blue-500', 'achievement', 'activity_count', 25, 'uncommon'),
  ('Wellness Master', 'Complete 100 wellness activities', '🧘', 'bg-purple-600', 'achievement', 'activity_count', 100, 'rare'),

  -- Streak Badges
  ('Week Warrior', 'Maintain a 7-day streak on any activity', '🔥', 'bg-orange-600', 'streak', 'streak_days', 7, 'uncommon'),
  ('Streak Legend', 'Maintain a 30-day streak on any activity', '⚡', 'bg-yellow-500', 'streak', 'streak_days', 30, 'epic'),
  ('Unstoppable', 'Maintain a 100-day streak on any activity', '👑', 'bg-gold-500', 'streak', 'streak_days', 100, 'legendary'),

  -- Social Badges
  ('Social Butterfly', 'Create your first post', '🦋', 'bg-pink-600', 'social', 'post_count', 1, 'common'),
  ('Storyteller', 'Create 10 posts', '📖', 'bg-pink-500', 'social', 'post_count', 10, 'uncommon'),
  ('Voice of Community', 'Create 50 posts', '📢', 'bg-pink-700', 'social', 'post_count', 50, 'rare'),

  -- Engagement Badges
  ('Conversationalist', 'Write your first comment', '💬', 'bg-green-600', 'social', 'comment_count', 1, 'common'),
  ('Active Listener', 'Write 25 comments', '👂', 'bg-green-500', 'social', 'comment_count', 25, 'uncommon'),
  ('Community Pillar', 'Write 100 comments', '🏛️', 'bg-green-700', 'social', 'comment_count', 100, 'epic'),

  -- Goal Badges
  ('Goal Setter', 'Create your first wellness goal', '🎯', 'bg-indigo-600', 'wellness', 'goal_completed', 1, 'common'),
  ('Goal Achiever', 'Complete 5 wellness goals', '🏆', 'bg-indigo-500', 'wellness', 'goal_completed', 5, 'uncommon'),
  ('Goal Master', 'Complete 20 wellness goals', '🥇', 'bg-indigo-700', 'wellness', 'goal_completed', 20, 'rare'),

  -- Learning Badges
  ('Curious Mind', 'Read your first help article', '📚', 'bg-cyan-600', 'learning', 'article_read', 1, 'common'),
  ('Knowledge Seeker', 'Read 10 help articles', '🔍', 'bg-cyan-500', 'learning', 'article_read', 10, 'uncommon'),
  ('Expert', 'Read 50 help articles', '🎓', 'bg-cyan-700', 'learning', 'article_read', 50, 'rare')
ON CONFLICT (name) DO NOTHING;
