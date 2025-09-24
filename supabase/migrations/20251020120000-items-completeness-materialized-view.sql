-- Items completeness materialized view and refresh scheduling

-- Ensure required extensions for scheduling are available
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing view if present to allow recreation
DROP MATERIALIZED VIEW IF EXISTS public.items_completeness;

-- Build canonical mapping for expected OIC competences by item
CREATE MATERIALIZED VIEW public.items_completeness AS
WITH edn_items AS (
  SELECT
    item_code,
    CASE
      WHEN item_code ~ '^IC-[0-9]+$' THEN LPAD(SUBSTRING(item_code FROM 'IC-([0-9]+)'), 3, '0')
      ELSE NULL
    END AS item_key,
    tableau_rang_a,
    tableau_rang_b,
    competences_oic_rang_a,
    competences_oic_rang_b
  FROM public.edn_items_complete
),
expected AS (
  SELECT
    LPAD(item_parent, 3, '0') AS item_key,
    COUNT(*) AS expected_total
  FROM public.backup_oic_competences
  GROUP BY 1
),
unified AS (
  SELECT
    COALESCE(e.item_code, 'IC-' || ex.item_key) AS item_code,
    COALESCE(e.item_key, ex.item_key) AS item_key,
    e.tableau_rang_a,
    e.tableau_rang_b,
    e.competences_oic_rang_a,
    e.competences_oic_rang_b,
    COALESCE(ex.expected_total, 0) AS expected_total
  FROM expected ex
  FULL OUTER JOIN edn_items e ON e.item_key = ex.item_key
)
SELECT
  item_code AS item_id,
  (tableau_rang_a IS NOT NULL) AS has_a,
  (tableau_rang_b IS NOT NULL) AS has_b,
  (
    CASE
      WHEN competences_oic_rang_a IS NULL OR jsonb_typeof(competences_oic_rang_a) <> 'array' THEN 0
      ELSE jsonb_array_length(competences_oic_rang_a)
    END
    +
    CASE
      WHEN competences_oic_rang_b IS NULL OR jsonb_typeof(competences_oic_rang_b) <> 'array' THEN 0
      ELSE jsonb_array_length(competences_oic_rang_b)
    END
  ) AS oic_count,
  expected_total AS oic_expected,
  CASE
    WHEN (tableau_rang_a IS NULL AND tableau_rang_b IS NULL AND
          (
            CASE
              WHEN competences_oic_rang_a IS NULL OR jsonb_typeof(competences_oic_rang_a) <> 'array' THEN 0
              ELSE jsonb_array_length(competences_oic_rang_a)
            END
            +
            CASE
              WHEN competences_oic_rang_b IS NULL OR jsonb_typeof(competences_oic_rang_b) <> 'array' THEN 0
              ELSE jsonb_array_length(competences_oic_rang_b)
            END
          ) = 0) THEN 'missing'
    WHEN (tableau_rang_a IS NOT NULL AND tableau_rang_b IS NOT NULL AND
          (expected_total = 0 OR (
            CASE
              WHEN competences_oic_rang_a IS NULL OR jsonb_typeof(competences_oic_rang_a) <> 'array' THEN 0
              ELSE jsonb_array_length(competences_oic_rang_a)
            END
            +
            CASE
              WHEN competences_oic_rang_b IS NULL OR jsonb_typeof(competences_oic_rang_b) <> 'array' THEN 0
              ELSE jsonb_array_length(competences_oic_rang_b)
            END
          ) >= expected_total)) THEN 'complete'
    ELSE 'partial'
  END AS status
FROM unified
WHERE item_code IS NOT NULL
ORDER BY item_code
WITH NO DATA;

-- Index to accelerate lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_items_completeness_item_id
  ON public.items_completeness (item_id);

COMMENT ON MATERIALIZED VIEW public.items_completeness IS 'Synthèse de la complétude des items EDN (tableaux rang A/B, OIC)';

-- Populate data immediately after creation
REFRESH MATERIALIZED VIEW public.items_completeness;

-- Allow the API roles to read the materialized view
GRANT SELECT ON TABLE public.items_completeness TO anon;
GRANT SELECT ON TABLE public.items_completeness TO authenticated;
GRANT SELECT ON TABLE public.items_completeness TO service_role;

-- Helper to refresh the materialized view on demand
CREATE OR REPLACE FUNCTION public.refresh_items_completeness()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.items_completeness;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_items_completeness() TO anon;
GRANT EXECUTE ON FUNCTION public.refresh_items_completeness() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_items_completeness() TO service_role;

-- RPC endpoint to expose the materialized view in a controlled way
CREATE OR REPLACE FUNCTION public.get_items_completeness(
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 200,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  item_id text,
  has_a boolean,
  has_b boolean,
  oic_count integer,
  oic_expected integer,
  status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT item_id, has_a, has_b, oic_count, oic_expected, status
  FROM public.items_completeness
  WHERE p_status IS NULL OR status = p_status
  ORDER BY item_id
  LIMIT GREATEST(p_limit, 0)
  OFFSET GREATEST(p_offset, 0);
$$;

GRANT EXECUTE ON FUNCTION public.get_items_completeness(text, integer, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_items_completeness(text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_items_completeness(text, integer, integer) TO service_role;

-- Summary helper for dashboards
CREATE OR REPLACE FUNCTION public.get_items_completeness_summary()
RETURNS TABLE(
  total_items integer,
  complete_items integer,
  partial_items integer,
  missing_items integer,
  completion_rate numeric,
  average_oic_ratio numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*) AS total_items,
    COUNT(*) FILTER (WHERE status = 'complete') AS complete_items,
    COUNT(*) FILTER (WHERE status = 'partial') AS partial_items,
    COUNT(*) FILTER (WHERE status = 'missing') AS missing_items,
    CASE
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(COUNT(*) FILTER (WHERE status = 'complete')::numeric * 100 / COUNT(*), 1)
    END AS completion_rate,
    CASE
      WHEN SUM(CASE WHEN oic_expected > 0 THEN 1 ELSE 0 END) = 0 THEN 0
      ELSE ROUND(
        SUM(
          CASE
            WHEN oic_expected > 0 THEN LEAST(oic_count::numeric / NULLIF(oic_expected, 0), 1)
            ELSE 0
          END
        ) * 100 / NULLIF(SUM(CASE WHEN oic_expected > 0 THEN 1 ELSE 0 END), 0),
        1
      )
    END AS average_oic_ratio
  FROM public.items_completeness;
$$;

GRANT EXECUTE ON FUNCTION public.get_items_completeness_summary() TO anon;
GRANT EXECUTE ON FUNCTION public.get_items_completeness_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_items_completeness_summary() TO service_role;

-- Ensure the refresh job runs regularly after imports
DO $$
BEGIN
  PERFORM cron.unschedule('refresh-items-completeness-hourly');
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
$$;

SELECT cron.schedule(
  'refresh-items-completeness-hourly',
  '5 * * * *',
  'SELECT public.refresh_items_completeness()'
);
