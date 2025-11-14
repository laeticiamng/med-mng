-- Phase 6 System #2: Advanced Content Moderation Workflows

-- Moderation Rules Table
CREATE TABLE IF NOT EXISTS moderation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL, -- 'keyword', 'pattern', 'user_behavior', 'content_type'
  condition JSONB NOT NULL, -- Rule condition configuration
  action VARCHAR(50) NOT NULL, -- 'flag', 'hide', 'remove', 'escalate', 'ban'
  action_config JSONB, -- Action-specific configuration
  severity 'low' | 'medium' | 'high' | 'critical' NOT NULL DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Moderation Team Table
CREATE TABLE IF NOT EXISTS moderation_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  expertise VARCHAR(100)[], -- Array of expertise areas: 'violence', 'harassment', 'spam', 'misinformation', 'sexual_content', 'other'
  max_queue_size INTEGER DEFAULT 100,
  auto_escalate_after_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Moderation Team Members Table
CREATE TABLE IF NOT EXISTS moderation_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES moderation_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role VARCHAR(50) NOT NULL, -- 'lead', 'reviewer', 'supervisor', 'viewer'
  expertise VARCHAR(100)[],
  max_daily_reviews INTEGER DEFAULT 500,
  available BOOLEAN DEFAULT true,
  last_action_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Moderation Appeals Table
CREATE TABLE IF NOT EXISTS moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_action_id UUID NOT NULL REFERENCES moderation_queue(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'escalated'
  reason TEXT NOT NULL,
  appeal_type VARCHAR(50) NOT NULL, -- 'content_not_violation', 'account_error', 'disproportionate'
  additional_context TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  decision_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content Filter Cache Table
CREATE TABLE IF NOT EXISTS content_filter_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  filter_results JSONB NOT NULL, -- Results from content filtering
  detected_issues VARCHAR(100)[], -- Issues detected: 'violence', 'harassment', 'spam', etc.
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  requires_review BOOLEAN DEFAULT false,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(content_id, content_type)
);

-- Moderation Statistics Table
CREATE TABLE IF NOT EXISTS moderation_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statistic_date DATE NOT NULL,
  total_reviewed INTEGER DEFAULT 0,
  total_escalated INTEGER DEFAULT 0,
  total_appeals INTEGER DEFAULT 0,
  appeal_approval_rate DECIMAL(3, 2),
  avg_review_time_seconds INTEGER,
  moderation_team_id UUID REFERENCES moderation_teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(statistic_date, moderation_team_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_moderation_rules_active ON moderation_rules(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_moderation_team_members_team ON moderation_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_status ON moderation_appeals(status, created_at);
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_user ON moderation_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_content_filter_cache_expires ON content_filter_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_moderation_stats_date ON moderation_statistics(statistic_date);

-- Enable RLS
ALTER TABLE moderation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_filter_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Moderation Rules: Admins and moderators can view/edit
CREATE POLICY "moderation_rules_admin_access" ON moderation_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator'))
  );

-- Moderation Teams: Team members can view their team
CREATE POLICY "moderation_teams_member_access" ON moderation_teams
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM moderation_team_members mtm WHERE mtm.team_id = id AND mtm.user_id = auth.uid())
  );

-- Moderation Appeals: Users can view their own appeals, moderators can view all
CREATE POLICY "moderation_appeals_user_access" ON moderation_appeals
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator'))
  );

CREATE POLICY "moderation_appeals_user_insert" ON moderation_appeals
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Content Filter Cache: Admins and moderators only
CREATE POLICY "content_filter_cache_admin_access" ON content_filter_cache
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator'))
  );

-- Moderation Statistics: Team leads and admins
CREATE POLICY "moderation_statistics_access" ON moderation_statistics
  FOR SELECT USING (
    moderation_team_id IS NULL OR
    EXISTS (
      SELECT 1 FROM moderation_team_members mtm
      WHERE mtm.team_id = moderation_statistics.moderation_team_id
      AND mtm.user_id = auth.uid()
      AND mtm.role IN ('lead', 'supervisor')
    ) OR
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'))
  );

-- Insert default moderation rules
INSERT INTO moderation_rules (name, description, rule_type, condition, action, severity) VALUES
('Spam Pattern Detection', 'Detect common spam patterns', 'pattern', '{"keywords": ["viagra", "casino", "lottery"]}', 'flag', 'high'),
('Excessive Links', 'Flag content with too many links', 'pattern', '{"max_links": 3}', 'flag', 'medium'),
('Profanity Check', 'Detect profanity and hate speech', 'keyword', '{"list": "profanity"}', 'flag', 'high'),
('All-Caps Detection', 'Flag aggressive all-caps messages', 'pattern', '{"min_length": 10, "uppercase_ratio": 0.8}', 'flag', 'low');

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_moderation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER moderation_rules_updated_at
BEFORE UPDATE ON moderation_rules
FOR EACH ROW
EXECUTE FUNCTION update_moderation_updated_at();

CREATE TRIGGER moderation_teams_updated_at
BEFORE UPDATE ON moderation_teams
FOR EACH ROW
EXECUTE FUNCTION update_moderation_updated_at();

CREATE TRIGGER moderation_team_members_updated_at
BEFORE UPDATE ON moderation_team_members
FOR EACH ROW
EXECUTE FUNCTION update_moderation_updated_at();

CREATE TRIGGER moderation_appeals_updated_at
BEFORE UPDATE ON moderation_appeals
FOR EACH ROW
EXECUTE FUNCTION update_moderation_updated_at();

CREATE TRIGGER content_filter_cache_updated_at
BEFORE UPDATE ON content_filter_cache
FOR EACH ROW
EXECUTE FUNCTION update_moderation_updated_at();
