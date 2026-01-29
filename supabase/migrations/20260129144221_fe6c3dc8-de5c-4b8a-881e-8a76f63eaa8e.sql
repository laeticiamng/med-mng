-- Création de la table pomodoro_sessions pour le suivi des sessions de productivité
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('work', 'short_break', 'long_break')),
  duration_minutes INTEGER NOT NULL,
  task_name TEXT,
  preset TEXT DEFAULT 'classic',
  completed BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_created_at ON public.pomodoro_sessions(created_at DESC);

-- Activation RLS
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Users can view their own pomodoro sessions"
  ON public.pomodoro_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions"
  ON public.pomodoro_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro sessions"
  ON public.pomodoro_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro sessions"
  ON public.pomodoro_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Ajout de colonnes manquantes à mood_entries si nécessaire
ALTER TABLE public.mood_entries ADD COLUMN IF NOT EXISTS energy_level INTEGER;
ALTER TABLE public.mood_entries ADD COLUMN IF NOT EXISTS stress_level INTEGER;
ALTER TABLE public.mood_entries ADD COLUMN IF NOT EXISTS factors TEXT[];

-- Ajout de colonnes manquantes à user_goals
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Ajout de colonnes manquantes à daily_challenges
ALTER TABLE public.daily_challenges ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.daily_challenges ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.daily_challenges ADD COLUMN IF NOT EXISTS target_value INTEGER DEFAULT 1;
ALTER TABLE public.daily_challenges ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
ALTER TABLE public.daily_challenges ADD COLUMN IF NOT EXISTS reward_xp INTEGER DEFAULT 50;

-- Création de la table user_challenge_progress pour suivre la progression des utilisateurs
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- RLS pour user_challenge_progress
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge progress"
  ON public.user_challenge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress"
  ON public.user_challenge_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
  ON public.user_challenge_progress FOR UPDATE
  USING (auth.uid() = user_id);