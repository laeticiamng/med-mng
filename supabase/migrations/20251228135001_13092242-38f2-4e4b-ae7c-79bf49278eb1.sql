-- Table pour tracker la maîtrise des compétences OIC par utilisateur
CREATE TABLE IF NOT EXISTS public.user_competence_mastery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_code TEXT NOT NULL,
  objectif_id TEXT NOT NULL,
  rang TEXT NOT NULL CHECK (rang IN ('A', 'B')),
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  is_mastered BOOLEAN DEFAULT false,
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_code, objectif_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_competence_mastery_user ON public.user_competence_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_user_competence_mastery_item ON public.user_competence_mastery(item_code);
CREATE INDEX IF NOT EXISTS idx_user_competence_mastery_mastered ON public.user_competence_mastery(user_id, is_mastered);

-- Enable RLS
ALTER TABLE public.user_competence_mastery ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own competence mastery"
ON public.user_competence_mastery FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own competence mastery"
ON public.user_competence_mastery FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competence mastery"
ON public.user_competence_mastery FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competence mastery"
ON public.user_competence_mastery FOR DELETE
USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_user_competence_mastery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_competence_mastery ON public.user_competence_mastery;
CREATE TRIGGER trigger_update_user_competence_mastery
BEFORE UPDATE ON public.user_competence_mastery
FOR EACH ROW
EXECUTE FUNCTION update_user_competence_mastery_updated_at();