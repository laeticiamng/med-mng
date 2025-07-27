-- Système de playlists complet avec drag & drop et CRUD
CREATE TABLE IF NOT EXISTS public.med_mng_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  song_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.med_mng_playlists ENABLE ROW LEVEL SECURITY;

-- RLS policies pour playlists
CREATE POLICY "Users can view their own playlists" 
ON public.med_mng_playlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" 
ON public.med_mng_playlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
ON public.med_mng_playlists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
ON public.med_mng_playlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Table de jointure playlist-songs avec ordre pour drag & drop
CREATE TABLE IF NOT EXISTS public.med_mng_playlist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.med_mng_playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- Enable RLS
ALTER TABLE public.med_mng_playlist_songs ENABLE ROW LEVEL SECURITY;

-- RLS policies pour playlist_songs
CREATE POLICY "Users can view songs in their playlists" 
ON public.med_mng_playlist_songs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.med_mng_playlists 
  WHERE id = playlist_id AND user_id = auth.uid()
));

CREATE POLICY "Users can add songs to their playlists" 
ON public.med_mng_playlist_songs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.med_mng_playlists 
  WHERE id = playlist_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update songs in their playlists" 
ON public.med_mng_playlist_songs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.med_mng_playlists 
  WHERE id = playlist_id AND user_id = auth.uid()
));

CREATE POLICY "Users can remove songs from their playlists" 
ON public.med_mng_playlist_songs 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.med_mng_playlists 
  WHERE id = playlist_id AND user_id = auth.uid()
));

-- Fonction pour mettre à jour le nombre de chansons dans une playlist
CREATE OR REPLACE FUNCTION update_playlist_song_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.med_mng_playlists 
    SET song_count = song_count + 1, updated_at = now()
    WHERE id = NEW.playlist_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.med_mng_playlists 
    SET song_count = song_count - 1, updated_at = now()
    WHERE id = OLD.playlist_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers pour maintenir le compteur de chansons
CREATE TRIGGER playlist_song_count_insert
  AFTER INSERT ON public.med_mng_playlist_songs
  FOR EACH ROW EXECUTE FUNCTION update_playlist_song_count();

CREATE TRIGGER playlist_song_count_delete
  AFTER DELETE ON public.med_mng_playlist_songs
  FOR EACH ROW EXECUTE FUNCTION update_playlist_song_count();

-- Trigger pour mise à jour automatique updated_at
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.med_mng_playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table pour les paroles synchronisées avec timestamps
CREATE TABLE IF NOT EXISTS public.med_mng_synchronized_lyrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  lyrics_data JSONB NOT NULL, -- Format: [{"time": 12.5, "text": "Ligne de paroles"}]
  source TEXT DEFAULT 'suno', -- suno, manual, ai_generated
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(song_id)
);

-- Enable RLS
ALTER TABLE public.med_mng_synchronized_lyrics ENABLE ROW LEVEL SECURITY;

-- RLS policies pour synchronized_lyrics (lectures publiques, écritures restreintes)
CREATE POLICY "Anyone can view synchronized lyrics" 
ON public.med_mng_synchronized_lyrics 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage synchronized lyrics" 
ON public.med_mng_synchronized_lyrics 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Trigger pour mise à jour automatique updated_at
CREATE TRIGGER update_synchronized_lyrics_updated_at
  BEFORE UPDATE ON public.med_mng_synchronized_lyrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Vue pour obtenir les playlists avec leurs détails
CREATE OR REPLACE VIEW public.med_mng_view_playlists AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.description,
  p.cover_url,
  p.is_public,
  p.song_count,
  p.created_at,
  p.updated_at,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'song_id', ps.song_id,
        'position', ps.position,
        'added_at', ps.added_at,
        'title', s.title,
        'suno_audio_id', s.suno_audio_id
      ) ORDER BY ps.position
    ) FILTER (WHERE ps.song_id IS NOT NULL),
    '[]'::jsonb
  ) as songs
FROM public.med_mng_playlists p
LEFT JOIN public.med_mng_playlist_songs ps ON p.id = ps.playlist_id
LEFT JOIN public.med_mng_songs s ON ps.song_id = s.id
GROUP BY p.id, p.user_id, p.name, p.description, p.cover_url, p.is_public, p.song_count, p.created_at, p.updated_at;

-- RLS pour la vue
ALTER VIEW public.med_mng_view_playlists SET (security_invoker = true);

-- Fonctions RPC pour la gestion des playlists
CREATE OR REPLACE FUNCTION public.med_mng_create_playlist(
  playlist_name TEXT,
  playlist_description TEXT DEFAULT NULL,
  is_public BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_playlist_id UUID;
BEGIN
  INSERT INTO public.med_mng_playlists (user_id, name, description, is_public)
  VALUES (auth.uid(), playlist_name, playlist_description, is_public)
  RETURNING id INTO new_playlist_id;
  
  RETURN new_playlist_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.med_mng_add_song_to_playlist(
  playlist_id UUID,
  song_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_position INTEGER;
BEGIN
  -- Vérifier que l'utilisateur possède la playlist
  IF NOT EXISTS (
    SELECT 1 FROM public.med_mng_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Playlist not found or access denied';
  END IF;
  
  -- Obtenir la prochaine position
  SELECT COALESCE(MAX(position), -1) + 1 INTO max_position
  FROM public.med_mng_playlist_songs
  WHERE med_mng_playlist_songs.playlist_id = add_song_to_playlist.playlist_id;
  
  -- Ajouter la chanson
  INSERT INTO public.med_mng_playlist_songs (playlist_id, song_id, position)
  VALUES (playlist_id, song_id, max_position)
  ON CONFLICT (playlist_id, song_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.med_mng_remove_song_from_playlist(
  playlist_id UUID,
  song_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur possède la playlist
  IF NOT EXISTS (
    SELECT 1 FROM public.med_mng_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Playlist not found or access denied';
  END IF;
  
  DELETE FROM public.med_mng_playlist_songs
  WHERE med_mng_playlist_songs.playlist_id = remove_song_from_playlist.playlist_id 
    AND med_mng_playlist_songs.song_id = remove_song_from_playlist.song_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.med_mng_reorder_playlist_songs(
  playlist_id UUID,
  song_orders JSONB -- Format: [{"song_id": "uuid", "position": 0}, ...]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  song_order JSONB;
BEGIN
  -- Vérifier que l'utilisateur possède la playlist
  IF NOT EXISTS (
    SELECT 1 FROM public.med_mng_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Playlist not found or access denied';
  END IF;
  
  -- Mettre à jour les positions
  FOR song_order IN SELECT * FROM jsonb_array_elements(song_orders)
  LOOP
    UPDATE public.med_mng_playlist_songs
    SET position = (song_order->>'position')::INTEGER
    WHERE med_mng_playlist_songs.playlist_id = reorder_playlist_songs.playlist_id
      AND med_mng_playlist_songs.song_id = (song_order->>'song_id')::UUID;
  END LOOP;
END;
$$;