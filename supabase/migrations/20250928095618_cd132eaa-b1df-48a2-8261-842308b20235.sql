-- Mise à jour des compteurs de compétences pour tous les items
UPDATE edn_items_immersive 
SET 
  competences_count_rang_a = competence_stats.rang_a_count,
  competences_count_rang_b = competence_stats.rang_b_count,
  competences_count_total = competence_stats.total_count,
  updated_at = NOW()
FROM (
  SELECT 
    e.id,
    COUNT(CASE WHEN o.rang = 'A' THEN 1 END) as rang_a_count,
    COUNT(CASE WHEN o.rang = 'B' THEN 1 END) as rang_b_count,
    COUNT(o.objectif_id) as total_count
  FROM edn_items_immersive e
  LEFT JOIN oic_competences o ON o.item_parent = LPAD(REPLACE(e.item_code, 'IC-', ''), 3, '0')
  WHERE e.item_code IS NOT NULL
  GROUP BY e.id
) as competence_stats
WHERE edn_items_immersive.id = competence_stats.id;

-- Vérifier les résultats avec des exemples
SELECT 
  'Mise à jour terminée - Exemples de résultats:' as status,
  COUNT(*) as items_traités
FROM edn_items_immersive 
WHERE competences_count_total > 0;