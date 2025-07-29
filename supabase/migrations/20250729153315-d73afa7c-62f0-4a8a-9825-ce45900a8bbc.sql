-- Compléter les tables pour le système musical Spotify-like
-- Table pour les logs de génération musicale (monitoring détaillé)
CREATE TABLE IF NOT EXISTS public.med_mng_music_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  item_code TEXT NOT NULL,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('rang_a', 'rang_b', 'mix')),
  
  -- Tracking génération
  suno_task_id TEXT,
  generation_status TEXT DEFAULT 'starting' CHECK (generation_status IN ('starting', 'queued', 'generating', 'completed', 'failed', 'timeout')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Monitoring performance
  generation_duration_seconds INTEGER,
  queue_time_seconds INTEGER,
  processing_time_seconds INTEGER,
  
  -- Détails techniques
  prompt_used TEXT,
  style_tags TEXT,
  credits_consumed INTEGER DEFAULT 0,
  suno_model_used TEXT DEFAULT 'chirp-v3-0',
  
  -- Résultat
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  audio_url TEXT,
  song_id UUID REFERENCES public.med_mng_songs(id),
  
  -- Métadonnées
  request_ip INET,
  user_agent TEXT,
  request_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les sessions d'écoute (streaming analytics)
CREATE TABLE IF NOT EXISTS public.med_mng_listening_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  song_id UUID NOT NULL REFERENCES public.med_mng_songs(id),
  
  -- Session info
  session_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  
  -- Streaming stats
  bytes_streamed BIGINT DEFAULT 0,
  buffer_events INTEGER DEFAULT 0,
  seek_events INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  
  -- Context
  playlist_id UUID,
  previous_song_id UUID,
  next_song_id UUID,
  playback_source TEXT DEFAULT 'library', -- 'library', 'playlist', 'discovery', 'recommendation'
  
  -- Device & tech
  device_type TEXT DEFAULT 'web',
  browser_info JSONB DEFAULT '{}',
  connection_quality TEXT DEFAULT 'unknown',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les alertes de génération (monitoring admin)
CREATE TABLE IF NOT EXISTS public.med_mng_generation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('slow_generation', 'failed_generation', 'quota_exceeded', 'suno_error', 'high_queue_time')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Détails alerte
  message TEXT NOT NULL,
  generation_log_id UUID REFERENCES public.med_mng_music_generation_logs(id),
  threshold_value NUMERIC,
  actual_value NUMERIC,
  
  -- Status
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_music_generation_logs_user ON public.med_mng_music_generation_logs(user_id);
CREATE INDEX idx_music_generation_logs_status ON public.med_mng_music_generation_logs(generation_status);
CREATE INDEX idx_music_generation_logs_date ON public.med_mng_music_generation_logs(started_at);
CREATE INDEX idx_music_generation_logs_item ON public.med_mng_music_generation_logs(item_code);

CREATE INDEX idx_listening_sessions_user_song ON public.med_mng_listening_sessions(user_id, song_id);
CREATE INDEX idx_listening_sessions_date ON public.med_mng_listening_sessions(session_start);
CREATE INDEX idx_listening_sessions_completion ON public.med_mng_listening_sessions(completion_percentage);

CREATE INDEX idx_generation_alerts_type_severity ON public.med_mng_generation_alerts(alert_type, severity);
CREATE INDEX idx_generation_alerts_unresolved ON public.med_mng_generation_alerts(resolved) WHERE resolved = false;

-- RLS Policies
ALTER TABLE public.med_mng_music_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_listening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_generation_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own generation logs
CREATE POLICY "Users can view their own generation logs" ON public.med_mng_music_generation_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own listening sessions  
CREATE POLICY "Users can view their own listening sessions" ON public.med_mng_listening_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own listening sessions
CREATE POLICY "Users can create their own listening sessions" ON public.med_mng_listening_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all logs and alerts
CREATE POLICY "Admins can view all generation logs" ON public.med_mng_music_generation_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage all alerts" ON public.med_mng_generation_alerts
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Service role can manage everything
CREATE POLICY "Service role can manage generation logs" ON public.med_mng_music_generation_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage listening sessions" ON public.med_mng_listening_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage alerts" ON public.med_mng_generation_alerts
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Fonction pour créer automatiquement les alertes
CREATE OR REPLACE FUNCTION public.create_generation_alert(
  p_alert_type TEXT,
  p_severity TEXT,
  p_message TEXT,
  p_generation_log_id UUID DEFAULT NULL,
  p_threshold_value NUMERIC DEFAULT NULL,
  p_actual_value NUMERIC DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.med_mng_generation_alerts (
    alert_type,
    severity,
    message,
    generation_log_id,
    threshold_value,
    actual_value,
    metadata
  ) VALUES (
    p_alert_type,
    p_severity,
    p_message,
    p_generation_log_id,
    p_threshold_value,
    p_actual_value,
    p_metadata
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- Fonction pour monitoring automatique des générations lentes
CREATE OR REPLACE FUNCTION public.check_slow_generations()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slow_threshold INTEGER := 120; -- 2 minutes
  slow_gen RECORD;
BEGIN
  FOR slow_gen IN
    SELECT id, item_code, generation_duration_seconds, user_id
    FROM public.med_mng_music_generation_logs
    WHERE generation_status = 'completed'
    AND generation_duration_seconds > slow_threshold
    AND created_at > now() - INTERVAL '24 hours'
    AND NOT EXISTS (
      SELECT 1 FROM public.med_mng_generation_alerts
      WHERE generation_log_id = med_mng_music_generation_logs.id
      AND alert_type = 'slow_generation'
    )
  LOOP
    PERFORM public.create_generation_alert(
      'slow_generation',
      'medium',
      format('Génération lente détectée: %s secondes pour %s', slow_gen.generation_duration_seconds, slow_gen.item_code),
      slow_gen.id,
      slow_threshold,
      slow_gen.generation_duration_seconds,
      jsonb_build_object('user_id', slow_gen.user_id)
    );
  END LOOP;
END;
$$;

-- Trigger pour logger automatiquement les sessions d'écoute
CREATE OR REPLACE FUNCTION public.update_listening_session_end()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.session_end - NEW.session_start))::INTEGER;
  
  -- Calculer le pourcentage de completion basé sur la durée de la chanson
  IF NEW.duration_seconds > 0 THEN
    SELECT COALESCE(
      LEAST(100, (NEW.duration_seconds::FLOAT / COALESCE((meta->>'duration')::INTEGER, 180)) * 100)::INTEGER,
      0
    ) INTO NEW.completion_percentage
    FROM public.med_mng_songs
    WHERE id = NEW.song_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_listening_session_end_trigger
  BEFORE UPDATE ON public.med_mng_listening_sessions
  FOR EACH ROW
  WHEN (NEW.session_end IS NOT NULL AND OLD.session_end IS NULL)
  EXECUTE FUNCTION public.update_listening_session_end();