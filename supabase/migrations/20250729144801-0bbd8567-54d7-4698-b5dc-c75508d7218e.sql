-- Table pour les sessions QCM
CREATE TABLE public.qcm_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_code text NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('rang_a', 'rang_b', 'mixed')),
  score numeric(5,2) DEFAULT 0,
  total_questions integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  incorrect_answers integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les réponses individuelles QCM
CREATE TABLE public.qcm_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.qcm_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id text NOT NULL,
  question_text text NOT NULL,
  user_answer text NOT NULL,
  correct_answer text NOT NULL,
  is_correct boolean NOT NULL,
  explanation text,
  medical_concept text,
  response_time_seconds integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Table pour les chansons d'erreurs générées
CREATE TABLE public.error_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES public.qcm_sessions(id) ON DELETE CASCADE NOT NULL,
  song_title text NOT NULL,
  lyrics jsonb NOT NULL,
  audio_url text,
  suno_audio_id text,
  generation_prompt text NOT NULL,
  errors_analyzed jsonb NOT NULL, -- Liste des erreurs analysées
  generation_status text DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les quotas utilisateur
CREATE TABLE public.user_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  subscription_type text DEFAULT 'standard' CHECK (subscription_type IN ('standard', 'pro', 'premium')),
  monthly_music_quota integer DEFAULT 10,
  monthly_music_used integer DEFAULT 0,
  monthly_qcm_quota integer DEFAULT 50,
  monthly_qcm_used integer DEFAULT 0,
  monthly_chat_quota integer DEFAULT 100,
  monthly_chat_used integer DEFAULT 0,
  quota_reset_date timestamp with time zone DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour l'historique des playlists
CREATE TABLE public.user_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  song_ids jsonb DEFAULT '[]'::jsonb,
  cover_image_url text,
  play_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qcm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qcm_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour qcm_sessions
CREATE POLICY "Users can manage their own QCM sessions"
ON public.qcm_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies pour qcm_responses
CREATE POLICY "Users can manage their own QCM responses"
ON public.qcm_responses
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.qcm_sessions 
  WHERE qcm_sessions.id = qcm_responses.session_id 
  AND qcm_sessions.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.qcm_sessions 
  WHERE qcm_sessions.id = qcm_responses.session_id 
  AND qcm_sessions.user_id = auth.uid()
));

-- RLS Policies pour error_songs
CREATE POLICY "Users can manage their own error songs"
ON public.error_songs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies pour user_quotas
CREATE POLICY "Users can view their own quotas"
ON public.user_quotas
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage quotas"
ON public.user_quotas
FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies pour user_playlists
CREATE POLICY "Users can manage their own playlists"
ON public.user_playlists
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists"
ON public.user_playlists
FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

-- Fonction pour reset automatique des quotas
CREATE OR REPLACE FUNCTION public.reset_monthly_quotas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_quotas
  SET 
    monthly_music_used = 0,
    monthly_qcm_used = 0,
    monthly_chat_used = 0,
    quota_reset_date = date_trunc('month', now()) + interval '1 month',
    updated_at = now()
  WHERE quota_reset_date <= now();
END;
$$;

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_qcm_sessions_updated_at
  BEFORE UPDATE ON public.qcm_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_error_songs_updated_at
  BEFORE UPDATE ON public.error_songs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_quotas_updated_at
  BEFORE UPDATE ON public.user_quotas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_playlists_updated_at
  BEFORE UPDATE ON public.user_playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();