-- Tables pour le système musical "Spotify-like" et monitoring

-- Table des logs de génération musicale
CREATE TABLE public.music_generation_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID,
    item_code TEXT NOT NULL,
    rang_type TEXT NOT NULL CHECK (rang_type IN ('A', 'B', 'mix')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    generation_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    generation_end TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    suno_song_id TEXT,
    error_message TEXT,
    prompt_used TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des playlists
CREATE TABLE public.playlists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des chansons dans les playlists
CREATE TABLE public.playlist_songs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES public.emotionscare_songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(playlist_id, song_id)
);

-- Table des alertes de performance
CREATE TABLE public.performance_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metric_data JSONB DEFAULT '{}',
    acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES auth.users(id),
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes pour optimiser les performances
CREATE INDEX idx_music_generation_logs_user_id ON public.music_generation_logs(user_id);
CREATE INDEX idx_music_generation_logs_status ON public.music_generation_logs(status);
CREATE INDEX idx_music_generation_logs_created_at ON public.music_generation_logs(created_at);
CREATE INDEX idx_music_generation_logs_item_code ON public.music_generation_logs(item_code);

CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlists_is_public ON public.playlists(is_public);

CREATE INDEX idx_playlist_songs_playlist_id ON public.playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_position ON public.playlist_songs(position);

CREATE INDEX idx_performance_alerts_severity ON public.performance_alerts(severity);
CREATE INDEX idx_performance_alerts_resolved ON public.performance_alerts(resolved);
CREATE INDEX idx_performance_alerts_created_at ON public.performance_alerts(created_at);

-- Triggers pour mettre à jour les timestamps
CREATE TRIGGER update_music_generation_logs_updated_at
    BEFORE UPDATE ON public.music_generation_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_playlists_updated_at
    BEFORE UPDATE ON public.playlists
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies pour music_generation_logs
ALTER TABLE public.music_generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generation logs"
    ON public.music_generation_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation logs"
    ON public.music_generation_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all generation logs"
    ON public.music_generation_logs
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies pour playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playlists"
    ON public.playlists
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists"
    ON public.playlists
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can manage their own playlists"
    ON public.playlists
    FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies pour playlist_songs
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view songs in their own playlists"
    ON public.playlist_songs
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.playlists 
        WHERE public.playlists.id = playlist_songs.playlist_id 
        AND public.playlists.user_id = auth.uid()
    ));

CREATE POLICY "Users can view songs in public playlists"
    ON public.playlist_songs
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.playlists 
        WHERE public.playlists.id = playlist_songs.playlist_id 
        AND public.playlists.is_public = true
    ));

CREATE POLICY "Users can manage songs in their own playlists"
    ON public.playlist_songs
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.playlists 
        WHERE public.playlists.id = playlist_songs.playlist_id 
        AND public.playlists.user_id = auth.uid()
    ));

-- RLS Policies pour performance_alerts (Admin seulement)
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage performance alerts"
    ON public.performance_alerts
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can view performance alerts"
    ON public.performance_alerts
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'admin'
    ));

-- Fonction pour nettoyer les anciens logs (optionnel)
CREATE OR REPLACE FUNCTION public.cleanup_old_music_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Supprimer les logs de plus de 90 jours
    DELETE FROM public.music_generation_logs 
    WHERE created_at < now() - INTERVAL '90 days';
    
    -- Supprimer les alertes résolues de plus de 30 jours
    DELETE FROM public.performance_alerts 
    WHERE resolved = true 
    AND resolved_at < now() - INTERVAL '30 days';
END;
$$;