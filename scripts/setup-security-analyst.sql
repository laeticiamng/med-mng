-- ============================================
-- Script: Configuration Rôle Security Analyst
-- ============================================
-- Ce script assigne le rôle security_analyst à des utilisateurs
-- et configure le job pg_cron pour les alertes automatiques

-- ============================================
-- PARTIE 1: Assigner le rôle security_analyst
-- ============================================

-- Exemple 1: Assigner à un utilisateur spécifique
-- Remplacer 'analyst@example.com' par l'email réel

INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'analyst@example.com'),
  'security_analyst'::app_role
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Exemple 2: Assigner à plusieurs utilisateurs
-- Décommenter et modifier les emails

/*
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'security_analyst'::app_role
FROM auth.users
WHERE email IN (
  'analyst1@example.com',
  'analyst2@example.com',
  'analyst3@example.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
*/

-- Vérifier les assignations
SELECT 
  u.email,
  ur.role,
  ur.assigned_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'security_analyst'
ORDER BY ur.assigned_at DESC;

-- ============================================
-- PARTIE 2: Configuration du Job pg_cron
-- ============================================

-- Vérifier que les extensions sont activées
SELECT 
  extname,
  extversion,
  CASE WHEN extname IS NOT NULL THEN '✅ Activée' ELSE '❌ Manquante' END as status
FROM pg_extension 
WHERE extname IN ('pg_cron', 'pg_net');

-- Si les extensions ne sont pas activées, les activer:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer le job cron pour exécution toutes les heures
SELECT cron.schedule(
  'security-alerts-hourly',
  '0 * * * *',  -- Toutes les heures à la minute 0
  $$
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    ),
    body := jsonb_build_object('time', now()::text)
  ) AS request_id;
  $$
);

-- Vérifier que le job a été créé
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  CASE WHEN active THEN '✅ Actif' ELSE '❌ Inactif' END as status
FROM cron.job
WHERE jobname LIKE 'security-alerts%';

-- ============================================
-- PARTIE 3: Test manuel du système
-- ============================================

-- Test 1: Vérifier l'accès aux logs d'audit
SELECT COUNT(*) as total_logs
FROM share_audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Test 2: Exécuter manuellement la fonction d'alertes
SELECT net.http_post(
  url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-alerts',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  ),
  body := jsonb_build_object('time', now()::text)
) AS request_id;

-- Test 3: Créer des logs de test pour déclencher une alerte
-- ATTENTION: Ceci créera 12 entrées de suppression pour tester les alertes
/*
DO $$
DECLARE
  test_user_id uuid := (SELECT id FROM auth.users LIMIT 1);
BEGIN
  FOR i IN 1..12 LOOP
    INSERT INTO share_audit_logs (
      user_id,
      user_email,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      test_user_id,
      (SELECT email FROM auth.users WHERE id = test_user_id),
      'delete',
      'sitemap',
      'test-' || i || '-' || extract(epoch from now()),
      jsonb_build_object('test', true, 'timestamp', now())
    );
  END LOOP;
  
  RAISE NOTICE '✅ 12 logs de test créés pour déclencher une alerte de suppression massive';
END $$;
*/

-- ============================================
-- PARTIE 4: Monitoring et Validation
-- ============================================

-- Voir l'historique d'exécution du job cron
SELECT 
  runid,
  status,
  return_message,
  start_time,
  end_time,
  EXTRACT(EPOCH FROM (end_time - start_time)) as duration_seconds
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'security-alerts-hourly')
ORDER BY start_time DESC
LIMIT 10;

-- Statistiques des logs d'audit des dernières 24h
SELECT 
  action,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM share_audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY action
ORDER BY count DESC;

-- Activités suspectes potentielles (suppressions massives)
SELECT 
  user_email,
  COUNT(*) as deletion_count,
  MIN(created_at) as first_deletion,
  MAX(created_at) as last_deletion
FROM share_audit_logs
WHERE action = 'delete'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_email, user_id
HAVING COUNT(*) >= 5
ORDER BY deletion_count DESC;

-- ============================================
-- PARTIE 5: Commandes de gestion utiles
-- ============================================

-- Désactiver temporairement le job
-- UPDATE cron.job SET active = false WHERE jobname = 'security-alerts-hourly';

-- Réactiver le job
-- UPDATE cron.job SET active = true WHERE jobname = 'security-alerts-hourly';

-- Supprimer le job
-- SELECT cron.unschedule('security-alerts-hourly');

-- Modifier la fréquence (d'abord supprimer puis recréer)
-- SELECT cron.unschedule('security-alerts-hourly');
-- SELECT cron.schedule('security-alerts-hourly', '*/30 * * * *', $$...$$);

-- Retirer le rôle d'un utilisateur
-- DELETE FROM public.user_roles 
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'analyst@example.com')
--   AND role = 'security_analyst';

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- 
-- Prochaines étapes:
-- 1. Modifier les emails dans PARTIE 1 et exécuter
-- 2. Exécuter PARTIE 2 pour créer le job cron
-- 3. Utiliser PARTIE 3 pour tester le système
-- 4. Utiliser PARTIE 4 pour surveiller l'activité
-- 
-- Documentation:
-- - /docs/SECURITY_ROLES_SETUP.md
-- - /docs/SECURITY_CRON_SETUP.md
-- - /docs/SECURITY_ALERTS_GUIDE.md
