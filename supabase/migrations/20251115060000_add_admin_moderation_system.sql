-- Phase 6: Admin & Moderation System
-- Admin Dashboard, Content Moderation, User Management, Audit Logs, Content Reports

-- Admin roles and permissions
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions TEXT[] DEFAULT ARRAY[]::text[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  permissions TEXT[] DEFAULT ARRAY[]::text[],
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content moderation
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL, -- post, comment, user, team, etc.
  content_id UUID NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  reason VARCHAR(100),
  severity VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, deleted
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content reports
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  reported_by UUID NOT NULL REFERENCES auth.users(id),
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, investigating, resolved, dismissed
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success', -- success, failure
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User actions log (for ban/suspend history)
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- warn, suspend, ban, unban
  reason TEXT,
  duration_days INT,
  expires_at TIMESTAMP WITH TIME ZONE,
  action_by UUID NOT NULL REFERENCES auth.users(id),
  appeal_text TEXT,
  appealed_at TIMESTAMP WITH TIME ZONE,
  appeal_status VARCHAR(20), -- pending, approved, rejected
  appeal_reviewed_by UUID REFERENCES auth.users(id),
  appeal_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform metrics and analytics
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL UNIQUE,
  total_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  total_posts INT DEFAULT 0,
  new_posts INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  new_comments INT DEFAULT 0,
  total_events INT DEFAULT 0,
  total_teams INT DEFAULT 0,
  reported_content INT DEFAULT 0,
  moderated_content INT DEFAULT 0,
  banned_users INT DEFAULT 0,
  suspended_users INT DEFAULT 0,
  system_errors INT DEFAULT 0,
  api_calls INT DEFAULT 0,
  average_response_time_ms FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health checks
CREATE TABLE IF NOT EXISTS system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type VARCHAR(50) NOT NULL, -- database, api, cache, storage, email
  status VARCHAR(20) NOT NULL DEFAULT 'healthy', -- healthy, degraded, unhealthy
  response_time_ms INT,
  error_message TEXT,
  check_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON moderation_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_expires_at ON user_actions(expires_at);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_date ON platform_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_created_at ON system_health(created_at DESC);

-- Triggers for timestamp updates
CREATE OR REPLACE FUNCTION update_moderation_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_content_reports_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

DROP TRIGGER IF EXISTS update_moderation_queue_timestamp ON moderation_queue;
CREATE TRIGGER update_moderation_queue_timestamp
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_moderation_queue_timestamp();

DROP TRIGGER IF EXISTS update_content_reports_timestamp ON content_reports;
CREATE TRIGGER update_content_reports_timestamp
  BEFORE UPDATE ON content_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_content_reports_timestamp();

-- RLS Policies
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

-- Only admins can view roles
CREATE POLICY "Admins can view admin roles" ON admin_roles
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE is_admin = true)
  );

-- Only the user can view their role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Only admins/moderators can view moderation queue
CREATE POLICY "Moderators can view moderation queue" ON moderation_queue
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles
      WHERE is_admin = true OR is_moderator = true
    )
  );

-- Only admins/moderators can update moderation queue
CREATE POLICY "Moderators can update moderation queue" ON moderation_queue
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles
      WHERE is_admin = true OR is_moderator = true
    )
  );

-- Users can view reports they created
CREATE POLICY "Users can view own reports" ON content_reports
  FOR SELECT USING (auth.uid() = reported_by OR
    auth.uid() IN (SELECT user_id FROM user_roles WHERE is_admin = true));

-- Users can create reports
CREATE POLICY "Users can report content" ON content_reports
  FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE is_admin = true)
  );

-- System inserts audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Users can view their own actions
CREATE POLICY "Users can view own actions" ON user_actions
  FOR SELECT USING (auth.uid() = user_id OR
    auth.uid() IN (SELECT user_id FROM user_roles WHERE is_admin = true));

-- Only admins can view metrics
CREATE POLICY "Admins can view platform metrics" ON platform_metrics
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE is_admin = true)
  );

-- Only admins can view system health
CREATE POLICY "Admins can view system health" ON system_health
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE is_admin = true)
  );

-- Insert default admin roles
INSERT INTO admin_roles (name, description, permissions)
VALUES
  ('super_admin', 'Full system access', ARRAY['all']),
  ('admin', 'Administrative access', ARRAY['manage_users', 'manage_content', 'view_analytics', 'manage_reports']),
  ('moderator', 'Content moderation', ARRAY['moderate_content', 'handle_reports', 'warn_users']),
  ('support', 'Customer support staff', ARRAY['view_tickets', 'help_users', 'view_analytics'])
ON CONFLICT (name) DO NOTHING;

COMMIT;
