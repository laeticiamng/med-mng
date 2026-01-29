-- Tables backend manquantes pour les enrichissements v6.0

-- 1. Table pour les sessions vocales IA
CREATE TABLE IF NOT EXISTS public.ai_voice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  transcript_length INTEGER DEFAULT 0,
  mode TEXT DEFAULT 'both', -- 'stt', 'tts', 'both'
  language TEXT DEFAULT 'fr-FR',
  voice_id TEXT,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS pour ai_voice_sessions
ALTER TABLE public.ai_voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voice sessions"
  ON public.ai_voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice sessions"
  ON public.ai_voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. Table pour les imports de flashcards (Anki, etc.)
CREATE TABLE IF NOT EXISTS public.flashcard_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'apkg', 'txt', 'csv'
  cards_imported INTEGER DEFAULT 0,
  cards_failed INTEGER DEFAULT 0,
  deck_id UUID,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS pour flashcard_imports
ALTER TABLE public.flashcard_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flashcard imports"
  ON public.flashcard_imports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcard imports"
  ON public.flashcard_imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcard imports"
  ON public.flashcard_imports FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Table pour les tokens CSRF
CREATE TABLE IF NOT EXISTS public.csrf_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS pour csrf_tokens
ALTER TABLE public.csrf_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own csrf tokens"
  ON public.csrf_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own csrf tokens"
  ON public.csrf_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own csrf tokens"
  ON public.csrf_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own csrf tokens"
  ON public.csrf_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Ajouter colonne dashboard_widgets à user_preferences si elle n'existe pas
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS dashboard_widgets JSONB DEFAULT '[]'::jsonb;

-- 5. Ajouter contrainte unique sur user_id pour user_gamification_stats si absente
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_gamification_stats_user_id_key'
  ) THEN
    ALTER TABLE public.user_gamification_stats 
    ADD CONSTRAINT user_gamification_stats_user_id_key UNIQUE (user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    NULL; -- Table doesn't exist, skip
END $$;

-- 6. Index pour performance
CREATE INDEX IF NOT EXISTS idx_ai_voice_sessions_user_id ON public.ai_voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_imports_user_id ON public.flashcard_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_user_id ON public.csrf_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_token ON public.csrf_tokens(token);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_expires_at ON public.csrf_tokens(expires_at);