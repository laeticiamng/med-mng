-- Vague sécurité F66-MM (05.10.2026) : la clé service_role écrite en clair ici (migration déjà
-- appliquée le 04.07.2025) a été retirée du fichier. Elle reste dans l'historique git : elle doit être
-- considérée comme compromise et renouvelée (FINALISATION.md, F66-MM).
-- Appeler la fonction de mise à jour des contenus uniques
SELECT extensions.http_post(
  url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/update-edn-unique-content',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer CLE_DE_SERVICE_RETIREE_DU_DEPOT"}'::jsonb,
  body := '{}'::jsonb
) as request_id;
