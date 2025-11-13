-- ============================================
-- Configuration des Rapports Planifiés
-- ============================================
-- Ce script configure l'envoi automatique des rapports PDF quotidiens, hebdomadaires et mensuels

-- 1. Activer les extensions nécessaires (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Supprimer les anciens jobs s'ils existent
SELECT cron.unschedule('daily-security-report') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-security-report'
);

SELECT cron.unschedule('weekly-security-report') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-security-report'
);

SELECT cron.unschedule('monthly-security-report') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'monthly-security-report'
);

-- 3. Créer les jobs planifiés

-- Rapport quotidien - Tous les jours à 8h du matin
SELECT cron.schedule(
  'daily-security-report',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-scheduled-pdf-reports',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
        body:='{"reportType": "daily"}'::jsonb
    ) as request_id;
  $$
);

-- Rapport hebdomadaire - Tous les lundis à 9h du matin
SELECT cron.schedule(
  'weekly-security-report',
  '0 9 * * 1',
  $$
  SELECT
    net.http_post(
        url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-scheduled-pdf-reports',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
        body:='{"reportType": "weekly"}'::jsonb
    ) as request_id;
  $$
);

-- Rapport mensuel - Le 1er de chaque mois à 10h du matin
SELECT cron.schedule(
  'monthly-security-report',
  '0 10 1 * *',
  $$
  SELECT
    net.http_post(
        url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-scheduled-pdf-reports',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
        body:='{"reportType": "monthly"}'::jsonb
    ) as request_id;
  $$
);

-- 4. Vérifier que les jobs ont été créés
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  nodename
FROM cron.job 
WHERE jobname IN ('daily-security-report', 'weekly-security-report', 'monthly-security-report')
ORDER BY jobname;

-- ============================================
-- Instructions de personnalisation
-- ============================================

-- Pour désactiver un rapport :
-- SELECT cron.unschedule('daily-security-report');

-- Pour changer les horaires (format cron) :
-- minute hour day month weekday

-- Exemples :
-- '0 8 * * *'     = Tous les jours à 8h
-- '0 9 * * 1'     = Tous les lundis à 9h  
-- '0 10 1 * *'    = Le 1er de chaque mois à 10h
-- '*/30 * * * *'  = Toutes les 30 minutes

-- ============================================
-- Commandes utiles pour la gestion
-- ============================================

-- Voir l'historique d'exécution :
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname IN ('daily-security-report', 'weekly-security-report', 'monthly-security-report')
-- ORDER BY start_time DESC 
-- LIMIT 20;

-- Exécuter manuellement un rapport pour tester :
-- SELECT net.http_post(
--     url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-scheduled-pdf-reports',
--     headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
--     body:='{"reportType": "daily"}'::jsonb
-- );
