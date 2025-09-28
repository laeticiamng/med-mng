-- Fonction de vérification des compétences (lecture seule) 
CREATE OR REPLACE FUNCTION public.verify_competences_completeness()
RETURNS TABLE (
  item_code TEXT,
  title TEXT,
  stored_rang_a INTEGER,
  stored_rang_b INTEGER,
  stored_total INTEGER,
  actual_rang_a BIGINT,
  actual_rang_b BIGINT,
  actual_total BIGINT,
  status TEXT,
  has_missing_rang_a BOOLEAN,
  has_missing_rang_b BOOLEAN,
  needs_update BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.item_code,
    e.title,
    e.competences_count_rang_a as stored_rang_a,
    e.competences_count_rang_b as stored_rang_b,
    e.competences_count_total as stored_total,
    COUNT(CASE WHEN o.rang = 'A' THEN 1 END) as actual_rang_a,
    COUNT(CASE WHEN o.rang = 'B' THEN 1 END) as actual_rang_b,
    COUNT(o.objectif_id) as actual_total,
    CASE 
      WHEN COUNT(o.objectif_id) = 0 THEN '❌ AUCUNE_COMPETENCE'
      WHEN COUNT(CASE WHEN o.rang = 'A' THEN 1 END) = 0 THEN '⚠️ MANQUE_RANG_A'
      WHEN COUNT(CASE WHEN o.rang = 'B' THEN 1 END) = 0 THEN '⚠️ MANQUE_RANG_B'
      WHEN (e.competences_count_rang_a != COUNT(CASE WHEN o.rang = 'A' THEN 1 END) OR
            e.competences_count_rang_b != COUNT(CASE WHEN o.rang = 'B' THEN 1 END)) THEN '🔄 DONNEES_OBSOLETES'
      ELSE '✅ COMPLET'
    END as status,
    COUNT(CASE WHEN o.rang = 'A' THEN 1 END) = 0 as has_missing_rang_a,
    COUNT(CASE WHEN o.rang = 'B' THEN 1 END) = 0 as has_missing_rang_b,
    (e.competences_count_rang_a != COUNT(CASE WHEN o.rang = 'A' THEN 1 END) OR
     e.competences_count_rang_b != COUNT(CASE WHEN o.rang = 'B' THEN 1 END)) as needs_update
  FROM edn_items_immersive e
  LEFT JOIN oic_competences o ON o.item_parent = LPAD(REPLACE(e.item_code, 'IC-', ''), 3, '0')
  WHERE e.item_code IS NOT NULL
  GROUP BY e.item_code, e.title, e.competences_count_rang_a, e.competences_count_rang_b, e.competences_count_total
  ORDER BY e.item_code;
END;
$$;