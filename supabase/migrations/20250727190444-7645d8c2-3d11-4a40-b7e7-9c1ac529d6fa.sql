-- Ajouter les colonnes manquantes pour le système Suno
ALTER TABLE generated_music_tracks 
ADD COLUMN IF NOT EXISTS task_id TEXT,
ADD COLUMN IF NOT EXISTS suno_track_id TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS stream_url TEXT,
ADD COLUMN IF NOT EXISTS duration NUMERIC;

-- Créer des index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_task_id ON generated_music_tracks(task_id);
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_suno_track_id ON generated_music_tracks(suno_track_id);
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_user_id ON generated_music_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_status ON generated_music_tracks(generation_status);