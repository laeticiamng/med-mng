-- Déclencher la complétion des compétences OIC via un appel HTTP interne
SELECT net.http_post(
  url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/complete-oic-competences',
  headers := '{"Content-Type": "application/json"}'::jsonb,
  body := '{"action": "complete_all"}'::jsonb
) as completion_trigger;