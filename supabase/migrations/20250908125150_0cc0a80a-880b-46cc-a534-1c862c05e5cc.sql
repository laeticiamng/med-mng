-- Create missing tables for MED-MNG platform
CREATE TABLE IF NOT EXISTS public.med_mng_music_generations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    item_code TEXT,
    title TEXT NOT NULL,
    lyrics TEXT[] NOT NULL,
    style TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 120,
    rang TEXT NOT NULL CHECK (rang IN ('A', 'B', 'AB')),
    status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed', 'processing')),
    audio_url TEXT,
    image_url TEXT,
    suno_track_id TEXT,
    enhanced_lyrics TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS public.med_mng_playlists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    cover_image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlist songs junction table
CREATE TABLE IF NOT EXISTS public.med_mng_playlist_songs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES public.med_mng_playlists(id) ON DELETE CASCADE,
    generation_id UUID NOT NULL REFERENCES public.med_mng_music_generations(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    added_by UUID,
    UNIQUE(playlist_id, generation_id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.med_mng_favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    generation_id UUID NOT NULL REFERENCES public.med_mng_music_generations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, generation_id)
);

-- Create listening history table
CREATE TABLE IF NOT EXISTS public.med_mng_listening_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    generation_id UUID NOT NULL REFERENCES public.med_mng_music_generations(id) ON DELETE CASCADE,
    listen_duration INTEGER DEFAULT 0,
    completion_percentage NUMERIC(5,2) DEFAULT 0,
    listened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    device_type TEXT DEFAULT 'web'
);

-- Create study sessions table
CREATE TABLE IF NOT EXISTS public.med_mng_study_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    generation_id UUID NOT NULL REFERENCES public.med_mng_music_generations(id) ON DELETE CASCADE,
    session_duration INTEGER NOT NULL,
    items_reviewed TEXT[] DEFAULT '{}',
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    notes TEXT,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.med_mng_user_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    preferred_styles TEXT[] DEFAULT '{}',
    preferred_durations INTEGER[] DEFAULT '{120,180}',
    notification_settings JSONB DEFAULT '{"email": true, "push": false}',
    privacy_settings JSONB DEFAULT '{"profile_public": false, "playlists_public": false}',
    accessibility_settings JSONB DEFAULT '{"high_contrast": false, "reduce_motion": false, "screen_reader": false}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.med_mng_music_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for med_mng_music_generations
CREATE POLICY "Users can view their own generations" ON public.med_mng_music_generations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations" ON public.med_mng_music_generations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations" ON public.med_mng_music_generations 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all generations" ON public.med_mng_music_generations 
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- RLS Policies for playlists
CREATE POLICY "Users can manage their own playlists" ON public.med_mng_playlists 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists" ON public.med_mng_playlists 
FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- RLS Policies for playlist songs
CREATE POLICY "Users can manage playlist songs for their playlists" ON public.med_mng_playlist_songs 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.med_mng_playlists 
        WHERE id = playlist_id AND user_id = auth.uid()
    )
);

-- RLS Policies for favorites
CREATE POLICY "Users can manage their own favorites" ON public.med_mng_favorites 
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for listening history
CREATE POLICY "Users can manage their own listening history" ON public.med_mng_listening_history 
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for study sessions
CREATE POLICY "Users can manage their own study sessions" ON public.med_mng_study_sessions 
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user preferences
CREATE POLICY "Users can manage their own preferences" ON public.med_mng_user_preferences 
FOR ALL USING (auth.uid() = user_id);

-- Create function for analytics
CREATE OR REPLACE FUNCTION public.get_medical_dashboard_stats(
    p_user_id UUID,
    p_timeframe TEXT DEFAULT 'month'
)
RETURNS TABLE (
    total_generations INTEGER,
    completed_generations INTEGER,
    success_rate NUMERIC,
    streak_days INTEGER,
    favorite_specialty TEXT,
    recent_activity JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    date_filter TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Set date filter based on timeframe
    CASE p_timeframe
        WHEN 'week' THEN date_filter := NOW() - INTERVAL '7 days';
        WHEN 'year' THEN date_filter := NOW() - INTERVAL '1 year';
        ELSE date_filter := NOW() - INTERVAL '30 days'; -- default month
    END CASE;

    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_generations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER as completed_generations,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END as success_rate,
        0::INTEGER as streak_days, -- Will implement streak calculation later
        COALESCE(
            (SELECT style FROM public.med_mng_music_generations 
             WHERE user_id = p_user_id AND created_at >= date_filter 
             GROUP BY style ORDER BY COUNT(*) DESC LIMIT 1),
            'N/A'
        ) as favorite_specialty,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'title', title,
                    'created_at', created_at,
                    'status', status
                )
            ) FROM (
                SELECT id, title, created_at, status 
                FROM public.med_mng_music_generations 
                WHERE user_id = p_user_id AND created_at >= date_filter
                ORDER BY created_at DESC LIMIT 10
            ) recent),
            '[]'::jsonb
        ) as recent_activity
    FROM public.med_mng_music_generations 
    WHERE user_id = p_user_id AND created_at >= date_filter;
END;
$$;

-- Create update trigger for updated_at fields
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_med_mng_music_generations_updated_at 
    BEFORE UPDATE ON public.med_mng_music_generations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_med_mng_playlists_updated_at 
    BEFORE UPDATE ON public.med_mng_playlists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_med_mng_user_preferences_updated_at 
    BEFORE UPDATE ON public.med_mng_user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_med_mng_music_generations_user_id ON public.med_mng_music_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_med_mng_music_generations_status ON public.med_mng_music_generations(status);
CREATE INDEX IF NOT EXISTS idx_med_mng_music_generations_created_at ON public.med_mng_music_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_med_mng_playlists_user_id ON public.med_mng_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_med_mng_playlist_songs_playlist_id ON public.med_mng_playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_med_mng_favorites_user_id ON public.med_mng_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_med_mng_listening_history_user_id ON public.med_mng_listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_med_mng_study_sessions_user_id ON public.med_mng_study_sessions(user_id);