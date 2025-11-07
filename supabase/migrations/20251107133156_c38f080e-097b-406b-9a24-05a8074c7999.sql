-- Table pour stocker les alertes de recommandations
CREATE TABLE IF NOT EXISTS recommendation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  impact TEXT NOT NULL,
  historical_score NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  alert_triggered BOOLEAN DEFAULT FALSE,
  alert_triggered_at TIMESTAMPTZ,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_recommendation_alerts_user ON recommendation_alerts(user_id);
CREATE INDEX idx_recommendation_alerts_active ON recommendation_alerts(user_id, dismissed, applied) WHERE NOT dismissed AND NOT applied;

-- RLS
ALTER TABLE recommendation_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
  ON recommendation_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON recommendation_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON recommendation_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON recommendation_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour vérifier et créer des alertes
CREATE OR REPLACE FUNCTION check_recommendation_alerts()
RETURNS void AS $$
DECLARE
  alert_record RECORD;
  days_since_first_seen INTEGER;
BEGIN
  -- Pour chaque alerte active (non appliquée, non dismissée)
  FOR alert_record IN 
    SELECT * FROM recommendation_alerts 
    WHERE NOT dismissed 
      AND NOT applied 
      AND NOT alert_triggered
  LOOP
    -- Calculer le nombre de jours depuis la première détection
    days_since_first_seen := EXTRACT(DAY FROM (NOW() - alert_record.first_seen_at));
    
    -- Si > 7 jours et score > 70, déclencher l'alerte
    IF days_since_first_seen >= 7 AND alert_record.historical_score > 70 THEN
      UPDATE recommendation_alerts
      SET alert_triggered = TRUE,
          alert_triggered_at = NOW(),
          last_checked_at = NOW()
      WHERE id = alert_record.id;
      
      RAISE NOTICE 'Alert triggered for recommendation: %', alert_record.title;
    ELSE
      -- Juste mettre à jour le timestamp de vérification
      UPDATE recommendation_alerts
      SET last_checked_at = NOW()
      WHERE id = alert_record.id;
    END IF;
  END LOOP;
  
  -- Marquer comme appliquées les recommandations qui ont été réellement appliquées
  UPDATE recommendation_alerts ra
  SET applied = TRUE,
      applied_at = NOW()
  FROM applied_recommendations ar
  WHERE ra.user_id = ar.user_id
    AND ra.category = ar.category
    AND ra.title = ar.title
    AND NOT ra.applied;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger pour mettre à jour automatiquement last_checked_at
CREATE OR REPLACE FUNCTION update_recommendation_alert_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_checked_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_recommendation_alerts_timestamp
  BEFORE UPDATE ON recommendation_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_recommendation_alert_timestamp();