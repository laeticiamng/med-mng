
-- Vérifier le contenu des 4 premiers items EDN immersifs
SELECT 
  item_code,
  title,
  CASE 
    WHEN tableau_rang_a IS NOT NULL THEN 'Présent'
    ELSE 'Absent'
  END as tableau_rang_a_status,
  CASE 
    WHEN tableau_rang_b IS NOT NULL THEN 'Présent'
    ELSE 'Absent'
  END as tableau_rang_b_status,
  CASE 
    WHEN scene_immersive IS NOT NULL THEN 'Présent'
    ELSE 'Absent'
  END as scene_immersive_status,
  CASE 
    WHEN quiz_questions IS NOT NULL THEN 'Présent'
    ELSE 'Absent'
  END as quiz_status
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4')
ORDER BY item_code;

-- Vérifier le détail du contenu des tableaux Rang A et B pour chaque item
SELECT 
  item_code,
  title,
  jsonb_pretty(tableau_rang_a) as tableau_rang_a_content,
  jsonb_pretty(tableau_rang_b) as tableau_rang_b_content
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4')
ORDER BY item_code;
