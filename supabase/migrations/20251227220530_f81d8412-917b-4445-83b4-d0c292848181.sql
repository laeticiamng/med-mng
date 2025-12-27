-- Table pour stocker la progression par compétence (migration localStorage vers Supabase)
CREATE TABLE IF NOT EXISTS public.user_competence_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_code TEXT NOT NULL,
  rang TEXT NOT NULL CHECK (rang IN ('A', 'B')),
  competence_id TEXT NOT NULL,
  mastered BOOLEAN DEFAULT false,
  mastered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_code, rang, competence_id)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_user_competence_progress_user ON public.user_competence_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_competence_progress_item ON public.user_competence_progress(item_code);
CREATE INDEX IF NOT EXISTS idx_user_competence_progress_lookup ON public.user_competence_progress(user_id, item_code, rang);

-- Enable RLS
ALTER TABLE public.user_competence_progress ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own progress
CREATE POLICY "Users can view their own competence progress"
ON public.user_competence_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own competence progress"
ON public.user_competence_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competence progress"
ON public.user_competence_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competence progress"
ON public.user_competence_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_user_competence_progress_updated_at
BEFORE UPDATE ON public.user_competence_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();