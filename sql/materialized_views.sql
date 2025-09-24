-- Materialized views definition snapshots

-- Items completeness view for EDN items
DROP MATERIALIZED VIEW IF EXISTS public.items_completeness;

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

CREATE UNIQUE INDEX IF NOT EXISTS idx_items_completeness_item_id
  ON public.items_completeness (item_id);
