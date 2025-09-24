-- MMG-DB-01: Consolidated item + competences view for API consumption

-- Ensure performant lookups when normalising item codes
CREATE INDEX IF NOT EXISTS idx_oic_competences_item_code_rang_order
ON public.oic_competences (
  lpad(nullif(regexp_replace(item_parent, '[^0-9]', '', 'g'), ''), 3, '0'),
  rang,
  coalesce(ordre, 0)
);

DROP VIEW IF EXISTS public.item_with_competences;

CREATE VIEW public.item_with_competences AS
WITH items AS (
  SELECT
    i.id AS item_id,
    i.item_code,
    i.slug,
    i.title,
    lpad(nullif(regexp_replace(i.item_code, '[^0-9]', '', 'g'), ''), 3, '0') AS normalized_code
  FROM public.edn_items_immersive i
),
competences AS (
  SELECT
    base.normalized_code,
    base.rang,
    CASE
      WHEN base.ordre IS NOT NULL AND base.ordre > 0 THEN base.ordre
      ELSE row_number() OVER (
        PARTITION BY base.normalized_code, base.rang
        ORDER BY base.objectif_id
      )
    END AS idx,
    base.label
  FROM (
    SELECT
      lpad(nullif(regexp_replace(c.item_parent, '[^0-9]', '', 'g'), ''), 3, '0') AS normalized_code,
      c.rang,
      c.ordre,
      c.objectif_id,
      coalesce(nullif(btrim(c.intitule), ''), nullif(btrim(c.description), ''), c.objectif_id) AS label
    FROM public.oic_competences c
  ) base
)
SELECT
  it.item_id,
  it.item_code,
  it.slug,
  it.title,
  coalesce(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'rang', comp.rang,
          'idx', comp.idx,
          'label', comp.label
        )
        ORDER BY comp.rang, comp.idx, comp.label
      )
      FROM competences comp
      WHERE comp.normalized_code = it.normalized_code AND comp.label IS NOT NULL
    ),
    '[]'::jsonb
  ) AS competences
FROM items it
ORDER BY it.item_code;

COMMENT ON VIEW public.item_with_competences IS 'EDN item catalogue with aggregated OIC competences (rang A/B).';
