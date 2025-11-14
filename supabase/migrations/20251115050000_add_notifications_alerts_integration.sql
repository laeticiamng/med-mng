-- Notifications & Alerts Integration
-- Comprehensive notification management and alert preferences

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  newsletter BOOLEAN DEFAULT true,
  instant_alerts BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES notification_categories(id) ON DELETE SET NULL,
  subscribed BOOLEAN DEFAULT true,
  frequency VARCHAR(50) DEFAULT 'instant', -- instant, daily, weekly, never
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL, -- points_threshold, streak_milestone, event_upcoming, etc.
  trigger_condition JSONB NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- email, push, in_app, sms
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50),
  message TEXT,
  action_taken VARCHAR(50),
  status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, failed, opened
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_user_id ON notification_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_user_id ON alert_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_created_at ON alert_logs(created_at DESC);

-- Triggers
CREATE OR REPLACE FUNCTION update_notification_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_alert_rules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

DROP TRIGGER IF EXISTS update_notification_preferences_timestamp ON notification_preferences;
CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_timestamp();

DROP TRIGGER IF EXISTS update_alert_rules_timestamp ON alert_rules;
CREATE TRIGGER update_alert_rules_timestamp
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_rules_timestamp();

-- RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage subscriptions" ON notification_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update subscriptions" ON notification_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can subscribe" ON notification_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own rules" ON alert_rules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own rules" ON alert_rules
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create rules" ON alert_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own rules" ON alert_rules
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own logs" ON alert_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO notification_categories (name, description)
VALUES
  ('teams', 'Team updates and collaborations'),
  ('events', 'Event reminders and updates'),
  ('gamification', 'Badges, points, and achievements'),
  ('posts', 'Post and comment notifications'),
  ('wellness', 'Wellness activity reminders'),
  ('learning', 'Learning progress and updates'),
  ('security', 'Account security alerts'),
  ('system', 'System and platform updates')
ON CONFLICT (name) DO NOTHING;

COMMIT;
