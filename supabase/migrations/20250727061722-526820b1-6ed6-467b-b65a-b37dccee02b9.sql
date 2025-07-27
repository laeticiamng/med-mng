-- Création des tables de playlists et paroles synchronisées sans la vue
CREATE TABLE IF NOT EXISTS public.med_mng_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
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

-- Table pour les paroles synchronisées avec timestamps
CREATE TABLE IF NOT EXISTS public.med_mng_synchronized_lyrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  lyrics_data JSONB NOT NULL,
  source TEXT DEFAULT 'suno',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(song_id)
);

-- Enable RLS
ALTER TABLE public.med_mng_synchronized_lyrics ENABLE ROW LEVEL SECURITY;

-- RLS policies pour synchronized_lyrics
CREATE POLICY "Anyone can view synchronized lyrics" 
ON public.med_mng_synchronized_lyrics 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage synchronized lyrics" 
ON public.med_mng_synchronized_lyrics 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

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
  IF NOT EXISTS (
    SELECT 1 FROM public.med_mng_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Playlist not found or access denied';
  END IF;
  
  SELECT COALESCE(MAX(position), -1) + 1 INTO max_position
  FROM public.med_mng_playlist_songs
  WHERE med_mng_playlist_songs.playlist_id = add_song_to_playlist.playlist_id;
  
  INSERT INTO public.med_mng_playlist_songs (playlist_id, song_id, position)
  VALUES (playlist_id, song_id, max_position)
  ON CONFLICT (playlist_id, song_id) DO NOTHING;
END;
$$;