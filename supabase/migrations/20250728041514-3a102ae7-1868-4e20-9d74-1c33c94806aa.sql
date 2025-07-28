-- Ajouter la colonne manquante original_task_id à la table generated_music_tracks
ALTER TABLE public.generated_music_tracks 
ADD COLUMN IF NOT EXISTS original_task_id TEXT;

-- Ajouter un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_original_task_id 
ON public.generated_music_tracks(original_task_id);