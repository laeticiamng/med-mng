-- Migration pour le système "Spotify IA Médicale" complet
-- Tables pour playlists, logs, et fonctionnalités avancées

-- Table des playlists utilisateur (modèle Spotify)
CREATE TABLE IF NOT EXISTS public.med_mng_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison playlists-songs
CREATE TABLE IF NOT EXISTS public.med_mng_playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.med_mng_playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

-- Table des logs d'accès audio pour monitoring sécurisé
CREATE TABLE IF NOT EXISTS public.med_mng_audio_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL, -- 'stream', 'lyrics', 'metadata'
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  session_duration INTEGER, -- en secondes
  bytes_transferred BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des interactions chat IA pour analytics
CREATE TABLE IF NOT EXISTS public.med_mng_chat_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  context_used JSONB, -- Contexte EDN utilisé
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des logs d'accès aux paroles
CREATE TABLE IF NOT EXISTS public.med_mng_lyrics_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  format VARCHAR(10) NOT NULL, -- 'json', 'lrc', 'srt'
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter colonnes manquantes à med_mng_songs pour les paroles synchronisées
ALTER TABLE public.med_mng_songs 
ADD COLUMN IF NOT EXISTS lyrics JSONB;

-- Indexes pour performances
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.med_mng_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_public ON public.med_mng_playlists(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON public.med_mng_playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_position ON public.med_mng_playlist_songs(playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_audio_logs_user_date ON public.med_mng_audio_access_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audio_logs_song_date ON public.med_mng_audio_access_logs(song_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_user ON public.med_mng_chat_interactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lyrics_logs_user ON public.med_mng_lyrics_access_logs(user_id, created_at);

-- RLS Policies pour sécurité

-- Playlists : utilisateur voit ses playlists + publiques
ALTER TABLE public.med_mng_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playlists and public ones"
ON public.med_mng_playlists FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create own playlists"
ON public.med_mng_playlists FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own playlists"
ON public.med_mng_playlists FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own playlists"
ON public.med_mng_playlists FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Playlist songs : via playlist ownership
ALTER TABLE public.med_mng_playlist_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view songs in accessible playlists"
ON public.med_mng_playlist_songs FOR SELECT
TO authenticated
USING (
  playlist_id IN (
    SELECT id FROM public.med_mng_playlists 
    WHERE user_id = auth.uid() OR is_public = true
  )
);

CREATE POLICY "Users can add songs to own playlists"
ON public.med_mng_playlist_songs FOR INSERT
TO authenticated
WITH CHECK (
  added_by = auth.uid() AND
  playlist_id IN (
    SELECT id FROM public.med_mng_playlists 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove songs they added"
ON public.med_mng_playlist_songs FOR DELETE
TO authenticated
USING (added_by = auth.uid());

-- Logs : utilisateur voit uniquement ses logs
ALTER TABLE public.med_mng_audio_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audio logs"
ON public.med_mng_audio_access_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert audio logs"
ON public.med_mng_audio_access_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

ALTER TABLE public.med_mng_chat_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat interactions"
ON public.med_mng_chat_interactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert chat interactions"
ON public.med_mng_chat_interactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

ALTER TABLE public.med_mng_lyrics_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lyrics logs"
ON public.med_mng_lyrics_access_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert lyrics logs"
ON public.med_mng_lyrics_access_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fonctions RPC pour les nouvelles fonctionnalités

-- Logger l'accès audio
CREATE OR REPLACE FUNCTION public.log_audio_access(
  p_user_id UUID,
  p_song_id UUID,
  p_access_type TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referer TEXT DEFAULT NULL,
  p_session_duration INTEGER DEFAULT NULL,
  p_bytes_transferred BIGINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.med_mng_audio_access_logs (
    user_id, song_id, access_type, ip_address, user_agent, 
    referer, session_duration, bytes_transferred
  ) VALUES (
    p_user_id, p_song_id, p_access_type, p_ip_address::inet, 
    p_user_agent, p_referer, p_session_duration, p_bytes_transferred
  );
END;
$$;

-- Logger les interactions chat
CREATE OR REPLACE FUNCTION public.log_chat_interaction(
  p_user_id UUID,
  p_question TEXT,
  p_response TEXT,
  p_context_used JSONB DEFAULT NULL,
  p_tokens_used INTEGER DEFAULT 0,
  p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.med_mng_chat_interactions (
    user_id, question, response, context_used, tokens_used, response_time_ms
  ) VALUES (
    p_user_id, p_question, p_response, p_context_used, p_tokens_used, p_response_time_ms
  );
END;
$$;

-- Logger l'accès aux paroles
CREATE OR REPLACE FUNCTION public.log_lyrics_access(
  p_user_id UUID,
  p_song_id UUID,
  p_format TEXT,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.med_mng_lyrics_access_logs (
    user_id, song_id, format, ip_address
  ) VALUES (
    p_user_id, p_song_id, p_format, p_ip_address::inet
  );
END;
$$;

-- Fonction pour incrementer le quota (rollback en cas d'erreur)
CREATE OR REPLACE FUNCTION public.med_mng_increment_quota(credits_to_add INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER;
  new_credits INTEGER;
BEGIN
  -- Récupérer les crédits actuels
  SELECT credits_left INTO current_credits
  FROM public.med_mng_subscriptions 
  WHERE user_id = auth.uid();

  IF current_credits IS NULL THEN
    RETURN FALSE;
  END IF;

  new_credits := current_credits + credits_to_add;

  -- Mettre à jour les crédits
  UPDATE public.med_mng_subscriptions 
  SET credits_left = new_credits,
      updated_at = NOW()
  WHERE user_id = auth.uid();

  RETURN TRUE;
END;
$$;

-- Trigger pour mettre à jour updated_at sur les playlists
CREATE OR REPLACE FUNCTION public.update_playlist_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.med_mng_playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_playlist_updated_at();