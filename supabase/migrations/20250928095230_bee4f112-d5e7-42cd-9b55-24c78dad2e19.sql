-- Fonction pour mettre à jour les compteurs de compétences dans edn_items_immersive
CREATE OR REPLACE FUNCTION update_competences_counters()
RETURNS TABLE (
  item_code TEXT,
  rang_a_count INTEGER,
  rang_b_count INTEGER,
  total_count INTEGER,
  updated BOOLEAN
) AS $$
BEGIN
  -- Mise à jour des compteurs de compétences pour chaque item
  UPDATE edn_items_immersive 
  SET 
    competences_count_rang_a = subquery.rang_a_count,
    competences_count_rang_b = subquery.rang_b_count,
    competences_count_total = subquery.total_count,
    updated_at = NOW()
  FROM (
    SELECT 
      e.id,
      e.item_code,
      COUNT(CASE WHEN o.rang = 'A' THEN 1 END) as rang_a_count,
      COUNT(CASE WHEN o.rang = 'B' THEN 1 END) as rang_b_count,
      COUNT(o.objectif_id) as total_count
    FROM edn_items_immersive e
    LEFT JOIN oic_competences o ON o.item_parent = LPAD(REPLACE(e.item_code, 'IC-', ''), 3, '0')
    WHERE e.item_code IS NOT NULL
    GROUP BY e.id, e.item_code
  ) subquery
  WHERE edn_items_immersive.id = subquery.id;

  -- Retourner les résultats de la mise à jour
  RETURN QUERY
  SELECT 
    e.item_code,
    e.competences_count_rang_a::INTEGER,
    e.competences_count_rang_b::INTEGER,
    e.competences_count_total::INTEGER,
    TRUE as updated
  FROM edn_items_immersive e
  WHERE e.item_code IS NOT NULL
  ORDER BY e.item_code;
END;
$$ LANGUAGE plpgsql;