-- Table de configuration des alertes
CREATE TABLE IF NOT EXISTS quality_alert_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  min_severity TEXT NOT NULL DEFAULT 'high' CHECK (min_severity IN ('low', 'medium', 'high', 'critical')),
  email_recipients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  notification_frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily')),
  digest_enabled BOOLEAN NOT NULL DEFAULT false,
  digest_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly')),
  digest_day INTEGER CHECK (digest_day BETWEEN 0 AND 6), -- 0=dimanche, 6=samedi pour weekly
  digest_time TIME NOT NULL DEFAULT '09:00:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Index pour les recherches par user_id
CREATE INDEX IF NOT EXISTS idx_quality_alert_config_user_id ON quality_alert_config(user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_quality_alert_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quality_alert_config_updated_at
  BEFORE UPDATE ON quality_alert_config
  FOR EACH ROW
  EXECUTE FUNCTION update_quality_alert_config_updated_at();

-- RLS Policies
ALTER TABLE quality_alert_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own config"
  ON quality_alert_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config"
  ON quality_alert_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config"
  ON quality_alert_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own config"
  ON quality_alert_config FOR DELETE
  USING (auth.uid() = user_id);