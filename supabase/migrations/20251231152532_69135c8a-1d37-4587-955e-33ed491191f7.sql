-- Ajouter la colonne is_favorite à la table user_generated_music
ALTER TABLE public.user_generated_music 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;