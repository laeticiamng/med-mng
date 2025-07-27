-- Create med_mng_user_analytics table for tracking user listening behavior
CREATE TABLE public.med_mng_user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  song_id UUID NOT NULL,
  play_count INTEGER NOT NULL DEFAULT 0,
  total_listen_time INTEGER NOT NULL DEFAULT 0, -- in seconds
  last_played TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Create med_mng_listening_events table for detailed event tracking
CREATE TABLE public.med_mng_listening_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  song_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'play', 'pause', 'skip', 'complete'
  listen_duration INTEGER, -- in seconds
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create med_mng_user_favorites table
CREATE TABLE public.med_mng_user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  song_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Create med_mng_playlist_analytics table
CREATE TABLE public.med_mng_playlist_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL,
  total_plays INTEGER NOT NULL DEFAULT 0,
  total_listen_time INTEGER NOT NULL DEFAULT 0, -- in seconds
  unique_listeners INTEGER NOT NULL DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.med_mng_user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_listening_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_playlist_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for med_mng_user_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.med_mng_user_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" 
ON public.med_mng_user_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.med_mng_user_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for med_mng_listening_events
CREATE POLICY "Users can view their own listening events" 
ON public.med_mng_listening_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own listening events" 
ON public.med_mng_listening_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for med_mng_user_favorites
CREATE POLICY "Users can manage their own favorites" 
ON public.med_mng_user_favorites 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for med_mng_playlist_analytics
CREATE POLICY "Users can view playlist analytics for their playlists" 
ON public.med_mng_playlist_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.med_mng_playlists 
  WHERE id = playlist_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update analytics for their playlists" 
ON public.med_mng_playlist_analytics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.med_mng_playlists 
  WHERE id = playlist_id AND user_id = auth.uid()
));

-- Create functions for analytics tracking
CREATE OR REPLACE FUNCTION public.med_mng_track_listening(
  p_song_id UUID,
  p_listen_duration INTEGER DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update or insert user analytics
  INSERT INTO public.med_mng_user_analytics (user_id, song_id, play_count, total_listen_time)
  VALUES (auth.uid(), p_song_id, 1, p_listen_duration)
  ON CONFLICT (user_id, song_id) 
  DO UPDATE SET 
    play_count = med_mng_user_analytics.play_count + 1,
    total_listen_time = med_mng_user_analytics.total_listen_time + p_listen_duration,
    last_played = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.med_mng_log_listening_event(
  p_song_id UUID,
  p_event_type TEXT,
  p_listen_duration INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.med_mng_listening_events (user_id, song_id, event_type, listen_duration, metadata)
  VALUES (auth.uid(), p_song_id, p_event_type, p_listen_duration, p_metadata);
END;
$$;

CREATE OR REPLACE FUNCTION public.med_mng_toggle_favorite(p_song_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_favorited boolean;
BEGIN
  -- Check if already favorited
  SELECT EXISTS (
    SELECT 1 FROM public.med_mng_user_favorites 
    WHERE user_id = auth.uid() AND song_id = p_song_id
  ) INTO is_favorited;
  
  IF is_favorited THEN
    -- Remove from favorites
    DELETE FROM public.med_mng_user_favorites 
    WHERE user_id = auth.uid() AND song_id = p_song_id;
    RETURN false;
  ELSE
    -- Add to favorites
    INSERT INTO public.med_mng_user_favorites (user_id, song_id)
    VALUES (auth.uid(), p_song_id);
    RETURN true;
  END IF;
END;
$$;