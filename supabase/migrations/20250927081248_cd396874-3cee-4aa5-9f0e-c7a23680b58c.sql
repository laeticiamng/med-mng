-- Créer les données manquantes user_privacy_preferences (version UUID fixée)
INSERT INTO user_privacy_preferences (
  user_id,
  analytics_opt_in,
  retention_days,
  consent_version,
  pseudonymized_user_id
) 
SELECT 
  id,
  false, -- opt-out par défaut (RGPD compliant)
  30, -- 30 jours par défaut
  'v1.0',
  gen_random_uuid() -- UUID pour pseudonymized_user_id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_privacy_preferences)
ON CONFLICT (user_id) DO NOTHING;