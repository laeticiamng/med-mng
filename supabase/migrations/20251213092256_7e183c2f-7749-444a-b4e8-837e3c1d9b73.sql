-- Table pour les données SRS (cartes de répétition espacée)
CREATE TABLE IF NOT EXISTS public.srs_card_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_id UUID NOT NULL,
  ease_factor NUMERIC DEFAULT 2.5,
  interval_days INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- Table pour l'historique des cas cliniques IA
CREATE TABLE IF NOT EXISTS public.clinical_case_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID NOT NULL,
  score INTEGER,
  completed_steps TEXT[],
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  decisions JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour l'historique des examens IA
CREATE TABLE IF NOT EXISTS public.ai_exam_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_type TEXT,
  questions JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '{}'::jsonb,
  total_questions INTEGER DEFAULT 0,
  time_limit_minutes INTEGER,
  score INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les plans de révision personnalisés
CREATE TABLE IF NOT EXISTS public.revision_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  target_items TEXT[] DEFAULT '{}',
  daily_target INTEGER DEFAULT 5,
  completion_rate NUMERIC DEFAULT 0,
  estimated_duration_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.srs_card_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_case_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_exam_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for srs_card_data
CREATE POLICY "Users can view own SRS data" ON public.srs_card_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own SRS data" ON public.srs_card_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own SRS data" ON public.srs_card_data
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for clinical_case_history
CREATE POLICY "Users can view own clinical history" ON public.clinical_case_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clinical history" ON public.clinical_case_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_exam_history
CREATE POLICY "Users can view own exam history" ON public.ai_exam_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exam history" ON public.ai_exam_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for revision_plans
CREATE POLICY "Users can view own revision plans" ON public.revision_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own revision plans" ON public.revision_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revision plans" ON public.revision_plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revision plans" ON public.revision_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_srs_card_data_user ON public.srs_card_data(user_id);
CREATE INDEX IF NOT EXISTS idx_srs_card_data_next_review ON public.srs_card_data(next_review);
CREATE INDEX IF NOT EXISTS idx_clinical_case_history_user ON public.clinical_case_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_exam_history_user ON public.ai_exam_history(user_id);
CREATE INDEX IF NOT EXISTS idx_revision_plans_user ON public.revision_plans(user_id);