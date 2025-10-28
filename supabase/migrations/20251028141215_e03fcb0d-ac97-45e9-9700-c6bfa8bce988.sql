-- Mise à jour des compteurs de compétences OIC pour tous les items
-- Calculer et insérer les compteurs manquants

UPDATE edn_items_immersive ei
SET 
  competences_count_rang_a = COALESCE(
    (SELECT COUNT(*) 
     FROM backup_oic_competences oic 
     WHERE oic.item_parent = LPAD(REGEXP_REPLACE(ei.item_code, 'IC-', ''), 3, '0')
     AND oic.rang = 'A'
    ), 0
  ),
  competences_count_rang_b = COALESCE(
    (SELECT COUNT(*) 
     FROM backup_oic_competences oic 
     WHERE oic.item_parent = LPAD(REGEXP_REPLACE(ei.item_code, 'IC-', ''), 3, '0')
     AND oic.rang = 'B'
    ), 0
  ),
  competences_count_total = COALESCE(
    (SELECT COUNT(*) 
     FROM backup_oic_competences oic 
     WHERE oic.item_parent = LPAD(REGEXP_REPLACE(ei.item_code, 'IC-', ''), 3, '0')
    ), 0
  )
WHERE 
  ei.competences_count_rang_a IS NULL 
  OR ei.competences_count_rang_b IS NULL 
  OR ei.competences_count_total IS NULL
  OR ei.competences_count_rang_a = 0
  OR ei.competences_count_rang_b = 0;