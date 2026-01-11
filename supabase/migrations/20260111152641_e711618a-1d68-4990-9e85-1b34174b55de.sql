
-- Nettoyer le track bloqué en "generating" depuis plus de 30 minutes
UPDATE generated_music_tracks 
SET generation_status = 'timeout', 
    updated_at = now()
WHERE generation_status = 'generating' 
  AND created_at < now() - interval '30 minutes';

-- Créer un index pour améliorer les requêtes de status
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_status 
ON generated_music_tracks(generation_status, created_at DESC);

-- Créer un index pour les recherches par task_id
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_task_id 
ON generated_music_tracks(task_id);
