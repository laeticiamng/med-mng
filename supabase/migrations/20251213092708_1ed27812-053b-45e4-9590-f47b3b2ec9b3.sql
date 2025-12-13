-- Table pour l'historique des cas cliniques (non-AI)
CREATE TABLE IF NOT EXISTS public.clinical_cases_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id TEXT NOT NULL,
  completed_steps TEXT[] DEFAULT '{}',
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  decisions JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour l'historique des examens (non-AI)
CREATE TABLE IF NOT EXISTS public.exam_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_type TEXT,
  questions JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '{}'::jsonb,
  total_questions INTEGER DEFAULT 0,
  score INTEGER,
  time_limit_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les sessions d'examen en pause
CREATE TABLE IF NOT EXISTS public.exam_paused_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_data JSONB NOT NULL,
  questions JSONB NOT NULL,
  paused_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Table pour l'historique de recherche
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les recherches sauvegardées
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  name TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour la progression de l'onboarding
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  completed_steps TEXT[] DEFAULT '{}',
  seen_tooltips TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les sessions de quiz et erreurs
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_code TEXT,
  errors JSONB DEFAULT '[]'::jsonb,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les objectifs d'apprentissage
CREATE TABLE IF NOT EXISTS public.learning_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_value INTEGER DEFAULT 0,
  current_value INTEGER DEFAULT 0,
  goal_type TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les préférences de notification
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  srs_enabled BOOLEAN DEFAULT true,
  daily_reminder BOOLEAN DEFAULT true,
  reminder_time TEXT DEFAULT '09:00',
  push_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les paramètres de personnalisation utilisateur
CREATE TABLE IF NOT EXISTS public.user_personalization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clinical_cases_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_paused_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_personalization ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own clinical_cases_history" ON public.clinical_cases_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exam_history" ON public.exam_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exam_paused_sessions" ON public.exam_paused_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own search_history" ON public.search_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved_searches" ON public.saved_searches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own onboarding_progress" ON public.onboarding_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quiz_sessions" ON public.quiz_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own learning_goals" ON public.learning_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notification_preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own user_personalization" ON public.user_personalization FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinical_cases_history_user ON public.clinical_cases_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_history_user ON public.exam_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_user ON public.learning_goals(user_id);