-- Permettre user_id NULL pour les utilisateurs anonymes
ALTER TABLE generated_music_tracks ALTER COLUMN user_id DROP NOT NULL;

-- Ajouter un index pour améliorer les performances avec les callbacks
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_callback_lookup 
ON generated_music_tracks(suno_track_id, task_id, original_task_id);

-- Ajouter un index pour les requêtes temps réel
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_recent_completed 
ON generated_music_tracks(generation_status, created_at) 
WHERE generation_status = 'completed';