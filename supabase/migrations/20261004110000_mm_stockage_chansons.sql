-- MED MNG — conservation des chansons générées (audit de finalisation, 04.10.2026)
--
-- CONSTAT : l'URL audio enregistrée est celle du fichier temporaire de Suno
-- (tempfile.aiquickdraw.com). Suno ne conserve les fichiers que 14 jours
-- (https://docs.sunoapi.org/suno-api/generate-music : « Generated files are
-- retained for 14 days ») : passé ce délai, les chansons de « Ma bibliothèque »
-- ne se lisent plus.
--
-- Compartiment public dédié à MED MNG (le compartiment « music-tracks » est
-- partagé avec EmotionsCare). Écriture : uniquement le serveur (clé de service,
-- _shared/mm-suno-enregistrement.ts → copierAudioDansStockage) ; aucune policy
-- d'écriture pour anon/authenticated. Lecture : URL publique non devinable
-- (<user_id>/<id de piste Suno>.mp3), comme l'URL Suno qu'elle remplace.
--
-- À appliquer AVANT de déployer mm-suno-callback et mm-music-status (sinon la
-- copie échoue proprement et l'URL Suno est conservée, comme aujourd'hui).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mm-chansons', 'mm-chansons', true, 26214400, ARRAY['audio/mpeg', 'audio/mp3'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
