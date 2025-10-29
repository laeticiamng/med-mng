-- Créer la vue med_mng_view_library pour afficher la bibliothèque utilisateur
CREATE OR REPLACE VIEW med_mng_view_library AS
SELECT 
  s.id,
  s.title,
  s.suno_audio_id,
  s.meta,
  s.created_at,
  us.created_at as added_to_library_at,
  us.user_id,
  EXISTS(
    SELECT 1 FROM med_mng_song_likes sl 
    WHERE sl.song_id = s.id 
    AND sl.user_id = us.user_id
  ) as is_liked
FROM med_mng_songs s
INNER JOIN med_mng_user_songs us ON s.id = us.song_id
ORDER BY us.created_at DESC;

-- Ajouter un commentaire pour documenter la vue
COMMENT ON VIEW med_mng_view_library IS 'Vue pour afficher la bibliothèque musicale des utilisateurs avec les informations des chansons et le statut de like';

-- Vérifier que les fonctions RPC existent pour ajouter/retirer de la bibliothèque
-- Si elles n'existent pas, les créer

-- Fonction pour ajouter une chanson à la bibliothèque
CREATE OR REPLACE FUNCTION med_mng_add_to_library(song_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO med_mng_user_songs (user_id, song_id)
  VALUES (auth.uid(), song_id)
  ON CONFLICT (user_id, song_id) DO NOTHING;
END;
$$;

-- Fonction pour retirer une chanson de la bibliothèque
CREATE OR REPLACE FUNCTION med_mng_remove_from_library(song_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM med_mng_user_songs
  WHERE user_id = auth.uid() AND song_id = med_mng_remove_from_library.song_id;
END;
$$;