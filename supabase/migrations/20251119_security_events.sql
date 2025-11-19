-- ========================================
-- 🔐 SECURITY EVENTS TABLE
-- ========================================
-- Stocke tous les événements de sécurité pour monitoring et alerting
-- Créé le: 2025-11-19
-- Version: 1.0

-- 1. Créer la table security_events
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Type d'événement de sécurité
  event_type TEXT NOT NULL CHECK (event_type IN (
    'UNAUTHORIZED_ACCESS',
    'FORBIDDEN_ACCESS',
    'RATE_LIMIT_EXCEEDED',
    'SUSPICIOUS_ACTIVITY',
    'DATA_EXPORT',
    'BULK_OPERATION',
    'API_KEY_USAGE',
    'WEBHOOK_SIGNATURE_FAIL',
    'SQL_INJECTION_ATTEMPT',
    'XSS_ATTEMPT',
    'BRUTE_FORCE',
    'ACCOUNT_TAKEOVER',
    'PRIVILEGE_ESCALATION'
  )),

  -- Niveau de sévérité
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  -- Utilisateur concerné (nullable pour événements anonymes)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Endpoint/fonction concernée
  endpoint TEXT NOT NULL,

  -- Informations de connexion
  ip_address TEXT,
  user_agent TEXT,

  -- Détails supplémentaires (JSON)
  details JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Créer les indexes pour performance
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_endpoint ON security_events(endpoint);

-- Index composite pour recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_security_events_user_endpoint ON security_events(user_id, endpoint, timestamp DESC);

-- Index pour détection de patterns suspects
CREATE INDEX IF NOT EXISTS idx_security_events_suspicious ON security_events(user_id, event_type, timestamp DESC)
WHERE event_type IN ('UNAUTHORIZED_ACCESS', 'FORBIDDEN_ACCESS', 'BRUTE_FORCE');

-- 3. Activer Row Level Security (RLS)
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Policy: Les admins peuvent tout voir
CREATE POLICY "Admins can view all security events"
  ON security_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy: Les utilisateurs peuvent voir leurs propres événements
CREATE POLICY "Users can view their own security events"
  ON security_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Service role peut tout insérer
CREATE POLICY "Service role can insert security events"
  ON security_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 4. Fonction de nettoyage automatique des vieux événements
CREATE OR REPLACE FUNCTION cleanup_old_security_events(hours_to_keep INTEGER DEFAULT 720)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les événements plus vieux que hours_to_keep (défaut: 30 jours)
  DELETE FROM security_events
  WHERE timestamp < NOW() - (hours_to_keep || ' hours')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

-- 5. Créer des vues utiles pour monitoring

-- Vue: Événements critiques récents
CREATE OR REPLACE VIEW security_events_critical AS
SELECT
  se.id,
  se.event_type,
  se.severity,
  se.user_id,
  u.email as user_email,
  se.endpoint,
  se.ip_address,
  se.details,
  se.timestamp
FROM security_events se
LEFT JOIN auth.users u ON se.user_id = u.id
WHERE se.severity IN ('high', 'critical')
  AND se.timestamp > NOW() - INTERVAL '7 days'
ORDER BY se.timestamp DESC;

-- Vue: Top utilisateurs avec le plus d'événements suspects
CREATE OR REPLACE VIEW security_top_suspicious_users AS
SELECT
  se.user_id,
  u.email,
  COUNT(*) as event_count,
  COUNT(DISTINCT se.event_type) as unique_event_types,
  MAX(se.timestamp) as last_event,
  json_agg(DISTINCT se.event_type) as event_types
FROM security_events se
LEFT JOIN auth.users u ON se.user_id = u.id
WHERE se.timestamp > NOW() - INTERVAL '7 days'
  AND se.event_type IN ('UNAUTHORIZED_ACCESS', 'FORBIDDEN_ACCESS', 'BRUTE_FORCE', 'SUSPICIOUS_ACTIVITY')
GROUP BY se.user_id, u.email
HAVING COUNT(*) >= 3
ORDER BY event_count DESC
LIMIT 100;

-- Vue: Statistiques par endpoint
CREATE OR REPLACE VIEW security_stats_by_endpoint AS
SELECT
  endpoint,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_events,
  COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_events,
  COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_events,
  COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_events,
  MAX(timestamp) as last_event
FROM security_events
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY endpoint
ORDER BY total_events DESC;

-- Vue: Timeline des événements (par heure)
CREATE OR REPLACE VIEW security_events_timeline AS
SELECT
  date_trunc('hour', timestamp) as hour,
  event_type,
  severity,
  COUNT(*) as event_count
FROM security_events
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY date_trunc('hour', timestamp), event_type, severity
ORDER BY hour DESC;

-- 6. Fonction pour détecter les patterns d'attaque
CREATE OR REPLACE FUNCTION detect_attack_patterns(
  check_user_id UUID DEFAULT NULL,
  time_window_minutes INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  pattern TEXT,
  event_count BIGINT,
  first_event TIMESTAMPTZ,
  last_event TIMESTAMPTZ,
  risk_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    se.user_id,
    u.email,
    CASE
      WHEN COUNT(*) FILTER (WHERE se.event_type = 'BRUTE_FORCE') >= 5 THEN 'Brute Force Attack'
      WHEN COUNT(*) FILTER (WHERE se.event_type IN ('UNAUTHORIZED_ACCESS', 'FORBIDDEN_ACCESS')) >= 3 THEN 'Multiple Auth Failures'
      WHEN COUNT(*) FILTER (WHERE se.event_type = 'RATE_LIMIT_EXCEEDED') >= 10 THEN 'Rate Limit Abuse'
      WHEN COUNT(*) FILTER (WHERE se.event_type IN ('SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT')) >= 1 THEN 'Injection Attack'
      ELSE 'Suspicious Activity'
    END as pattern,
    COUNT(*) as event_count,
    MIN(se.timestamp) as first_event,
    MAX(se.timestamp) as last_event,
    CASE
      WHEN COUNT(*) >= 10 THEN 'CRITICAL'
      WHEN COUNT(*) >= 5 THEN 'HIGH'
      WHEN COUNT(*) >= 3 THEN 'MEDIUM'
      ELSE 'LOW'
    END as risk_level
  FROM security_events se
  LEFT JOIN auth.users u ON se.user_id = u.id
  WHERE se.timestamp > NOW() - (time_window_minutes || ' minutes')::INTERVAL
    AND (check_user_id IS NULL OR se.user_id = check_user_id)
  GROUP BY se.user_id, u.email
  HAVING COUNT(*) >= 3
  ORDER BY event_count DESC;
END;
$$;

-- 7. Ajouter des commentaires pour documentation
COMMENT ON TABLE security_events IS 'Stocke tous les événements de sécurité pour monitoring et alerting';
COMMENT ON COLUMN security_events.event_type IS 'Type d''événement de sécurité (UNAUTHORIZED_ACCESS, BRUTE_FORCE, etc.)';
COMMENT ON COLUMN security_events.severity IS 'Niveau de sévérité: low, medium, high, critical';
COMMENT ON COLUMN security_events.details IS 'Informations supplémentaires au format JSON';
COMMENT ON FUNCTION cleanup_old_security_events IS 'Nettoie les événements de sécurité plus vieux que X heures (défaut: 720h = 30 jours)';
COMMENT ON FUNCTION detect_attack_patterns IS 'Détecte les patterns d''attaque basés sur les événements récents';

-- 8. Accorder les permissions
GRANT SELECT ON security_events TO authenticated;
GRANT ALL ON security_events TO service_role;
GRANT SELECT ON security_events_critical TO authenticated;
GRANT SELECT ON security_top_suspicious_users TO authenticated;
GRANT SELECT ON security_stats_by_endpoint TO authenticated;
GRANT SELECT ON security_events_timeline TO authenticated;

-- ========================================
-- FIN DE LA MIGRATION
-- ========================================

-- Pour tester la migration:
-- SELECT * FROM security_events LIMIT 10;
-- SELECT * FROM security_events_critical;
-- SELECT * FROM detect_attack_patterns();
-- SELECT cleanup_old_security_events(720); -- Nettoyer événements > 30 jours
