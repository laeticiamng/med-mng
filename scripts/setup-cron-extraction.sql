-- Script SQL pour automatiser l'extraction UNESS via cron
-- À exécuter dans le SQL Editor de Supabase

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Extraction quotidienne complète à 2h du matin
SELECT cron.schedule(
  'uness-daily-complete-extraction',
  '0 2 * * *', -- Tous les jours à 2h00
  $$
  -- Lancer EDN
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.com/functions/v1/extract-uness-enhanced',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    ),
    body := jsonb_build_object(
      'action', 'start',
      'extraction_type', 'edn',
      'batch_size', 50,
      'max_concurrent', 6
    )
  );
  
  -- Pause de 30 secondes
  PERFORM pg_sleep(30);
  
  -- Lancer OIC
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.com/functions/v1/extract-uness-enhanced',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    ),
    body := jsonb_build_object(
      'action', 'start',
      'extraction_type', 'oic',
      'batch_size', 100,
      'max_concurrent', 10
    )
  );
  
  -- Pause de 30 secondes
  PERFORM pg_sleep(30);
  
  -- Lancer ECOS
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.com/functions/v1/extract-uness-enhanced',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    ),
    body := jsonb_build_object(
      'action', 'start',
      'extraction_type', 'ecos',
      'batch_size', 30,
      'max_concurrent', 5
    )
  );
  $$
);

-- 2. Extraction OIC intensive toutes les 6 heures (pour les 4,872 compétences)
SELECT cron.schedule(
  'uness-oic-intensive-extraction',
  '0 */6 * * *', -- Toutes les 6 heures
  $$
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.com/functions/v1/extract-uness-enhanced',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    ),
    body := jsonb_build_object(
      'action', 'start',
      'extraction_type', 'oic',
      'batch_size', 150,
      'max_concurrent', 12
    )
  ) as request_id;
  $$
);

-- 3. Extraction de maintenance hebdomadaire (dimanche à minuit)
SELECT cron.schedule(
  'uness-weekly-maintenance',
  '0 0 * * 0', -- Dimanche à minuit
  $$
  -- Lancer une extraction complète avec paramètres optimisés pour la maintenance
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.com/functions/v1/extract-uness-enhanced',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    ),
    body := jsonb_build_object(
      'action', 'start',
      'extraction_type', 'complete',
      'batch_size', 200,
      'max_concurrent', 15
    )
  ) as weekly_request_id;
  $$
);

-- Consulter les jobs cron actifs
SELECT jobname, schedule, command FROM cron.job WHERE jobname LIKE 'uness%';

-- Commandes de gestion des cron jobs:
-- Pour voir tous les jobs: SELECT * FROM cron.job;
-- Pour supprimer un job: SELECT cron.unschedule('nom-du-job');
-- Pour modifier un job: utiliser cron.unschedule puis cron.schedule avec les nouveaux paramètres

-- Log des exécutions cron
-- SELECT * FROM cron.job_run_details WHERE jobname LIKE 'uness%' ORDER BY start_time DESC LIMIT 10;