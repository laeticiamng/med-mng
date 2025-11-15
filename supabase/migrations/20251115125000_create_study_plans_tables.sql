-- ============================================================================
-- Migration: Create study_plans and study_sessions tables
-- Date: 2025-11-15
-- Description: Tables pour la gestion des plans d'étude et sessions
-- Résout: TODO dans StudyPlanManager.tsx:119
-- ============================================================================

-- ============================================================================
-- TABLE: study_plans
-- Description: Plans d'étude créés par les utilisateurs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Plan details
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),

  -- Progress metrics
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  sessions_completed INTEGER DEFAULT 0 CHECK (sessions_completed >= 0),
  total_sessions INTEGER NOT NULL CHECK (total_sessions > 0),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_progress CHECK (
    sessions_completed <= total_sessions
  )
);

-- ============================================================================
-- TABLE: study_sessions
-- Description: Sessions d'étude liées aux plans
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session details
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  scheduled_date DATE NOT NULL,

  -- Completion tracking
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Study Plans
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id
  ON public.study_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_study_plans_status
  ON public.study_plans(status);

CREATE INDEX IF NOT EXISTS idx_study_plans_target_date
  ON public.study_plans(target_date);

CREATE INDEX IF NOT EXISTS idx_study_plans_priority
  ON public.study_plans(priority);

-- Study Sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_plan_id
  ON public.study_sessions(plan_id);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id
  ON public.study_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_study_sessions_scheduled_date
  ON public.study_sessions(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_study_sessions_completed
  ON public.study_sessions(completed);

CREATE INDEX IF NOT EXISTS idx_study_sessions_plan_user
  ON public.study_sessions(plan_id, user_id);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

-- Study Plans RLS
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own study plans"
  ON public.study_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plans"
  ON public.study_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans"
  ON public.study_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans"
  ON public.study_plans FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all study plans"
  ON public.study_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Study Sessions RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own study sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
  ON public.study_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all study sessions"
  ON public.study_sessions FOR SELECT
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

-- Update updated_at for study_plans
CREATE OR REPLACE FUNCTION update_study_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_study_plans_updated_at
  BEFORE UPDATE ON public.study_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_study_plans_updated_at();

-- Update updated_at for study_sessions
CREATE OR REPLACE FUNCTION update_study_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.completed = true AND OLD.completed = false THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_study_sessions_updated_at
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_study_sessions_updated_at();

-- Auto-update plan progress when session completed
CREATE OR REPLACE FUNCTION update_plan_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_sessions INT;
  completed_sessions INT;
  new_progress INT;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO total_sessions
  FROM public.study_sessions
  WHERE plan_id = NEW.plan_id;

  SELECT COUNT(*) INTO completed_sessions
  FROM public.study_sessions
  WHERE plan_id = NEW.plan_id AND completed = true;

  -- Calculate progress
  new_progress := ROUND((completed_sessions::DECIMAL / NULLIF(total_sessions, 0)) * 100);

  -- Update plan
  UPDATE public.study_plans
  SET
    sessions_completed = completed_sessions,
    progress = new_progress,
    status = CASE
      WHEN new_progress >= 100 THEN 'completed'
      ELSE status
    END,
    completed_at = CASE
      WHEN new_progress >= 100 THEN now()
      ELSE completed_at
    END
  WHERE id = NEW.plan_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_plan_progress
  AFTER INSERT OR UPDATE OF completed ON public.study_sessions
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION update_plan_progress();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get user study statistics
CREATE OR REPLACE FUNCTION get_user_study_stats(p_user_id UUID)
RETURNS TABLE (
  total_plans BIGINT,
  active_plans BIGINT,
  completed_plans BIGINT,
  paused_plans BIGINT,
  total_sessions BIGINT,
  completed_sessions BIGINT,
  average_progress NUMERIC,
  total_study_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT sp.id)::BIGINT,
    COUNT(DISTINCT CASE WHEN sp.status = 'active' THEN sp.id END)::BIGINT,
    COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.id END)::BIGINT,
    COUNT(DISTINCT CASE WHEN sp.status = 'paused' THEN sp.id END)::BIGINT,
    COUNT(ss.id)::BIGINT,
    COUNT(CASE WHEN ss.completed THEN ss.id END)::BIGINT,
    ROUND(AVG(sp.progress), 2),
    ROUND(SUM(CASE WHEN ss.completed THEN ss.duration_minutes ELSE 0 END)::DECIMAL / 60, 2)
  FROM public.study_plans sp
  LEFT JOIN public.study_sessions ss ON ss.plan_id = sp.id
  WHERE sp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get overdue plans
CREATE OR REPLACE FUNCTION get_overdue_plans(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  target_date DATE,
  days_overdue INTEGER,
  progress INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id,
    sp.title,
    sp.target_date,
    (CURRENT_DATE - sp.target_date)::INTEGER,
    sp.progress
  FROM public.study_plans sp
  WHERE sp.user_id = p_user_id
    AND sp.status = 'active'
    AND sp.target_date < CURRENT_DATE
    AND sp.progress < 100
  ORDER BY sp.target_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.study_plans IS 'Plans d''étude créés par les utilisateurs pour organiser leur révision';
COMMENT ON TABLE public.study_sessions IS 'Sessions d''étude individuelles liées aux plans';

COMMENT ON COLUMN public.study_plans.target_date IS 'Date cible de complétion du plan';
COMMENT ON COLUMN public.study_plans.progress IS 'Progression en pourcentage (0-100)';
COMMENT ON COLUMN public.study_plans.sessions_completed IS 'Nombre de sessions complétées';

COMMENT ON COLUMN public.study_sessions.duration_minutes IS 'Durée planifiée de la session en minutes';
COMMENT ON COLUMN public.study_sessions.scheduled_date IS 'Date planifiée de la session';
COMMENT ON COLUMN public.study_sessions.completed_at IS 'Date/heure de complétion réelle';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Verify study_plans table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'study_plans'
  ) THEN
    RAISE EXCEPTION 'Table study_plans was not created';
  END IF;

  -- Verify study_sessions table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'study_sessions'
  ) THEN
    RAISE EXCEPTION 'Table study_sessions was not created';
  END IF;

  -- Verify RLS on both tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('study_plans', 'study_sessions')
    AND rowsecurity = true
    HAVING COUNT(*) = 2
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on all tables';
  END IF;

  RAISE NOTICE '✅ study_plans and study_sessions tables created successfully with RLS';
END $$;

-- ============================================================================
-- NOTES
-- ============================================================================

-- Usage in StudyPlanManager.tsx:
--
-- // Fetch plans
-- const { data: plans } = await supabase
--   .from('study_plans')
--   .select('*')
--   .eq('user_id', user.id)
--   .order('created_at', { ascending: false });
--
-- // Create plan
-- const { data, error } = await supabase
--   .from('study_plans')
--   .insert({
--     user_id: user.id,
--     title: 'My Study Plan',
--     description: 'Description',
--     target_date: '2025-12-31',
--     total_sessions: 20
--   })
--   .select()
--   .single();
--
-- // Get stats
-- SELECT * FROM get_user_study_stats('user-uuid');

-- ============================================================================
-- RLS Coverage: 2 tables, 10 policies (5 per table)
-- ============================================================================
