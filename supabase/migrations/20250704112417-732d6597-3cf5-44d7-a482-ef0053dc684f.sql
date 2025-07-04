-- Appeler la fonction de mise à jour des contenus uniques
SELECT net.http_post(
  url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/update-edn-unique-content',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjgxMTgyNywiZXhwIjoyMDU4Mzg3ODI3fQ.lflBzNdx2DDLYagE2nT_Rk-jxnWmcKz43Q6Nc5uw5zk"}'::jsonb,
  body := '{}'::jsonb
) as request_id;