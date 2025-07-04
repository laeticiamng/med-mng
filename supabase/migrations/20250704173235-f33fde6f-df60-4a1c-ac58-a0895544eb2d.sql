-- Activer les extensions nécessaires pour l'automatisation
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer un cron job pour lancer l'extraction OIC de manière autonome
SELECT cron.schedule(
  'extraction-oic-autonome',
  '0 */6 * * *', -- Toutes les 6 heures
  $$
  SELECT
    net.http_post(
        url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/auto-extract-oic',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
        body:='{"auto_trigger": true, "timestamp": "now()"}'::jsonb
    ) as request_id;
  $$
);

-- Créer aussi un déclencheur immédiat (une seule fois)
SELECT cron.schedule(
  'extraction-oic-immediate',
  '* * * * *', -- Chaque minute pendant 5 minutes seulement pour démarrage immédiat
  $$
  SELECT
    net.http_post(
        url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/auto-extract-oic',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
        body:='{"immediate_trigger": true, "timestamp": "now()"}'::jsonb
    ) as request_id;
  $$
);

-- Programmer l'arrêt du déclencheur immédiat après 10 minutes
SELECT cron.schedule(
  'stop-immediate-trigger',
  '10 * * * *', -- 10 minutes après l'heure
  $$
  SELECT cron.unschedule('extraction-oic-immediate');
  $$
);