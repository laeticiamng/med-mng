-- Synchroniser les données OIC de edn_items_immersive vers edn_items_complete
UPDATE edn_items_complete AS complete
SET 
  tableau_rang_a = immersive.tableau_rang_a,
  tableau_rang_b = immersive.tableau_rang_b,
  competences_oic_rang_a = immersive.competences_oic_rang_a,
  competences_oic_rang_b = immersive.competences_oic_rang_b,
  competences_count_rang_a = immersive.competences_count_rang_a,
  competences_count_rang_b = immersive.competences_count_rang_b,
  competences_count_total = immersive.competences_count_total,
  updated_at = NOW()
FROM edn_items_immersive AS immersive
WHERE complete.item_code = immersive.item_code
  AND (
    complete.tableau_rang_a IS DISTINCT FROM immersive.tableau_rang_a
    OR complete.tableau_rang_b IS DISTINCT FROM immersive.tableau_rang_b
    OR complete.competences_count_rang_a != immersive.competences_count_rang_a
    OR complete.competences_count_rang_b != immersive.competences_count_rang_b
  );

-- Recalculer le score de complétude pour tous les items
UPDATE edn_items_complete
SET completeness_score = CASE
  WHEN competences_count_rang_a > 0 AND competences_count_rang_b > 0 THEN 100
  WHEN competences_count_rang_a > 0 OR competences_count_rang_b > 0 THEN 95
  ELSE 90
END
WHERE completeness_score < 100;