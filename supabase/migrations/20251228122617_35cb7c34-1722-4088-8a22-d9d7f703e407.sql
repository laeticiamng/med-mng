-- Table pour sauvegarder les résultats de quiz
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  item_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  wrong_answers INTEGER NOT NULL,
  time_spent INTEGER NOT NULL DEFAULT 0,
  performance JSONB,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX idx_quiz_results_item_code ON public.quiz_results(item_code);
CREATE INDEX idx_quiz_results_created_at ON public.quiz_results(created_at DESC);

-- Enable RLS
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own results
CREATE POLICY "Users can view their own quiz results"
ON public.quiz_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results"
ON public.quiz_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow anonymous inserts for non-logged users (stored with null user_id)
CREATE POLICY "Anonymous users can insert quiz results"
ON public.quiz_results FOR INSERT
WITH CHECK (user_id IS NULL);