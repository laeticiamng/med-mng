-- Migration pour QCM personnalisés, contenus IA uniques et annulation
-- Tables pour QCM personnalisés
CREATE TABLE public.med_mng_qcm_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rang_a', 'rang_b', 'mix')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER DEFAULT 0,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour contenus IA uniques (BD/roman/poème)
CREATE TABLE public.med_mng_content_ai (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id TEXT NOT NULL UNIQUE,
  comic_panels JSONB DEFAULT '[]'::jsonb,
  novel_text TEXT,
  poem_text TEXT,
  generation_status TEXT NOT NULL DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour tracking des annulations
CREATE TABLE public.med_mng_cancellations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('music', 'qcm', 'content')),
  reason TEXT,
  credits_refunded INTEGER DEFAULT 0,
  cancelled_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS pour QCM sessions
ALTER TABLE public.med_mng_qcm_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own QCM sessions"
ON public.med_mng_qcm_sessions
FOR ALL
USING (auth.uid() = user_id);

-- RLS pour contenus IA
ALTER TABLE public.med_mng_content_ai ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read AI content"
ON public.med_mng_content_ai
FOR SELECT
USING (true);

CREATE POLICY "Only service role can manage AI content"
ON public.med_mng_content_ai
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- RLS pour annulations
ALTER TABLE public.med_mng_cancellations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cancellations"
ON public.med_mng_cancellations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cancellations"
ON public.med_mng_cancellations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function pour générer QCM
CREATE OR REPLACE FUNCTION public.med_mng_generate_qcm(
  p_item_id TEXT,
  p_type TEXT,
  p_difficulty INTEGER DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_data JSONB;
  questions JSONB := '[]'::jsonb;
  i INTEGER;
BEGIN
  -- Récupérer les données de l'item
  SELECT 
    CASE 
      WHEN p_type = 'rang_a' THEN tableau_rang_a
      WHEN p_type = 'rang_b' THEN tableau_rang_b
      ELSE jsonb_build_object('rang_a', tableau_rang_a, 'rang_b', tableau_rang_b)
    END INTO item_data
  FROM edn_items_immersive 
  WHERE item_code = p_item_id;
  
  -- Générer des questions (logique simplifiée, sera enrichie par IA)
  FOR i IN 1..p_difficulty LOOP
    questions := questions || jsonb_build_array(
      jsonb_build_object(
        'id', i,
        'question', 'Question ' || i || ' sur ' || p_item_id || ' (' || p_type || ')',
        'options', jsonb_build_array(
          'Option A',
          'Option B (correcte)',
          'Option C',
          'Option D'
        ),
        'correct_answer', 1,
        'explanation', 'Explication basée sur ' || p_type
      )
    );
  END LOOP;
  
  RETURN questions;
END;
$$;

-- Function pour refund des crédits lors d'annulation
CREATE OR REPLACE FUNCTION public.med_mng_refund_credits(
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.med_mng_subscriptions
  SET credits_left = credits_left + p_credits,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Trigger pour update_at automatique
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qcm_sessions_updated_at
  BEFORE UPDATE ON public.med_mng_qcm_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_ai_updated_at
  BEFORE UPDATE ON public.med_mng_content_ai
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour performance
CREATE INDEX idx_qcm_sessions_user_item ON public.med_mng_qcm_sessions(user_id, item_id);
CREATE INDEX idx_content_ai_item ON public.med_mng_content_ai(item_id);
CREATE INDEX idx_cancellations_user ON public.med_mng_cancellations(user_id, cancelled_at);