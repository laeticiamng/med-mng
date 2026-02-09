-- Migration: Add subscription invoices table and exam ranking view
-- Date: 2026-02-10

-- ============================================
-- 1. Subscription Invoices Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_invoice_id text UNIQUE NOT NULL,
  stripe_subscription_id text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending',
  invoice_url text,
  created_at timestamptz DEFAULT now()
);

-- RLS for subscription_invoices
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

-- Users can only see invoices for their own subscriptions
CREATE POLICY "Users can view own invoices" ON public.subscription_invoices
  FOR SELECT USING (
    stripe_subscription_id IN (
      SELECT stripe_subscription_id FROM public.user_subscriptions
      WHERE user_id = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_subscription_id
  ON public.subscription_invoices(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_created
  ON public.subscription_invoices(created_at DESC);

-- ============================================
-- 2. Exam Rankings View (anonymized)
-- ============================================
CREATE OR REPLACE VIEW public.exam_rankings AS
SELECT
  es.user_id,
  COALESCE(p.name, 'Utilisateur anonyme') as display_name,
  COUNT(*) as total_exams,
  ROUND(AVG(es.score)::numeric, 1) as average_score,
  MAX(es.score) as best_score,
  SUM(
    CASE WHEN es.score IS NOT NULL THEN 1 ELSE 0 END
  ) as completed_exams,
  RANK() OVER (ORDER BY ROUND(AVG(es.score)::numeric, 1) DESC) as rank_position
FROM public.exam_sessions es
LEFT JOIN public.profiles p ON p.id = es.user_id
WHERE es.completed_at IS NOT NULL
  AND es.score IS NOT NULL
GROUP BY es.user_id, p.name
ORDER BY average_score DESC;

-- ============================================
-- 3. Exam History Enhancement - add question_type column
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exam_sessions' AND column_name = 'question_types'
  ) THEN
    ALTER TABLE public.exam_sessions ADD COLUMN question_types text[] DEFAULT ARRAY['qcm'];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exam_sessions' AND column_name = 'real_conditions'
  ) THEN
    ALTER TABLE public.exam_sessions ADD COLUMN real_conditions boolean DEFAULT false;
  END IF;
END $$;

-- ============================================
-- 4. Clinical Case Scores Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.clinical_case_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id text NOT NULL,
  total_score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 100,
  star_rating integer NOT NULL DEFAULT 0 CHECK (star_rating >= 0 AND star_rating <= 5),
  time_spent_seconds integer NOT NULL DEFAULT 0,
  steps_completed integer NOT NULL DEFAULT 0,
  total_steps integer NOT NULL DEFAULT 0,
  correct_decisions integer NOT NULL DEFAULT 0,
  score_breakdown jsonb DEFAULT '{}',
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.clinical_case_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clinical scores" ON public.clinical_case_scores
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own clinical scores" ON public.clinical_case_scores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_clinical_case_scores_user
  ON public.clinical_case_scores(user_id, completed_at DESC);
