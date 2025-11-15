-- ============================================================================
-- Migration: Create quiz_sessions table
-- Date: 2025-11-15
-- Description: Table pour sauvegarder les sessions de quiz utilisateurs
-- Résout: TODO dans EnhancedQuiz.tsx:144
-- ============================================================================

-- ============================================================================
-- TABLE: quiz_sessions
-- Description: Sessions de quiz complétées par les utilisateurs
-- Usage: Suivi progression, analytics, recommendations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Quiz metadata
  item_code TEXT NOT NULL,
  rang TEXT NOT NULL CHECK (rang IN ('A', 'B', 'AB')),
  content_type TEXT DEFAULT 'edn' CHECK (content_type IN ('edn', 'ecos', 'oic')),

  -- Performance metrics
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  questions_count INTEGER NOT NULL CHECK (questions_count > 0),
  correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),

  -- Session data (full quiz session object)
  session_data JSONB NOT NULL,

  -- Performance tracking
  time_spent_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT now(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_score CHECK (correct_answers <= questions_count),
  CONSTRAINT valid_percentage CHECK (score = ROUND((correct_answers::DECIMAL / questions_count::DECIMAL) * 100))
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index pour lookup par user
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id
  ON public.quiz_sessions(user_id);

-- Index pour analytics par item
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_item_code
  ON public.quiz_sessions(item_code);

-- Index composite pour progression par user + item
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_item
  ON public.quiz_sessions(user_id, item_code);

-- Index pour filtrage par rang
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_rang
  ON public.quiz_sessions(rang);

-- Index pour analytics temporelles
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed_at
  ON public.quiz_sessions(completed_at DESC);

-- Index pour recherche par score
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_score
  ON public.quiz_sessions(score DESC);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own quiz sessions
CREATE POLICY "Users can view their own quiz sessions"
  ON public.quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own quiz sessions
CREATE POLICY "Users can insert their own quiz sessions"
  ON public.quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own quiz sessions (rare, but allowed)
CREATE POLICY "Users can update their own quiz sessions"
  ON public.quiz_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own quiz sessions (GDPR)
CREATE POLICY "Users can delete their own quiz sessions"
  ON public.quiz_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all quiz sessions (analytics)
CREATE POLICY "Admins can view all quiz sessions"
  ON public.quiz_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy: Admins can manage all quiz sessions
CREATE POLICY "Admins can manage all quiz sessions"
  ON public.quiz_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at on modification
CREATE OR REPLACE FUNCTION update_quiz_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quiz_sessions_updated_at
  BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_sessions_updated_at();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Get user quiz statistics
CREATE OR REPLACE FUNCTION get_user_quiz_stats(p_user_id UUID)
RETURNS TABLE (
  total_quizzes BIGINT,
  average_score NUMERIC,
  total_questions BIGINT,
  total_correct BIGINT,
  success_rate NUMERIC,
  best_score INTEGER,
  worst_score INTEGER,
  items_practiced BIGINT,
  total_time_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    ROUND(AVG(score), 2),
    SUM(questions_count)::BIGINT,
    SUM(correct_answers)::BIGINT,
    ROUND((SUM(correct_answers)::DECIMAL / NULLIF(SUM(questions_count)::DECIMAL, 0)) * 100, 2),
    MAX(score),
    MIN(score),
    COUNT(DISTINCT item_code)::BIGINT,
    ROUND(SUM(COALESCE(time_spent_seconds, 0))::DECIMAL / 3600, 2)
  FROM public.quiz_sessions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get item difficulty (based on average scores)
CREATE OR REPLACE FUNCTION get_item_difficulty(p_item_code TEXT)
RETURNS TABLE (
  item_code TEXT,
  attempts_count BIGINT,
  average_score NUMERIC,
  success_rate NUMERIC,
  difficulty_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_item_code,
    COUNT(*)::BIGINT,
    ROUND(AVG(score), 2),
    ROUND((SUM(correct_answers)::DECIMAL / NULLIF(SUM(questions_count)::DECIMAL, 0)) * 100, 2),
    CASE
      WHEN AVG(score) >= 80 THEN 'Facile'
      WHEN AVG(score) >= 60 THEN 'Moyen'
      WHEN AVG(score) >= 40 THEN 'Difficile'
      ELSE 'Très difficile'
    END
  FROM public.quiz_sessions
  WHERE item_code = p_item_code
  GROUP BY item_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.quiz_sessions IS 'Sessions de quiz complétées par les utilisateurs avec métriques de performance';
COMMENT ON COLUMN public.quiz_sessions.user_id IS 'ID de l''utilisateur (FK vers auth.users)';
COMMENT ON COLUMN public.quiz_sessions.item_code IS 'Code de l''item EDN/ECOS/OIC';
COMMENT ON COLUMN public.quiz_sessions.rang IS 'Rang de l''item (A, B, AB)';
COMMENT ON COLUMN public.quiz_sessions.score IS 'Score en pourcentage (0-100)';
COMMENT ON COLUMN public.quiz_sessions.session_data IS 'Données complètes de la session (questions, réponses, etc.)';
COMMENT ON COLUMN public.quiz_sessions.time_spent_seconds IS 'Temps passé sur le quiz en secondes';

-- ============================================================================
-- SAMPLE DATA (dev/testing only)
-- ============================================================================

-- Uncomment for dev environment
-- INSERT INTO public.quiz_sessions (user_id, item_code, rang, score, questions_count, correct_answers, session_data)
-- SELECT
--   auth.uid(),
--   'EDN-' || i,
--   CASE WHEN random() < 0.3 THEN 'A' WHEN random() < 0.6 THEN 'B' ELSE 'AB' END,
--   (random() * 100)::INTEGER,
--   10,
--   (random() * 10)::INTEGER,
--   '{"test": true}'::JSONB
-- FROM generate_series(1, 20) i;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Verify table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'quiz_sessions'
  ) THEN
    RAISE EXCEPTION 'Table quiz_sessions was not created';
  END IF;

  -- Verify RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'quiz_sessions'
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on quiz_sessions';
  END IF;

  -- Verify indexes exist (at least user_id index)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'quiz_sessions'
    AND indexname = 'idx_quiz_sessions_user_id'
  ) THEN
    RAISE EXCEPTION 'Required index idx_quiz_sessions_user_id not created';
  END IF;

  RAISE NOTICE '✅ quiz_sessions table created successfully with RLS and indexes';
END $$;

-- ============================================================================
-- NOTES
-- ============================================================================

-- Usage in EnhancedQuiz.tsx:
--
-- const saveQuizSession = async (session: QuizSession) => {
--   const { data: { user } } = await supabase.auth.getUser();
--
--   const { error } = await supabase.from('quiz_sessions').insert({
--     user_id: user.id,
--     item_code: session.itemCode,
--     rang: session.rang,
--     score: session.score,
--     questions_count: session.questions.length,
--     correct_answers: session.answers.filter(a => a.isCorrect).length,
--     session_data: session,
--     time_spent_seconds: session.timeSpent
--   });
-- };

-- Analytics queries examples:
--
-- -- Get user stats
-- SELECT * FROM get_user_quiz_stats('user-uuid-here');
--
-- -- Get item difficulty
-- SELECT * FROM get_item_difficulty('EDN-1');
--
-- -- Recent sessions
-- SELECT * FROM quiz_sessions
-- WHERE user_id = auth.uid()
-- ORDER BY completed_at DESC
-- LIMIT 10;

-- ============================================================================
-- RLS Coverage: Contributes to 100% coverage maintenance
-- Policies: 6 (4 user + 2 admin)
-- ============================================================================
