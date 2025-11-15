-- =====================================================
-- ECOS EVALUATION GRIDS SYSTEM
-- =====================================================
-- Complete evaluation system for ECOS scenarios
--
-- Addresses audit finding: ECOS 0% evaluation grids (CRITICAL BLOCKER)
-- Impact: Unlocks full ECOS functionality, enables performance scoring
--
-- Created: 2025-11-15
-- Tables: 3 (ecos_evaluation_criteria, ecos_user_sessions, ecos_session_scores)
-- RLS Policies: 12
-- Functions: 3
-- =====================================================

-- =====================================================
-- 1. ECOS EVALUATION CRITERIA TABLE
-- =====================================================
-- Stores evaluation criteria for each ECOS scenario

CREATE TABLE IF NOT EXISTS public.ecos_evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id UUID NOT NULL REFERENCES public.ecos_situations_uness(id) ON DELETE CASCADE,
  criterion_name TEXT NOT NULL CHECK (length(criterion_name) >= 3),
  criterion_description TEXT,
  max_points INTEGER NOT NULL CHECK (max_points > 0),
  category TEXT NOT NULL CHECK (category IN ('communication', 'examination', 'diagnosis', 'management', 'professionalism')),
  order_index INTEGER DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT false,
  hints TEXT, -- Optional hints for students
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ecos_criteria_situation
  ON public.ecos_evaluation_criteria(situation_id);

CREATE INDEX IF NOT EXISTS idx_ecos_criteria_category
  ON public.ecos_evaluation_criteria(category);

CREATE INDEX IF NOT EXISTS idx_ecos_criteria_order
  ON public.ecos_evaluation_criteria(situation_id, order_index);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_ecos_criteria_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ecos_criteria_timestamp ON public.ecos_evaluation_criteria;

CREATE TRIGGER trigger_update_ecos_criteria_timestamp
  BEFORE UPDATE ON public.ecos_evaluation_criteria
  FOR EACH ROW
  EXECUTE FUNCTION update_ecos_criteria_updated_at();

COMMENT ON TABLE public.ecos_evaluation_criteria IS 'Evaluation criteria for ECOS scenarios - defines scoring rubric';
COMMENT ON COLUMN public.ecos_evaluation_criteria.category IS 'Type of skill evaluated: communication, examination, diagnosis, management, or professionalism';
COMMENT ON COLUMN public.ecos_evaluation_criteria.is_mandatory IS 'Whether this criterion must be completed to pass';

-- =====================================================
-- 2. ECOS USER SESSIONS TABLE
-- =====================================================
-- Tracks user attempts at ECOS scenarios

CREATE TABLE IF NOT EXISTS public.ecos_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  situation_id UUID NOT NULL REFERENCES public.ecos_situations_uness(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  total_score INTEGER DEFAULT 0,
  max_possible_score INTEGER NOT NULL,
  percentage_score NUMERIC GENERATED ALWAYS AS (
    CASE WHEN max_possible_score > 0
    THEN ROUND((total_score::NUMERIC / max_possible_score) * 100, 2)
    ELSE 0 END
  ) STORED,
  time_spent_seconds INTEGER CHECK (time_spent_seconds >= 0),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  evaluator_notes TEXT,
  self_reflection TEXT, -- User's own reflection on performance
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ecos_sessions_user
  ON public.ecos_user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_ecos_sessions_situation
  ON public.ecos_user_sessions(situation_id);

CREATE INDEX IF NOT EXISTS idx_ecos_sessions_user_status
  ON public.ecos_user_sessions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_ecos_sessions_completed
  ON public.ecos_user_sessions(user_id, completed_at)
  WHERE completed_at IS NOT NULL;

-- Auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_ecos_sessions_timestamp ON public.ecos_user_sessions;

CREATE TRIGGER trigger_update_ecos_sessions_timestamp
  BEFORE UPDATE ON public.ecos_user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_ecos_criteria_updated_at(); -- Reuse the same function

COMMENT ON TABLE public.ecos_user_sessions IS 'User attempts at ECOS scenarios with overall scores';
COMMENT ON COLUMN public.ecos_user_sessions.percentage_score IS 'Auto-calculated percentage score (total/max * 100)';
COMMENT ON COLUMN public.ecos_user_sessions.self_reflection IS 'User can write reflection notes after completion';

-- =====================================================
-- 3. ECOS SESSION SCORES TABLE
-- =====================================================
-- Detailed scores for each criterion in a session

CREATE TABLE IF NOT EXISTS public.ecos_session_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ecos_user_sessions(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES public.ecos_evaluation_criteria(id) ON DELETE CASCADE,
  points_earned INTEGER NOT NULL CHECK (points_earned >= 0),
  evaluator_notes TEXT,
  feedback TEXT, -- Specific feedback for this criterion
  timestamp TIMESTAMPTZ DEFAULT now(),

  -- Ensure one score per criterion per session
  UNIQUE(session_id, criterion_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ecos_scores_session
  ON public.ecos_session_scores(session_id);

CREATE INDEX IF NOT EXISTS idx_ecos_scores_criterion
  ON public.ecos_session_scores(criterion_id);

COMMENT ON TABLE public.ecos_session_scores IS 'Individual criterion scores for each ECOS session';
COMMENT ON COLUMN public.ecos_session_scores.feedback IS 'Specific feedback for this criterion to help student improve';

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.ecos_evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecos_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecos_session_scores ENABLE ROW LEVEL SECURITY;

-- ====== ECOS_EVALUATION_CRITERIA POLICIES ======

-- Public can view all criteria (needed to see rubric before attempting)
CREATE POLICY "Public can view evaluation criteria"
  ON public.ecos_evaluation_criteria
  FOR SELECT
  USING (true);

-- Only admins/teachers can create criteria
CREATE POLICY "Admins can create criteria"
  ON public.ecos_evaluation_criteria
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name IN ('admin', 'teacher', 'content_creator')
    )
  );

-- Only admins/teachers can update criteria
CREATE POLICY "Admins can update criteria"
  ON public.ecos_evaluation_criteria
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name IN ('admin', 'teacher', 'content_creator')
    )
  );

-- Only admins can delete criteria
CREATE POLICY "Admins can delete criteria"
  ON public.ecos_evaluation_criteria
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- ====== ECOS_USER_SESSIONS POLICIES ======

-- Users can view their own sessions
CREATE POLICY "Users view own sessions"
  ON public.ecos_user_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users create own sessions"
  ON public.ecos_user_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users update own sessions"
  ON public.ecos_user_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions (GDPR)
CREATE POLICY "Users delete own sessions"
  ON public.ecos_user_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins/teachers can view all sessions (analytics)
CREATE POLICY "Admins view all sessions"
  ON public.ecos_user_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name IN ('admin', 'teacher')
    )
  );

-- ====== ECOS_SESSION_SCORES POLICIES ======

-- Users can view scores for their own sessions
CREATE POLICY "Users view own scores"
  ON public.ecos_session_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ecos_user_sessions
      WHERE id = ecos_session_scores.session_id
        AND user_id = auth.uid()
    )
  );

-- Users can insert scores for their own sessions (self-evaluation)
CREATE POLICY "Users insert own scores"
  ON public.ecos_session_scores
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ecos_user_sessions
      WHERE id = ecos_session_scores.session_id
        AND user_id = auth.uid()
    )
  );

-- Admins/teachers can view all scores
CREATE POLICY "Admins view all scores"
  ON public.ecos_session_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name IN ('admin', 'teacher')
    )
  );

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to get evaluation criteria for a scenario
CREATE OR REPLACE FUNCTION get_ecos_criteria(p_situation_id UUID)
RETURNS TABLE (
  id UUID,
  criterion_name TEXT,
  criterion_description TEXT,
  max_points INTEGER,
  category TEXT,
  order_index INTEGER,
  is_mandatory BOOLEAN,
  hints TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ec.id,
    ec.criterion_name,
    ec.criterion_description,
    ec.max_points,
    ec.category,
    ec.order_index,
    ec.is_mandatory,
    ec.hints
  FROM public.ecos_evaluation_criteria ec
  WHERE ec.situation_id = p_situation_id
  ORDER BY ec.order_index ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_ecos_criteria(UUID) TO authenticated, anon;

-- Function to calculate total score for a session
CREATE OR REPLACE FUNCTION calculate_ecos_session_score(p_session_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_score INTEGER;
  v_max_score INTEGER;
BEGIN
  -- Calculate total earned points
  SELECT COALESCE(SUM(points_earned), 0)
  INTO v_total_score
  FROM public.ecos_session_scores
  WHERE session_id = p_session_id;

  -- Get max possible score from criteria
  SELECT COALESCE(SUM(ec.max_points), 0)
  INTO v_max_score
  FROM public.ecos_evaluation_criteria ec
  WHERE ec.situation_id = (
    SELECT situation_id FROM public.ecos_user_sessions WHERE id = p_session_id
  );

  -- Update session totals
  UPDATE public.ecos_user_sessions
  SET
    total_score = v_total_score,
    max_possible_score = v_max_score,
    updated_at = now()
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION calculate_ecos_session_score(UUID) TO authenticated;

-- Function to get user's ECOS statistics
CREATE OR REPLACE FUNCTION get_user_ecos_stats(p_user_id UUID)
RETURNS TABLE (
  total_attempts INTEGER,
  completed_scenarios INTEGER,
  average_score NUMERIC,
  total_time_hours NUMERIC,
  best_category TEXT,
  improvement_needed TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH session_stats AS (
    SELECT
      COUNT(*) as attempts,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      AVG(percentage_score) FILTER (WHERE status = 'completed') as avg_score,
      SUM(time_spent_seconds) / 3600.0 as hours
    FROM public.ecos_user_sessions
    WHERE user_id = p_user_id
  ),
  category_scores AS (
    SELECT
      ec.category,
      AVG((ess.points_earned::NUMERIC / ec.max_points) * 100) as avg_percentage
    FROM public.ecos_session_scores ess
    JOIN public.ecos_evaluation_criteria ec ON ess.criterion_id = ec.id
    JOIN public.ecos_user_sessions eus ON ess.session_id = eus.id
    WHERE eus.user_id = p_user_id AND eus.status = 'completed'
    GROUP BY ec.category
  )
  SELECT
    ss.attempts::INTEGER,
    ss.completed::INTEGER,
    ROUND(ss.avg_score, 2),
    ROUND(ss.hours, 2),
    (SELECT category FROM category_scores ORDER BY avg_percentage DESC LIMIT 1),
    (SELECT category FROM category_scores ORDER BY avg_percentage ASC LIMIT 1)
  FROM session_stats ss;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_ecos_stats(UUID) TO authenticated;

COMMENT ON FUNCTION get_user_ecos_stats IS 'Returns comprehensive ECOS statistics for a user including best/worst categories';

-- =====================================================
-- 6. AUTO-UPDATE SESSION SCORE TRIGGER
-- =====================================================

-- Automatically recalculate session score when scores are added/updated
CREATE OR REPLACE FUNCTION auto_update_session_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate session score
  PERFORM calculate_ecos_session_score(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.session_id
      ELSE NEW.session_id
    END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_update_session_score ON public.ecos_session_scores;

CREATE TRIGGER trigger_auto_update_session_score
  AFTER INSERT OR UPDATE OR DELETE ON public.ecos_session_scores
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_session_score();

COMMENT ON FUNCTION auto_update_session_score IS 'Automatically recalculates total session score when individual criterion scores change';

-- =====================================================
-- 7. SEED DEFAULT CRITERIA (EXAMPLE)
-- =====================================================

-- This is an example - in production, criteria should be added via admin interface
-- Uncomment and modify as needed

/*
-- Example: Generic ECOS criteria template
INSERT INTO public.ecos_evaluation_criteria (
  situation_id,
  criterion_name,
  criterion_description,
  max_points,
  category,
  order_index,
  is_mandatory
) VALUES
  -- Communication criteria
  ('SITUATION_UUID_HERE', 'Accueil du patient', 'Salue le patient, se présente, explique le déroulement', 10, 'communication', 1, true),
  ('SITUATION_UUID_HERE', 'Écoute active', 'Laisse le patient s''exprimer, reformule, montre de l''empathie', 10, 'communication', 2, true),

  -- Examination criteria
  ('SITUATION_UUID_HERE', 'Examen physique', 'Réalise un examen adapté, systématique et complet', 20, 'examination', 3, true),
  ('SITUATION_UUID_HERE', 'Techniques appropriées', 'Utilise les bonnes techniques d''examen', 10, 'examination', 4, true),

  -- Diagnosis criteria
  ('SITUATION_UUID_HERE', 'Hypothèses diagnostiques', 'Énonce des hypothèses diagnostiques pertinentes', 15, 'diagnosis', 5, true),
  ('SITUATION_UUID_HERE', 'Examens complémentaires', 'Prescrit les examens complémentaires appropriés', 10, 'diagnosis', 6, false),

  -- Management criteria
  ('SITUATION_UUID_HERE', 'Prise en charge', 'Propose une prise en charge adaptée', 15, 'management', 7, true),
  ('SITUATION_UUID_HERE', 'Explications au patient', 'Explique au patient le diagnostic et le traitement', 10, 'management', 8, true)
ON CONFLICT DO NOTHING;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- To verify tables created:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name LIKE 'ecos_%'
-- ORDER BY table_name;

-- To verify RLS policies:
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename LIKE 'ecos_%'
-- ORDER BY tablename, policyname;

-- To test evaluation system:
-- SELECT * FROM get_ecos_criteria('SITUATION_UUID');
-- SELECT * FROM get_user_ecos_stats('USER_UUID');
