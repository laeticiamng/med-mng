-- ============================================
-- Configuration des Rapports Hebdomadaires
-- ============================================
-- Ce script configure l'envoi automatique des rapports hebdomadaires de sécurité

-- 1. Activer les extensions nécessaires (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Supprimer l'ancien job s'il existe
SELECT cron.unschedule('weekly-security-report') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-security-report'
);

-- 3. Créer le job pour l'envoi hebdomadaire
-- Par défaut : tous les lundis à 9h du matin
SELECT cron.schedule(
  'weekly-security-report',
  '0 9 * * 1', -- Format cron: minute heure jour_du_mois mois jour_de_la_semaine
  $$
  SELECT
    net.http_post(
        url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/weekly-security-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- 4. Vérifier que le job a été créé
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  nodename
FROM cron.job 
WHERE jobname = 'weekly-security-report';

-- ============================================
-- Instructions de modification de la fréquence
-- ============================================

-- Pour changer la fréquence, utilisez l'une de ces options :

-- Quotidien à 8h du matin :
-- '0 8 * * *'

-- Tous les lundis et jeudis à 9h :
-- '0 9 * * 1,4'

-- Le 1er de chaque mois à 9h :
-- '0 9 1 * *'

-- Toutes les heures :
-- '0 * * * *'

-- ============================================
-- Commandes utiles pour la gestion
-- ============================================

-- Voir l'historique d'exécution :
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'weekly-security-report')
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- Désactiver le job :
-- SELECT cron.unschedule('weekly-security-report');

-- Exécuter manuellement pour tester (via psql ou SQL Editor) :
-- SELECT net.http_post(
--     url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/weekly-security-report',
--     headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
--     body:='{}'::jsonb
-- );
