-- =====================================================
-- MODULE 1: Pipeline validation EDN (statuts draft → review → validated)
-- MODULE 3: Mode Karaoké avec Quiz intégré
-- MODULE 4: IA Tuteur - Bayesian Knowledge Tracing
-- =====================================================

-- 1. Ajout colonnes validation pipeline sur edn_items_complete
ALTER TABLE public.edn_items_complete 
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'draft' CHECK (validation_status IN ('draft', 'review1', 'review2', 'validated', 'rejected')),
ADD COLUMN IF NOT EXISTS reviewer_1_id UUID,
ADD COLUMN IF NOT EXISTS reviewer_1_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewer_1_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewer_2_id UUID,
ADD COLUMN IF NOT EXISTS reviewer_2_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewer_2_notes TEXT,
ADD COLUMN IF NOT EXISTS validation_sources JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS last_audit_date TIMESTAMP WITH TIME ZONE;

-- 2. Table des reviewers médicaux
CREATE TABLE IF NOT EXISTS public.medical_reviewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  qualification TEXT NOT NULL, -- 'interne', 'chef_clinique', 'PH', 'PU-PH', 'expert'
  hospital TEXT,
  is_active BOOLEAN DEFAULT true,
  reviews_count INTEGER DEFAULT 0,
  avg_review_time_hours NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Table historique des validations
CREATE TABLE IF NOT EXISTS public.edn_validation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.edn_items_complete(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  action TEXT NOT NULL, -- 'approve', 'reject', 'request_changes', 'validate'
  notes TEXT,
  sources_verified TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Table pour les quiz karaoké (fill-the-blank + QCM flash)
CREATE TABLE IF NOT EXISTS public.karaoke_quiz_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id TEXT NOT NULL,
  item_code TEXT,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('fill_blank', 'qcm_flash', 'mixed')),
  fill_blank_terms JSONB DEFAULT '[]', -- [{position: 0, term: 'hypertension', hint: 'HTA'}]
  qcm_questions JSONB DEFAULT '[]', -- [{time: 30, question: '...', options: [], correct: 0}]
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  medical_concepts TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Table de scoring Karaoké
CREATE TABLE IF NOT EXISTS public.karaoke_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  song_id TEXT NOT NULL,
  quiz_data_id UUID REFERENCES public.karaoke_quiz_data(id),
  session_type TEXT NOT NULL CHECK (session_type IN ('listen', 'karaoke', 'quiz')),
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  fill_blank_correct INTEGER DEFAULT 0,
  fill_blank_total INTEGER DEFAULT 0,
  qcm_correct INTEGER DEFAULT 0,
  qcm_total INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Table Bayesian Knowledge Tracing (BKT) pour IA Tuteur
CREATE TABLE IF NOT EXISTS public.bkt_student_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_code TEXT NOT NULL,
  concept_id TEXT NOT NULL, -- Concept médical spécifique
  p_know NUMERIC(5,4) DEFAULT 0.0, -- Probabilité de maîtrise
  p_guess NUMERIC(5,4) DEFAULT 0.25, -- Probabilité de deviner
  p_slip NUMERIC(5,4) DEFAULT 0.1, -- Probabilité d'erreur malgré maîtrise
  p_learn NUMERIC(5,4) DEFAULT 0.3, -- Probabilité d'apprentissage par essai
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  mastery_reached BOOLEAN DEFAULT false,
  mastery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, item_code, concept_id)
);

-- 7. Table prédictions ECN
CREATE TABLE IF NOT EXISTS public.ecn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  predicted_rank_min INTEGER,
  predicted_rank_max INTEGER,
  predicted_percentile NUMERIC(5,2),
  confidence_interval NUMERIC(5,2), -- en pourcentage
  strong_items TEXT[], -- Items bien maîtrisés
  weak_items TEXT[], -- Items à travailler
  recommended_study_plan JSONB, -- Plan de révision personnalisé
  model_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Table sessions IA tuteur personnalisées
CREATE TABLE IF NOT EXISTS public.ai_tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('standard', 'weakness_focus', 'review', 'discovery')),
  items_proposed TEXT[] DEFAULT '{}',
  items_completed TEXT[] DEFAULT '{}',
  weak_items_ratio NUMERIC(3,2) DEFAULT 0.7, -- 70% items faibles par défaut
  review_items_ratio NUMERIC(3,2) DEFAULT 0.2, -- 20% révision
  new_items_ratio NUMERIC(3,2) DEFAULT 0.1, -- 10% nouveaux
  total_xp_earned INTEGER DEFAULT 0,
  accuracy_rate NUMERIC(5,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Index pour performance
CREATE INDEX IF NOT EXISTS idx_edn_validation_status ON public.edn_items_complete(validation_status);
CREATE INDEX IF NOT EXISTS idx_validation_history_item ON public.edn_validation_history(item_id);
CREATE INDEX IF NOT EXISTS idx_karaoke_sessions_user ON public.karaoke_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bkt_user_item ON public.bkt_student_knowledge(user_id, item_code);
CREATE INDEX IF NOT EXISTS idx_ecn_predictions_user ON public.ecn_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_user ON public.ai_tutor_sessions(user_id);

-- 10. RLS Policies
ALTER TABLE public.medical_reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edn_validation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karaoke_quiz_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karaoke_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bkt_student_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;

-- Policies pour reviewers (lecture admin seulement)
CREATE POLICY "Medical reviewers visible to admins" ON public.medical_reviewers
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour historique validation (lecture admin)
CREATE POLICY "Validation history for admins" ON public.edn_validation_history
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert validation history" ON public.edn_validation_history
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies pour karaoke_quiz_data (lecture publique)
CREATE POLICY "Karaoke quiz data readable by all" ON public.karaoke_quiz_data
  FOR SELECT USING (true);

-- Policies pour karaoke_sessions (utilisateurs connectés)
CREATE POLICY "Users can view own karaoke sessions" ON public.karaoke_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own karaoke sessions" ON public.karaoke_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own karaoke sessions" ON public.karaoke_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour BKT knowledge
CREATE POLICY "Users can view own knowledge" ON public.bkt_student_knowledge
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge" ON public.bkt_student_knowledge
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge" ON public.bkt_student_knowledge
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour ECN predictions
CREATE POLICY "Users can view own predictions" ON public.ecn_predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions" ON public.ecn_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies pour AI tutor sessions
CREATE POLICY "Users can view own tutor sessions" ON public.ai_tutor_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tutor sessions" ON public.ai_tutor_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tutor sessions" ON public.ai_tutor_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 11. Fonction BKT update (calcul bayésien)
CREATE OR REPLACE FUNCTION public.update_bkt_knowledge(
  p_user_id UUID,
  p_item_code TEXT,
  p_concept_id TEXT,
  p_is_correct BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record bkt_student_knowledge%ROWTYPE;
  v_p_know_prior NUMERIC(5,4);
  v_p_know_posterior NUMERIC(5,4);
  v_p_correct NUMERIC(5,4);
BEGIN
  -- Récupérer ou créer l'entrée
  SELECT * INTO v_record FROM bkt_student_knowledge
  WHERE user_id = p_user_id AND item_code = p_item_code AND concept_id = p_concept_id;
  
  IF NOT FOUND THEN
    INSERT INTO bkt_student_knowledge (user_id, item_code, concept_id, p_know, p_guess, p_slip, p_learn)
    VALUES (p_user_id, p_item_code, p_concept_id, 0.0, 0.25, 0.1, 0.3)
    RETURNING * INTO v_record;
  END IF;
  
  v_p_know_prior := v_record.p_know;
  
  -- Calcul BKT
  IF p_is_correct THEN
    -- P(correct) = P(know) * (1 - P(slip)) + (1 - P(know)) * P(guess)
    v_p_correct := v_p_know_prior * (1 - v_record.p_slip) + (1 - v_p_know_prior) * v_record.p_guess;
    -- P(know | correct) = P(know) * (1 - P(slip)) / P(correct)
    v_p_know_posterior := (v_p_know_prior * (1 - v_record.p_slip)) / NULLIF(v_p_correct, 0);
  ELSE
    -- P(incorrect) = P(know) * P(slip) + (1 - P(know)) * (1 - P(guess))
    v_p_correct := v_p_know_prior * v_record.p_slip + (1 - v_p_know_prior) * (1 - v_record.p_guess);
    -- P(know | incorrect) = P(know) * P(slip) / P(incorrect)
    v_p_know_posterior := (v_p_know_prior * v_record.p_slip) / NULLIF(v_p_correct, 0);
  END IF;
  
  -- Appliquer P(learn) : P(know) = P(know | obs) + (1 - P(know | obs)) * P(learn)
  v_p_know_posterior := COALESCE(v_p_know_posterior, 0) + (1 - COALESCE(v_p_know_posterior, 0)) * v_record.p_learn;
  v_p_know_posterior := LEAST(0.9999, GREATEST(0.0001, v_p_know_posterior));
  
  -- Mise à jour
  UPDATE bkt_student_knowledge
  SET 
    p_know = v_p_know_posterior,
    total_attempts = total_attempts + 1,
    correct_attempts = correct_attempts + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    last_attempt_at = now(),
    mastery_reached = v_p_know_posterior >= 0.95,
    mastery_date = CASE WHEN v_p_know_posterior >= 0.95 AND NOT mastery_reached THEN now() ELSE mastery_date END,
    updated_at = now()
  WHERE user_id = p_user_id AND item_code = p_item_code AND concept_id = p_concept_id;
  
  RETURN jsonb_build_object(
    'p_know_prior', v_p_know_prior,
    'p_know_posterior', v_p_know_posterior,
    'mastery_reached', v_p_know_posterior >= 0.95
  );
END;
$$;