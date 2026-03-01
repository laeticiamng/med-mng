
-- Injection OIC : backup → edn_items_immersive & edn_items_complete

-- 1: immersive rang A
WITH numbered AS (
  SELECT objectif_id, intitule, description, rubrique, item_parent,
         row_number() OVER (PARTITION BY item_parent ORDER BY objectif_id) as rn
  FROM backup_oic_competences
  WHERE rang = 'A' AND intitule IS NOT NULL
),
agg AS (
  SELECT 
    lpad(item_parent, 3, '0') as padded_parent,
    jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', COALESCE(description, intitule),
        'rubrique', COALESCE(rubrique, 'Non classée'),
        'ordre', rn
      ) ORDER BY objectif_id
    ) as competences
  FROM numbered
  GROUP BY item_parent
)
UPDATE edn_items_immersive e
SET competences_oic_rang_a = agg.competences
FROM agg
WHERE lpad(replace(e.item_code, 'IC-', ''), 3, '0') = agg.padded_parent
  AND (e.competences_oic_rang_a IS NULL OR e.competences_oic_rang_a::text = '[]');

-- 2: immersive rang B
WITH numbered AS (
  SELECT objectif_id, intitule, description, rubrique, item_parent,
         row_number() OVER (PARTITION BY item_parent ORDER BY objectif_id) as rn
  FROM backup_oic_competences
  WHERE rang = 'B' AND intitule IS NOT NULL
),
agg AS (
  SELECT 
    lpad(item_parent, 3, '0') as padded_parent,
    jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', COALESCE(description, intitule),
        'rubrique', COALESCE(rubrique, 'Non classée'),
        'ordre', rn
      ) ORDER BY objectif_id
    ) as competences
  FROM numbered
  GROUP BY item_parent
)
UPDATE edn_items_immersive e
SET competences_oic_rang_b = agg.competences
FROM agg
WHERE lpad(replace(e.item_code, 'IC-', ''), 3, '0') = agg.padded_parent
  AND (e.competences_oic_rang_b IS NULL OR e.competences_oic_rang_b::text = '[]');

-- 3: compteurs immersive
UPDATE edn_items_immersive SET
  competences_count_rang_a = jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'::jsonb)),
  competences_count_rang_b = jsonb_array_length(COALESCE(competences_oic_rang_b, '[]'::jsonb)),
  competences_count_total = jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'::jsonb))
                          + jsonb_array_length(COALESCE(competences_oic_rang_b, '[]'::jsonb));

-- 4: complete rang A
WITH numbered AS (
  SELECT objectif_id, intitule, description, rubrique, item_parent,
         row_number() OVER (PARTITION BY item_parent ORDER BY objectif_id) as rn
  FROM backup_oic_competences
  WHERE rang = 'A' AND intitule IS NOT NULL
),
agg AS (
  SELECT 
    lpad(item_parent, 3, '0') as padded_parent,
    jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', COALESCE(description, intitule),
        'rubrique', COALESCE(rubrique, 'Non classée'),
        'ordre', rn
      ) ORDER BY objectif_id
    ) as competences
  FROM numbered
  GROUP BY item_parent
)
UPDATE edn_items_complete e
SET competences_oic_rang_a = agg.competences
FROM agg
WHERE lpad(replace(e.item_code, 'IC-', ''), 3, '0') = agg.padded_parent
  AND (e.competences_oic_rang_a IS NULL OR e.competences_oic_rang_a::text = '[]');

-- 5: complete rang B
WITH numbered AS (
  SELECT objectif_id, intitule, description, rubrique, item_parent,
         row_number() OVER (PARTITION BY item_parent ORDER BY objectif_id) as rn
  FROM backup_oic_competences
  WHERE rang = 'B' AND intitule IS NOT NULL
),
agg AS (
  SELECT 
    lpad(item_parent, 3, '0') as padded_parent,
    jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', COALESCE(description, intitule),
        'rubrique', COALESCE(rubrique, 'Non classée'),
        'ordre', rn
      ) ORDER BY objectif_id
    ) as competences
  FROM numbered
  GROUP BY item_parent
)
UPDATE edn_items_complete e
SET competences_oic_rang_b = agg.competences
FROM agg
WHERE lpad(replace(e.item_code, 'IC-', ''), 3, '0') = agg.padded_parent
  AND (e.competences_oic_rang_b IS NULL OR e.competences_oic_rang_b::text = '[]');

-- 6: compteurs complete
UPDATE edn_items_complete SET
  competences_count_rang_a = jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'::jsonb)),
  competences_count_rang_b = jsonb_array_length(COALESCE(competences_oic_rang_b, '[]'::jsonb)),
  competences_count_total = jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'::jsonb))
                          + jsonb_array_length(COALESCE(competences_oic_rang_b, '[]'::jsonb));
