-- ============================================================================
-- Migration: EDN unified progression infrastructure
-- Description: materialized view, transactional sync logs, session plans table
-- ============================================================================

-- 1. Synchronisation runs table ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.edn_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  triggered_by uuid,
  source text,
  items_processed integer NOT NULL DEFAULT 0,
  items_updated integer NOT NULL DEFAULT 0,
  items_unchanged integer NOT NULL DEFAULT 0,
  items_failed integer NOT NULL DEFAULT 0,
  notes text,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_edn_sync_runs_status ON public.edn_sync_runs(status);
CREATE INDEX IF NOT EXISTS idx_edn_sync_runs_started_at ON public.edn_sync_runs(started_at DESC);

-- 2. Synchronisation run items -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.edn_sync_run_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.edn_sync_runs(id) ON DELETE CASCADE,
  item_id uuid,
  item_code text,
  status text NOT NULL,
  before_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  after_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  diff_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edn_sync_run_items_run_id ON public.edn_sync_run_items(run_id);
CREATE INDEX IF NOT EXISTS idx_edn_sync_run_items_item_code ON public.edn_sync_run_items(item_code);

-- 3. Session plans table -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.edn_session_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  focus_item_code text,
  focus_theme text,
  plan jsonb NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edn_session_plans
  ADD CONSTRAINT edn_session_plans_user_id_fkey FOREIGN KEY (user_id)
  REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_edn_session_plans_user_id ON public.edn_session_plans(user_id);

-- Trigger to keep updated_at fresh
CREATE TRIGGER edn_session_plans_set_updated_at
  BEFORE UPDATE ON public.edn_session_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Row level security --------------------------------------------------------
ALTER TABLE public.edn_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edn_sync_run_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edn_session_plans ENABLE ROW LEVEL SECURITY;

-- Policies for sync tables: only service role can manage them, authenticated users can read summaries
DROP POLICY IF EXISTS "service_role_manage_edn_sync_runs" ON public.edn_sync_runs;
CREATE POLICY "service_role_manage_edn_sync_runs" ON public.edn_sync_runs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "read_own_edn_sync_runs" ON public.edn_sync_runs;
CREATE POLICY "read_own_edn_sync_runs" ON public.edn_sync_runs
  FOR SELECT
  USING (triggered_by IS NOT DISTINCT FROM auth.uid());

DROP POLICY IF EXISTS "service_role_manage_edn_sync_run_items" ON public.edn_sync_run_items;
CREATE POLICY "service_role_manage_edn_sync_run_items" ON public.edn_sync_run_items
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "read_edn_sync_run_items_via_run" ON public.edn_sync_run_items;
CREATE POLICY "read_edn_sync_run_items_via_run" ON public.edn_sync_run_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.edn_sync_runs r
      WHERE r.id = edn_sync_run_items.run_id
        AND r.triggered_by IS NOT DISTINCT FROM auth.uid()
    )
  );

DROP POLICY IF EXISTS "manage_own_edn_session_plans" ON public.edn_session_plans;
CREATE POLICY "manage_own_edn_session_plans" ON public.edn_session_plans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Materialized view ---------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS public.edn_unified_materialized;

CREATE MATERIALIZED VIEW public.edn_unified_materialized AS
WITH base AS (
  SELECT
    ei.id AS item_id,
    ei.item_code,
    ei.slug,
    ei.title,
    ei.specialite,
    ei.domaine_medical,
    ei.niveau_complexite,
    ei.tags_medicaux,
    ei.mots_cles,
    ei.tableau_rang_a,
    ei.tableau_rang_b,
    ei.competences_oic_rang_a,
    ei.competences_oic_rang_b,
    ei.competences_count_rang_a,
    ei.competences_count_rang_b,
    ei.competences_count_total,
    ei.updated_at,
    ei.created_at
  FROM public.edn_items_complete ei
), valeurs AS (
  SELECT
    b.item_id,
    jsonb_agg(section.value) FILTER (WHERE section.value IS NOT NULL) AS valeurs_professionnelles
  FROM base b
  LEFT JOIN LATERAL jsonb_array_elements(COALESCE(b.tableau_rang_a -> 'sections', '[]'::jsonb)) AS section(value)
    ON TRUE
  WHERE
    section.value ->> 'title' ILIKE '%valeur%'
    OR section.value ->> 'content' ILIKE '%valeur%'
    OR section.value ->> 'concept' ILIKE '%valeur%'
  GROUP BY b.item_id
), ecos AS (
  SELECT
    situation_number,
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'title', title,
        'content', content
      )
    ) AS ecos_contexts
  FROM public.ecos_situations_complete
  GROUP BY situation_number
)
SELECT
  b.item_id,
  b.item_code,
  b.slug,
  b.title,
  b.specialite,
  b.domaine_medical,
  b.niveau_complexite,
  b.tags_medicaux,
  b.mots_cles,
  b.updated_at,
  b.created_at,
  COALESCE(b.competences_count_rang_a, jsonb_array_length(COALESCE(b.competences_oic_rang_a, '[]'::jsonb))) AS rang_a_competence_count,
  COALESCE(b.competences_count_rang_b, jsonb_array_length(COALESCE(b.competences_oic_rang_b, '[]'::jsonb))) AS rang_b_competence_count,
  COALESCE(
    b.competences_count_total,
    COALESCE(b.competences_count_rang_a, jsonb_array_length(COALESCE(b.competences_oic_rang_a, '[]'::jsonb))) +
    COALESCE(b.competences_count_rang_b, jsonb_array_length(COALESCE(b.competences_oic_rang_b, '[]'::jsonb)))
  ) AS total_competence_count,
  COALESCE(valeurs.valeurs_professionnelles, '[]'::jsonb) AS valeurs_professionnelles,
  jsonb_build_object(
    'rang_a', COALESCE(b.competences_oic_rang_a, '[]'::jsonb),
    'rang_b', COALESCE(b.competences_oic_rang_b, '[]'::jsonb)
  ) AS competences_oic,
  jsonb_build_object(
    'rang_a', COALESCE(b.tableau_rang_a, '{}'::jsonb),
    'rang_b', COALESCE(b.tableau_rang_b, '{}'::jsonb)
  ) AS tableaux,
  COALESCE(ecos.ecos_contexts, '[]'::jsonb) AS ecos_contexts
FROM base b
LEFT JOIN valeurs ON valeurs.item_id = b.item_id
LEFT JOIN ecos ON ecos.situation_number = b.item_code;

CREATE UNIQUE INDEX IF NOT EXISTS idx_edn_unified_materialized_item_id
  ON public.edn_unified_materialized (item_id);
CREATE INDEX IF NOT EXISTS idx_edn_unified_materialized_item_code
  ON public.edn_unified_materialized (item_code);
CREATE INDEX IF NOT EXISTS idx_edn_unified_materialized_specialite
  ON public.edn_unified_materialized (specialite);

-- 6. Transactional sync function ----------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_edn_sync(
  payload jsonb,
  source text DEFAULT 'edge',
  triggered_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  run_id uuid;
  processed integer := 0;
  updated integer := 0;
  unchanged integer := 0;
  failed integer := 0;
  record_item record;
  before_record public.edn_items_complete%ROWTYPE;
BEGIN
  INSERT INTO public.edn_sync_runs (status, source, triggered_by, metadata)
  VALUES (
    'running',
    source,
    triggered_by,
    jsonb_build_object('payload_size', jsonb_array_length(COALESCE(payload, '[]'::jsonb)))
  )
  RETURNING id INTO run_id;

  FOR record_item IN
    SELECT
      (value ->> 'item_id')::uuid AS item_id,
      value ->> 'item_code' AS item_code,
      COALESCE(value ->> 'status', 'update') AS status,
      value -> 'competences_rang_a' AS competences_rang_a,
      value -> 'competences_rang_b' AS competences_rang_b,
      value -> 'tableau_rang_a' AS tableau_rang_a,
      value -> 'tableau_rang_b' AS tableau_rang_b,
      (value ->> 'rang_a_count')::integer AS rang_a_count,
      (value ->> 'rang_b_count')::integer AS rang_b_count,
      (value ->> 'total_count')::integer AS total_count,
      value -> 'diff_summary' AS diff_summary
    FROM jsonb_array_elements(COALESCE(payload, '[]'::jsonb)) AS value
  LOOP
    processed := processed + 1;

    BEGIN
      SELECT * INTO before_record
      FROM public.edn_items_complete
      WHERE id = record_item.item_id
      FOR UPDATE;

      IF NOT FOUND THEN
        failed := failed + 1;
        INSERT INTO public.edn_sync_run_items (run_id, item_id, item_code, status, error_message)
        VALUES (run_id, record_item.item_id, record_item.item_code, 'missing', 'Item introuvable dans edn_items_complete');
        CONTINUE;
      END IF;

      IF record_item.status = 'unchanged' THEN
        unchanged := unchanged + 1;
        INSERT INTO public.edn_sync_run_items (run_id, item_id, item_code, status, before_counts, after_counts, diff_summary)
        VALUES (
          run_id,
          record_item.item_id,
          record_item.item_code,
          'unchanged',
          jsonb_build_object(
            'rang_a', before_record.competences_count_rang_a,
            'rang_b', before_record.competences_count_rang_b,
            'total', before_record.competences_count_total
          ),
          jsonb_build_object(
            'rang_a', before_record.competences_count_rang_a,
            'rang_b', before_record.competences_count_rang_b,
            'total', before_record.competences_count_total
          ),
          COALESCE(record_item.diff_summary, '{}'::jsonb)
        );
        CONTINUE;
      END IF;

      UPDATE public.edn_items_complete
      SET
        competences_oic_rang_a = COALESCE(record_item.competences_rang_a, before_record.competences_oic_rang_a),
        competences_oic_rang_b = COALESCE(record_item.competences_rang_b, before_record.competences_oic_rang_b),
        competences_count_rang_a = COALESCE(
          record_item.rang_a_count,
          jsonb_array_length(COALESCE(record_item.competences_rang_a, before_record.competences_oic_rang_a, '[]'::jsonb))
        ),
        competences_count_rang_b = COALESCE(
          record_item.rang_b_count,
          jsonb_array_length(COALESCE(record_item.competences_rang_b, before_record.competences_oic_rang_b, '[]'::jsonb))
        ),
        competences_count_total = COALESCE(
          record_item.total_count,
          COALESCE(
            record_item.rang_a_count,
            jsonb_array_length(COALESCE(record_item.competences_rang_a, before_record.competences_oic_rang_a, '[]'::jsonb))
          ) +
          COALESCE(
            record_item.rang_b_count,
            jsonb_array_length(COALESCE(record_item.competences_rang_b, before_record.competences_oic_rang_b, '[]'::jsonb))
          )
        ),
        tableau_rang_a = COALESCE(record_item.tableau_rang_a, before_record.tableau_rang_a),
        tableau_rang_b = COALESCE(record_item.tableau_rang_b, before_record.tableau_rang_b),
        updated_at = now()
      WHERE id = record_item.item_id;

      updated := updated + 1;

      INSERT INTO public.edn_sync_run_items (run_id, item_id, item_code, status, before_counts, after_counts, diff_summary)
      VALUES (
        run_id,
        record_item.item_id,
        record_item.item_code,
        'updated',
        jsonb_build_object(
          'rang_a', before_record.competences_count_rang_a,
          'rang_b', before_record.competences_count_rang_b,
          'total', before_record.competences_count_total
        ),
        jsonb_build_object(
          'rang_a', COALESCE(record_item.rang_a_count, before_record.competences_count_rang_a),
          'rang_b', COALESCE(record_item.rang_b_count, before_record.competences_count_rang_b),
          'total', COALESCE(record_item.total_count, before_record.competences_count_total)
        ),
        COALESCE(record_item.diff_summary, '{}'::jsonb)
      );
    EXCEPTION WHEN OTHERS THEN
      failed := failed + 1;
      INSERT INTO public.edn_sync_run_items (run_id, item_id, item_code, status, error_message)
      VALUES (run_id, record_item.item_id, record_item.item_code, 'error', SQLERRM);
      RAISE;
    END;
  END LOOP;

  REFRESH MATERIALIZED VIEW public.edn_unified_materialized;

  UPDATE public.edn_sync_runs
  SET
    status = 'succeeded',
    finished_at = now(),
    items_processed = processed,
    items_updated = updated,
    items_unchanged = unchanged,
    items_failed = failed
  WHERE id = run_id;

  RETURN jsonb_build_object(
    'run_id', run_id,
    'processed', processed,
    'updated', updated,
    'unchanged', unchanged,
    'failed', failed
  );

EXCEPTION WHEN OTHERS THEN
  IF run_id IS NOT NULL THEN
    UPDATE public.edn_sync_runs
    SET
      status = 'failed',
      finished_at = now(),
      error_message = SQLERRM
    WHERE id = run_id;
  END IF;
  RAISE;
END;
$$;

-- 7. Convenience helper to refresh manually -----------------------------------
CREATE OR REPLACE FUNCTION public.refresh_edn_unified_materialized()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.edn_unified_materialized;
END;
$$;

