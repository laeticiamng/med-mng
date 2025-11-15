-- ============================================================================
-- Migration: Create Revision Methods System
-- Date: 2025-11-15
-- Description: Système de méthodes de révision avec 3 stratégies
--              - Méthode des J 2.0 (répétition espacée)
--              - Méthode Blocs Profonds (deep focus)
--              - Méthode QCM First (questions d'abord)
-- ============================================================================

-- ============================================================================
-- 1. Add revision_method to user_profiles
-- ============================================================================

-- Add revision_method column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS revision_method TEXT
DEFAULT 'J_METHOD'
CHECK (revision_method IN ('J_METHOD', 'BLOCK_METHOD', 'QCM_FIRST'));

-- Add method configuration (JSON pour flexibilité)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS revision_method_config JSONB
DEFAULT '{}'::jsonb;

-- Add timestamp for when method was last changed
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS revision_method_changed_at TIMESTAMPTZ;

-- Index for querying by revision method
CREATE INDEX IF NOT EXISTS idx_user_profiles_revision_method
  ON public.user_profiles(revision_method);

COMMENT ON COLUMN public.user_profiles.revision_method IS
  'Méthode de révision active: J_METHOD, BLOCK_METHOD, ou QCM_FIRST';
COMMENT ON COLUMN public.user_profiles.revision_method_config IS
  'Configuration JSON de la méthode (ex: daily_target, intervals, etc.)';

-- ============================================================================
-- 2. TABLE: revision_schedule
-- Description: Planning des révisions pour toutes les méthodes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.revision_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Item reference (flexible: peut être une fiche, un SD, un item EDN, etc.)
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('fiche', 'sd', 'edn_item', 'qcm', 'cas_clinique')),
  item_code TEXT NOT NULL, -- Code de l'item (ex: SD-001, EDN-123)

  -- Scheduling info
  scheduled_for DATE NOT NULL,
  revision_method TEXT NOT NULL CHECK (revision_method IN ('J_METHOD', 'BLOCK_METHOD', 'QCM_FIRST')),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DONE', 'MISSED', 'SKIPPED')),
  completed_at TIMESTAMPTZ,

  -- Method-specific metadata
  revision_number INTEGER DEFAULT 1, -- Pour J_METHOD: 1=J+2, 2=J+7, 3=J+14, 4=J+30
  interval_days INTEGER, -- Intervalle pour cette révision
  priority_score DECIMAL, -- Score de priorité

  -- Performance tracking
  success_rate DECIMAL, -- Taux de réussite lors de la révision
  time_spent_minutes INTEGER, -- Temps passé sur cette révision

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. TABLE: revision_method_effectiveness
-- Description: Suivi de l'efficacité des méthodes pour chaque utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.revision_method_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Method tracking
  revision_method TEXT NOT NULL CHECK (revision_method IN ('J_METHOD', 'BLOCK_METHOD', 'QCM_FIRST')),

  -- Effectiveness metrics
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  average_success_rate DECIMAL DEFAULT 0,
  average_time_per_session INTEGER DEFAULT 0, -- minutes

  -- Engagement metrics
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_items_reviewed INTEGER DEFAULT 0,
  mastery_improvement_rate DECIMAL DEFAULT 0, -- Amélioration du taux de maîtrise

  -- Period tracking
  period_start DATE NOT NULL,
  period_end DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Unique constraint: one active tracking per user per method
  UNIQUE(user_id, revision_method, period_start)
);

-- ============================================================================
-- 4. TABLE: block_method_config
-- Description: Configuration spécifique pour la Méthode Blocs Profonds
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.block_method_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Configuration
  items_per_day INTEGER NOT NULL DEFAULT 5 CHECK (items_per_day > 0 AND items_per_day <= 20),
  target_date DATE NOT NULL,
  selected_items UUID[] NOT NULL, -- Array of item IDs

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Only one active config per user
  UNIQUE(user_id, is_active) WHERE is_active = true
);

-- ============================================================================
-- 5. TABLE: qcm_first_sessions
-- Description: Sessions QCM First avec tracking des fiches à revoir
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.qcm_first_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session info
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_questions INTEGER NOT NULL,

  -- Results
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  success_rate DECIMAL,

  -- Items to review (fiches suggérées basées sur erreurs)
  suggested_fiches UUID[], -- Array of fiche IDs
  fiches_reviewed UUID[], -- Array of reviewed fiche IDs

  -- Status
  completed BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- revision_schedule indexes
CREATE INDEX IF NOT EXISTS idx_revision_schedule_user_id
  ON public.revision_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_revision_schedule_item_id
  ON public.revision_schedule(item_id);
CREATE INDEX IF NOT EXISTS idx_revision_schedule_scheduled_for
  ON public.revision_schedule(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_revision_schedule_status
  ON public.revision_schedule(status);
CREATE INDEX IF NOT EXISTS idx_revision_schedule_method
  ON public.revision_schedule(revision_method);
CREATE INDEX IF NOT EXISTS idx_revision_schedule_user_date
  ON public.revision_schedule(user_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_revision_schedule_user_method
  ON public.revision_schedule(user_id, revision_method);

-- revision_method_effectiveness indexes
CREATE INDEX IF NOT EXISTS idx_revision_effectiveness_user_id
  ON public.revision_method_effectiveness(user_id);
CREATE INDEX IF NOT EXISTS idx_revision_effectiveness_method
  ON public.revision_method_effectiveness(revision_method);
CREATE INDEX IF NOT EXISTS idx_revision_effectiveness_period
  ON public.revision_method_effectiveness(period_start, period_end);

-- block_method_config indexes
CREATE INDEX IF NOT EXISTS idx_block_config_user_id
  ON public.block_method_config(user_id);
CREATE INDEX IF NOT EXISTS idx_block_config_active
  ON public.block_method_config(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_block_config_target_date
  ON public.block_method_config(target_date);

-- qcm_first_sessions indexes
CREATE INDEX IF NOT EXISTS idx_qcm_first_user_id
  ON public.qcm_first_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_qcm_first_session_date
  ON public.qcm_first_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_qcm_first_completed
  ON public.qcm_first_sessions(completed);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

-- revision_schedule RLS
ALTER TABLE public.revision_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own revision schedule"
  ON public.revision_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revision schedule"
  ON public.revision_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revision schedule"
  ON public.revision_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revision schedule"
  ON public.revision_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- revision_method_effectiveness RLS
ALTER TABLE public.revision_method_effectiveness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own effectiveness data"
  ON public.revision_method_effectiveness FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own effectiveness data"
  ON public.revision_method_effectiveness FOR ALL
  USING (auth.uid() = user_id);

-- block_method_config RLS
ALTER TABLE public.block_method_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own block config"
  ON public.block_method_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own block config"
  ON public.block_method_config FOR ALL
  USING (auth.uid() = user_id);

-- qcm_first_sessions RLS
ALTER TABLE public.qcm_first_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own QCM sessions"
  ON public.qcm_first_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own QCM sessions"
  ON public.qcm_first_sessions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at for revision_schedule
CREATE OR REPLACE FUNCTION update_revision_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();

  -- Auto-set completed_at when status changes to DONE
  IF NEW.status = 'DONE' AND OLD.status != 'DONE' THEN
    NEW.completed_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_revision_schedule_updated_at
  BEFORE UPDATE ON public.revision_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_revision_schedule_updated_at();

-- Update updated_at for revision_method_effectiveness
CREATE OR REPLACE FUNCTION update_revision_effectiveness_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_revision_effectiveness_updated_at
  BEFORE UPDATE ON public.revision_method_effectiveness
  FOR EACH ROW
  EXECUTE FUNCTION update_revision_effectiveness_updated_at();

-- Update updated_at for block_method_config
CREATE OR REPLACE FUNCTION update_block_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_block_config_updated_at
  BEFORE UPDATE ON public.block_method_config
  FOR EACH ROW
  EXECUTE FUNCTION update_block_config_updated_at();

-- Update updated_at and calculate success_rate for qcm_first_sessions
CREATE OR REPLACE FUNCTION update_qcm_first_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();

  -- Calculate success rate
  IF NEW.total_questions > 0 THEN
    NEW.success_rate = ROUND((NEW.correct_answers::DECIMAL / NEW.total_questions) * 100, 2);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_qcm_first_sessions_updated_at
  BEFORE UPDATE ON public.qcm_first_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_qcm_first_sessions_updated_at();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get today's revision items for a user
CREATE OR REPLACE FUNCTION get_today_revision_items(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  item_id UUID,
  item_type TEXT,
  item_code TEXT,
  scheduled_for DATE,
  revision_method TEXT,
  status TEXT,
  revision_number INTEGER,
  priority_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rs.id,
    rs.item_id,
    rs.item_type,
    rs.item_code,
    rs.scheduled_for,
    rs.revision_method,
    rs.status,
    rs.revision_number,
    rs.priority_score
  FROM public.revision_schedule rs
  WHERE rs.user_id = p_user_id
    AND rs.scheduled_for = CURRENT_DATE
    AND rs.status = 'PENDING'
  ORDER BY rs.priority_score DESC NULLS LAST, rs.revision_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get overdue revision items
CREATE OR REPLACE FUNCTION get_overdue_revision_items(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  item_id UUID,
  item_code TEXT,
  scheduled_for DATE,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rs.id,
    rs.item_id,
    rs.item_code,
    rs.scheduled_for,
    (CURRENT_DATE - rs.scheduled_for)::INTEGER AS days_overdue
  FROM public.revision_schedule rs
  WHERE rs.user_id = p_user_id
    AND rs.scheduled_for < CURRENT_DATE
    AND rs.status = 'PENDING'
  ORDER BY rs.scheduled_for ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create J Method revisions (J+2, J+7, J+14, J+30)
CREATE OR REPLACE FUNCTION create_j_method_revisions(
  p_user_id UUID,
  p_item_id UUID,
  p_item_type TEXT,
  p_item_code TEXT,
  p_base_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
DECLARE
  intervals INTEGER[] := ARRAY[2, 7, 14, 30];
  interval_value INTEGER;
  revision_num INTEGER := 1;
BEGIN
  FOREACH interval_value IN ARRAY intervals
  LOOP
    INSERT INTO public.revision_schedule (
      user_id,
      item_id,
      item_type,
      item_code,
      scheduled_for,
      revision_method,
      status,
      revision_number,
      interval_days
    ) VALUES (
      p_user_id,
      p_item_id,
      p_item_type,
      p_item_code,
      p_base_date + interval_value,
      'J_METHOD',
      'PENDING',
      revision_num,
      interval_value
    )
    ON CONFLICT DO NOTHING;

    revision_num := revision_num + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get revision method statistics for a user
CREATE OR REPLACE FUNCTION get_revision_method_stats(p_user_id UUID)
RETURNS TABLE (
  current_method TEXT,
  total_scheduled INTEGER,
  completed_today INTEGER,
  pending_today INTEGER,
  overdue_count INTEGER,
  completion_rate DECIMAL,
  average_success_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.revision_method AS current_method,
    (SELECT COUNT(*)::INTEGER FROM revision_schedule WHERE user_id = p_user_id) AS total_scheduled,
    (SELECT COUNT(*)::INTEGER FROM revision_schedule
     WHERE user_id = p_user_id AND scheduled_for = CURRENT_DATE AND status = 'DONE') AS completed_today,
    (SELECT COUNT(*)::INTEGER FROM revision_schedule
     WHERE user_id = p_user_id AND scheduled_for = CURRENT_DATE AND status = 'PENDING') AS pending_today,
    (SELECT COUNT(*)::INTEGER FROM revision_schedule
     WHERE user_id = p_user_id AND scheduled_for < CURRENT_DATE AND status = 'PENDING') AS overdue_count,
    ROUND(
      (SELECT COUNT(*)::DECIMAL FROM revision_schedule WHERE user_id = p_user_id AND status = 'DONE') /
      NULLIF((SELECT COUNT(*) FROM revision_schedule WHERE user_id = p_user_id), 0) * 100,
      2
    ) AS completion_rate,
    (SELECT AVG(success_rate) FROM revision_schedule WHERE user_id = p_user_id AND success_rate IS NOT NULL) AS average_success_rate
  FROM public.user_profiles up
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark revision as completed
CREATE OR REPLACE FUNCTION complete_revision(
  p_revision_id UUID,
  p_success_rate DECIMAL DEFAULT NULL,
  p_time_spent_minutes INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.revision_schedule
  SET
    status = 'DONE',
    completed_at = now(),
    success_rate = COALESCE(p_success_rate, success_rate),
    time_spent_minutes = COALESCE(p_time_spent_minutes, time_spent_minutes),
    notes = COALESCE(p_notes, notes)
  WHERE id = p_revision_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.revision_schedule IS
  'Planning de révision pour toutes les méthodes (J, Blocs, QCM First)';
COMMENT ON TABLE public.revision_method_effectiveness IS
  'Suivi de l''efficacité de chaque méthode par utilisateur';
COMMENT ON TABLE public.block_method_config IS
  'Configuration de la Méthode Blocs Profonds';
COMMENT ON TABLE public.qcm_first_sessions IS
  'Sessions QCM First avec suggestions de fiches';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Verify revision_schedule table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'revision_schedule'
  ) THEN
    RAISE EXCEPTION 'Table revision_schedule was not created';
  END IF;

  -- Verify revision_method column in user_profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'revision_method'
  ) THEN
    RAISE EXCEPTION 'Column revision_method was not added to user_profiles';
  END IF;

  RAISE NOTICE '✅ Revision methods system created successfully';
  RAISE NOTICE '   - revision_method column added to user_profiles';
  RAISE NOTICE '   - revision_schedule table created';
  RAISE NOTICE '   - revision_method_effectiveness table created';
  RAISE NOTICE '   - block_method_config table created';
  RAISE NOTICE '   - qcm_first_sessions table created';
  RAISE NOTICE '   - All RLS policies enabled';
END $$;
