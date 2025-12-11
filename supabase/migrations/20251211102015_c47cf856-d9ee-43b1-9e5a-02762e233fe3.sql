-- Add missing column if table exists
ALTER TABLE public.flashcard_decks ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create remaining tables if not exist
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  duration_seconds INTEGER DEFAULT 0,
  score INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_clinical_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  specialty TEXT NOT NULL,
  difficulty TEXT DEFAULT 'intermediate',
  description TEXT,
  patient_presentation TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_items TEXT[] DEFAULT '{}',
  estimated_time INTEGER DEFAULT 15,
  learning_objectives TEXT[] DEFAULT '{}',
  generated_by TEXT DEFAULT 'ai',
  use_count INTEGER DEFAULT 0,
  average_score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  total_study_time INTEGER DEFAULT 0,
  items_reviewed INTEGER DEFAULT 0,
  items_mastered INTEGER DEFAULT 0,
  exams_completed INTEGER DEFAULT 0,
  average_score NUMERIC(5,2),
  streak_days INTEGER DEFAULT 0,
  weak_items TEXT[] DEFAULT '{}',
  strong_items TEXT[] DEFAULT '{}',
  predictions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_clinical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity_log;
CREATE POLICY "Users can view their own activity" ON public.user_activity_log FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.user_activity_log;
CREATE POLICY "Users can insert their own activity" ON public.user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view clinical cases" ON public.ai_clinical_cases;
CREATE POLICY "Authenticated users can view clinical cases" ON public.ai_clinical_cases FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view their own analytics" ON public.learning_analytics;
CREATE POLICY "Users can view their own analytics" ON public.learning_analytics FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their own analytics" ON public.learning_analytics;
CREATE POLICY "Users can manage their own analytics" ON public.learning_analytics FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON public.user_activity_log(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_week ON public.learning_analytics(user_id, week_start);