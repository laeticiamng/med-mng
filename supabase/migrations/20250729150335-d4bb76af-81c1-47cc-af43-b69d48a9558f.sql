-- Créer les tables et fonctions manquantes pour les playlists

-- Table pour les playlists (mise à jour)
CREATE TABLE IF NOT EXISTS public.med_mng_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  cover_image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les chansons dans les playlists
CREATE TABLE IF NOT EXISTS public.med_mng_playlist_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.med_mng_playlists(id) ON DELETE CASCADE NOT NULL,
  song_id uuid REFERENCES public.med_mng_songs(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL DEFAULT 0,
  added_at timestamp with time zone DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- Table pour les favoris utilisateur
CREATE TABLE IF NOT EXISTS public.med_mng_user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id uuid REFERENCES public.med_mng_songs(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Table pour l'historique d'écoute
CREATE TABLE IF NOT EXISTS public.med_mng_listening_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id uuid REFERENCES public.med_mng_songs(id) ON DELETE CASCADE NOT NULL,
  listen_date timestamp with time zone DEFAULT now(),
  listen_duration_seconds integer DEFAULT 0,
  completion_percentage numeric(5,2) DEFAULT 0,
  device_type text DEFAULT 'web',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.med_mng_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_listening_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour med_mng_playlists
CREATE POLICY "Users can manage their own playlists"
ON public.med_mng_playlists
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists"
ON public.med_mng_playlists
FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

-- RLS Policies pour med_mng_playlist_songs
CREATE POLICY "Users can manage songs in their playlists"
ON public.med_mng_playlist_songs
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.med_mng_playlists 
  WHERE med_mng_playlists.id = med_mng_playlist_songs.playlist_id 
  AND med_mng_playlists.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.med_mng_playlists 
  WHERE med_mng_playlists.id = med_mng_playlist_songs.playlist_id 
  AND med_mng_playlists.user_id = auth.uid()
));

CREATE POLICY "Users can view songs in accessible playlists"
ON public.med_mng_playlist_songs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.med_mng_playlists 
  WHERE med_mng_playlists.id = med_mng_playlist_songs.playlist_id 
  AND (med_mng_playlists.is_public = true OR med_mng_playlists.user_id = auth.uid())
));

-- RLS Policies pour med_mng_user_favorites
CREATE POLICY "Users can manage their own favorites"
ON public.med_mng_user_favorites
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies pour med_mng_listening_history
CREATE POLICY "Users can manage their own listening history"
ON public.med_mng_listening_history
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fonctions pour les playlists
CREATE OR REPLACE FUNCTION public.med_mng_create_playlist(
  playlist_name text,
  playlist_description text DEFAULT NULL,
  is_public boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_playlist_id uuid;
BEGIN
  INSERT INTO public.med_mng_playlists (
    user_id,
    name,
    description,
    is_public
  ) VALUES (
    auth.uid(),
    playlist_name,
    playlist_description,
    is_public
  ) RETURNING id INTO new_playlist_id;
  
  RETURN new_playlist_id;
END;
$$;

-- Fonction pour ajouter une chanson à une playlist
CREATE OR REPLACE FUNCTION public.med_mng_add_song_to_playlist(
  playlist_id uuid,
  song_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  max_position integer;
BEGIN
  -- Vérifier que l'utilisateur possède la playlist
  IF NOT EXISTS (
    SELECT 1 FROM public.med_mng_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Playlist not found or access denied';
  END IF;
  
  -- Obtenir la position maximale
  SELECT COALESCE(MAX(position), -1) + 1 INTO max_position
  FROM public.med_mng_playlist_songs
  WHERE playlist_id = med_mng_add_song_to_playlist.playlist_id;
  
  -- Insérer la chanson (ON CONFLICT DO NOTHING évite les doublons)
  INSERT INTO public.med_mng_playlist_songs (
    playlist_id,
    song_id,
    position
  ) VALUES (
    med_mng_add_song_to_playlist.playlist_id,
    med_mng_add_song_to_playlist.song_id,
    max_position
  ) ON CONFLICT (playlist_id, song_id) DO NOTHING;
END;
$$;

-- Fonction pour ajouter aux favoris
CREATE OR REPLACE FUNCTION public.med_mng_toggle_favorite(
  song_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_favorite boolean;
BEGIN
  -- Vérifier si déjà en favoris
  SELECT EXISTS (
    SELECT 1 FROM public.med_mng_user_favorites 
    WHERE user_id = auth.uid() AND song_id = med_mng_toggle_favorite.song_id
  ) INTO is_favorite;
  
  IF is_favorite THEN
    -- Retirer des favoris
    DELETE FROM public.med_mng_user_favorites 
    WHERE user_id = auth.uid() AND song_id = med_mng_toggle_favorite.song_id;
    RETURN false;
  ELSE
    -- Ajouter aux favoris
    INSERT INTO public.med_mng_user_favorites (user_id, song_id)
    VALUES (auth.uid(), med_mng_toggle_favorite.song_id);
    RETURN true;
  END IF;
END;
$$;

-- Fonction pour enregistrer l'historique d'écoute
CREATE OR REPLACE FUNCTION public.med_mng_log_listen(
  song_id uuid,
  duration_seconds integer DEFAULT 0,
  completion_percentage numeric DEFAULT 0,
  device_type text DEFAULT 'web'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.med_mng_listening_history (
    user_id,
    song_id,
    listen_duration_seconds,
    completion_percentage,
    device_type
  ) VALUES (
    auth.uid(),
    med_mng_log_listen.song_id,
    duration_seconds,
    completion_percentage,
    device_type
  );
END;
$$;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_med_mng_playlists_updated_at
  BEFORE UPDATE ON public.med_mng_playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.med_mng_update_updated_at();