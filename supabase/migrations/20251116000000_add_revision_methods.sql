-- ============================================================================
-- Migration: Add Revision Methods System
-- Date: 2025-11-16
-- Description: Tables et colonnes pour les 3 méthodes de révision
--              - Méthode des J 2.0
--              - Méthode Blocs Profonds
--              - Méthode QCM First
-- ============================================================================

-- ============================================================================
-- ENUM: revision_method_type
-- Description: Types de méthodes de révision disponibles
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE revision_method_type AS ENUM (
    'J_METHOD',        -- Méthode des J 2.0 (répétition espacée)
    'BLOCK_METHOD',    -- Méthode Blocs Profonds (deep focus)
    'QCM_FIRST'        -- Méthode QCM First (questions → fiches)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- ENUM: revision_status
-- Description: Statuts d'une révision planifiée
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE revision_status AS ENUM (
    'PENDING',   -- En attente
    'DONE',      -- Faite
    'MISSED',    -- Manquée/en retard
    'SKIPPED'    -- Volontairement sautée
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- ALTER TABLE: user_profiles
-- Description: Ajout de la méthode de révision préférée
-- ============================================================================

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS revision_method revision_method_type DEFAULT 'J_METHOD';

COMMENT ON COLUMN public.user_profiles.revision_method IS
  'Méthode de révision active choisie par l''utilisateur';

-- ============================================================================
-- TABLE: revision_schedule
-- Description: Planning des révisions pour toutes les méthodes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.revision_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Item à réviser (peut être fiche, SD, item EDN, etc.)
  item_type TEXT NOT NULL, -- 'edn', 'ecos', 'fiche', 'sd', etc.
  item_id TEXT NOT NULL,   -- ID de l'item
  item_title TEXT,         -- Titre pour affichage
  item_data JSONB,         -- Données supplémentaires (tags, etc.)

  -- Méthode et planification
  revision_method revision_method_type NOT NULL,
  scheduled_for DATE NOT NULL,

  -- Statut et completion
  status revision_status DEFAULT 'PENDING',
  completed_at TIMESTAMPTZ,

  -- Métadonnées pour chaque méthode
  -- Pour Méthode des J: {repetition_number: 1-4, interval_days: 2|7|14|30}
  -- Pour Blocs Profonds: {block_position: 1-N, session_duration: 60}
  -- Pour QCM First: {question_ids: [], error_count: N}
  method_metadata JSONB DEFAULT '{}'::jsonb,

  -- Performance tracking
  success BOOLEAN,         -- L'utilisateur a-t-il réussi ?
  duration_minutes INTEGER, -- Temps passé sur la révision
  notes TEXT,              -- Notes de l'utilisateur

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- TABLE: revision_method_config
-- Description: Configuration spécifique de chaque méthode par utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.revision_method_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type revision_method_type NOT NULL,

  -- Configuration générique (JSONB pour flexibilité)
  -- Méthode des J: {intervals: [2, 7, 14, 30], auto_schedule: true}
  -- Blocs Profonds: {items_per_day: 5, target_date: '2025-06-15', deep_work_duration: 60}
  -- QCM First: {questions_per_session: 20, difficulty_threshold: 0.6, auto_review: true}
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Activation
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Contrainte: un seul config actif par méthode par user
  UNIQUE(user_id, method_type)
);

-- ============================================================================
-- TABLE: revision_sessions
-- Description: Historique des sessions de révision complétées
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.revision_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Méthode utilisée
  revision_method revision_method_type NOT NULL,

  -- Items révisés
  items_reviewed JSONB NOT NULL, -- [{item_id, item_type, success, duration_seconds}]
  items_count INTEGER NOT NULL DEFAULT 0,

  -- Métriques de performance
  success_rate NUMERIC(5,2), -- Pourcentage de réussite (0-100)
  total_duration_minutes INTEGER NOT NULL,

  -- Résumé de la session
  session_type TEXT, -- 'daily', 'review', 'catch_up'
  notes TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- TABLE: method_performance_metrics
-- Description: Métriques de performance par méthode pour analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.method_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type revision_method_type NOT NULL,

  -- Période de mesure
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Métriques
  sessions_count INTEGER DEFAULT 0,
  total_items_reviewed INTEGER DEFAULT 0,
  average_success_rate NUMERIC(5,2), -- 0-100
  total_time_minutes INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2), -- % des révisions planifiées qui ont été faites

  -- Streak tracking
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Index pour requêtes analytics
  UNIQUE(user_id, method_type, period_start, period_end)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- revision_schedule
CREATE INDEX IF NOT EXISTS idx_revision_schedule_user_id
  ON public.revision_schedule(user_id);

CREATE INDEX IF NOT EXISTS idx_revision_schedule_scheduled_for
  ON public.revision_schedule(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_revision_schedule_status
  ON public.revision_schedule(status);

CREATE INDEX IF NOT EXISTS idx_revision_schedule_method
  ON public.revision_schedule(revision_method);

CREATE INDEX IF NOT EXISTS idx_revision_schedule_user_date
  ON public.revision_schedule(user_id, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_revision_schedule_user_status
  ON public.revision_schedule(user_id, status);

CREATE INDEX IF NOT EXISTS idx_revision_schedule_item
  ON public.revision_schedule(item_type, item_id);

-- revision_method_config
CREATE INDEX IF NOT EXISTS idx_revision_method_config_user_id
  ON public.revision_method_config(user_id);

CREATE INDEX IF NOT EXISTS idx_revision_method_config_method
  ON public.revision_method_config(method_type);

CREATE INDEX IF NOT EXISTS idx_revision_method_config_active
  ON public.revision_method_config(user_id, is_active);

-- revision_sessions
CREATE INDEX IF NOT EXISTS idx_revision_sessions_user_id
  ON public.revision_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_revision_sessions_method
  ON public.revision_sessions(revision_method);

CREATE INDEX IF NOT EXISTS idx_revision_sessions_started_at
  ON public.revision_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_revision_sessions_user_method
  ON public.revision_sessions(user_id, revision_method);

-- method_performance_metrics
CREATE INDEX IF NOT EXISTS idx_method_performance_user_id
  ON public.method_performance_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_method_performance_method
  ON public.method_performance_metrics(method_type);

CREATE INDEX IF NOT EXISTS idx_method_performance_period
  ON public.method_performance_metrics(period_start, period_end);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

-- revision_schedule
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

-- revision_method_config
ALTER TABLE public.revision_method_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own method config"
  ON public.revision_method_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own method config"
  ON public.revision_method_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own method config"
  ON public.revision_method_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own method config"
  ON public.revision_method_config FOR DELETE
  USING (auth.uid() = user_id);

-- revision_sessions
ALTER TABLE public.revision_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own revision sessions"
  ON public.revision_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revision sessions"
  ON public.revision_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- method_performance_metrics
ALTER TABLE public.method_performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own performance metrics"
  ON public.method_performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own performance metrics"
  ON public.method_performance_metrics FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for revision_schedule
CREATE OR REPLACE FUNCTION update_revision_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();

  -- Auto-set completed_at when status changes to DONE
  IF NEW.status = 'DONE' AND OLD.status != 'DONE' THEN
    NEW.completed_at = now();
  END IF;

  -- Mark as MISSED if past scheduled date and still PENDING
  IF NEW.status = 'PENDING' AND NEW.scheduled_for < CURRENT_DATE THEN
    NEW.status = 'MISSED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_revision_schedule_updated_at
  BEFORE UPDATE ON public.revision_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_revision_schedule_updated_at();

-- Auto-update updated_at for revision_method_config
CREATE OR REPLACE FUNCTION update_revision_method_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_revision_method_config_updated_at
  BEFORE UPDATE ON public.revision_method_config
  FOR EACH ROW
  EXECUTE FUNCTION update_revision_method_config_updated_at();

-- Auto-update updated_at for method_performance_metrics
CREATE OR REPLACE FUNCTION update_method_performance_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_method_performance_metrics_updated_at
  BEFORE UPDATE ON public.method_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_method_performance_metrics_updated_at();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get today's revisions for a user
CREATE OR REPLACE FUNCTION get_today_revisions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  item_type TEXT,
  item_id TEXT,
  item_title TEXT,
  revision_method revision_method_type,
  status revision_status,
  scheduled_for DATE,
  method_metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rs.id,
    rs.item_type,
    rs.item_id,
    rs.item_title,
    rs.revision_method,
    rs.status,
    rs.scheduled_for,
    rs.method_metadata
  FROM public.revision_schedule rs
  WHERE rs.user_id = p_user_id
    AND rs.scheduled_for = CURRENT_DATE
    AND rs.status IN ('PENDING', 'MISSED')
  ORDER BY
    CASE rs.status
      WHEN 'MISSED' THEN 1
      WHEN 'PENDING' THEN 2
    END,
    rs.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get overdue revisions
CREATE OR REPLACE FUNCTION get_overdue_revisions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  item_type TEXT,
  item_id TEXT,
  item_title TEXT,
  scheduled_for DATE,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rs.id,
    rs.item_type,
    rs.item_id,
    rs.item_title,
    rs.scheduled_for,
    (CURRENT_DATE - rs.scheduled_for)::INTEGER
  FROM public.revision_schedule rs
  WHERE rs.user_id = p_user_id
    AND rs.scheduled_for < CURRENT_DATE
    AND rs.status IN ('PENDING', 'MISSED')
  ORDER BY rs.scheduled_for ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule J Method revisions (J+2, J+7, J+14, J+30)
CREATE OR REPLACE FUNCTION schedule_j_method_revisions(
  p_user_id UUID,
  p_item_type TEXT,
  p_item_id TEXT,
  p_item_title TEXT,
  p_item_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_intervals INTEGER[] := ARRAY[2, 7, 14, 30];
  v_interval INTEGER;
  v_repetition_num INTEGER := 1;
BEGIN
  -- Delete existing pending revisions for this item (allow re-scheduling)
  DELETE FROM public.revision_schedule
  WHERE user_id = p_user_id
    AND item_type = p_item_type
    AND item_id = p_item_id
    AND status = 'PENDING'
    AND revision_method = 'J_METHOD';

  -- Create 4 revisions (J+2, J+7, J+14, J+30)
  FOREACH v_interval IN ARRAY v_intervals
  LOOP
    INSERT INTO public.revision_schedule (
      user_id,
      item_type,
      item_id,
      item_title,
      item_data,
      revision_method,
      scheduled_for,
      status,
      method_metadata
    ) VALUES (
      p_user_id,
      p_item_type,
      p_item_id,
      p_item_title,
      p_item_data,
      'J_METHOD',
      CURRENT_DATE + v_interval,
      'PENDING',
      jsonb_build_object(
        'repetition_number', v_repetition_num,
        'interval_days', v_interval,
        'initial_date', CURRENT_DATE
      )
    );

    v_repetition_num := v_repetition_num + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark revision as done
CREATE OR REPLACE FUNCTION mark_revision_done(
  p_revision_id UUID,
  p_success BOOLEAN DEFAULT true,
  p_duration_minutes INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.revision_schedule
  SET
    status = 'DONE',
    completed_at = now(),
    success = p_success,
    duration_minutes = p_duration_minutes,
    notes = p_notes
  WHERE id = p_revision_id
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's active revision method
CREATE OR REPLACE FUNCTION get_user_revision_method(p_user_id UUID)
RETURNS revision_method_type AS $$
DECLARE
  v_method revision_method_type;
BEGIN
  SELECT revision_method INTO v_method
  FROM public.user_profiles
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_method, 'J_METHOD'::revision_method_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user's revision method
CREATE OR REPLACE FUNCTION update_user_revision_method(
  p_user_id UUID,
  p_new_method revision_method_type
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    revision_method = p_new_method,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get revision stats by method
CREATE OR REPLACE FUNCTION get_revision_stats_by_method(
  p_user_id UUID,
  p_method revision_method_type
)
RETURNS TABLE (
  total_scheduled BIGINT,
  completed BIGINT,
  pending BIGINT,
  missed BIGINT,
  completion_rate NUMERIC,
  average_success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(CASE WHEN status = 'DONE' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN status = 'MISSED' THEN 1 END)::BIGINT,
    ROUND(
      (COUNT(CASE WHEN status = 'DONE' THEN 1 END)::DECIMAL /
       NULLIF(COUNT(*), 0) * 100),
      2
    ),
    ROUND(
      AVG(CASE WHEN success = true THEN 100 WHEN success = false THEN 0 END),
      2
    )
  FROM public.revision_schedule
  WHERE user_id = p_user_id
    AND revision_method = p_method;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.revision_schedule IS
  'Planning des révisions pour toutes les méthodes (J 2.0, Blocs Profonds, QCM First)';

COMMENT ON TABLE public.revision_method_config IS
  'Configuration personnalisée de chaque méthode par utilisateur';

COMMENT ON TABLE public.revision_sessions IS
  'Historique des sessions de révision complétées pour analytics';

COMMENT ON TABLE public.method_performance_metrics IS
  'Métriques de performance agrégées par méthode et période';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON public.revision_schedule TO authenticated;
GRANT ALL ON public.revision_method_config TO authenticated;
GRANT ALL ON public.revision_sessions TO authenticated;
GRANT ALL ON public.method_performance_metrics TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Verify tables
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('revision_schedule', 'revision_method_config', 'revision_sessions', 'method_performance_metrics')
    HAVING COUNT(*) = 4
  ) THEN
    RAISE EXCEPTION 'Not all revision tables were created';
  END IF;

  -- Verify column added to user_profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'revision_method'
  ) THEN
    RAISE EXCEPTION 'Column revision_method not added to user_profiles';
  END IF;

  RAISE NOTICE '✅ Revision methods system created successfully';
END $$;
