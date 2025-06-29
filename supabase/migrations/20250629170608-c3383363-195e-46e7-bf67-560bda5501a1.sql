
-- Vérifier l'état complet des items IC-1 à IC-5 dans edn_items_immersive
SELECT 
  item_code,
  slug,
  title,
  subtitle,
  CASE WHEN pitch_intro IS NOT NULL THEN '✓' ELSE '✗' END as pitch_intro_status,
  CASE WHEN tableau_rang_a IS NOT NULL THEN '✓' ELSE '✗' END as tableau_rang_a_status,
  CASE WHEN tableau_rang_b IS NOT NULL THEN '✓' ELSE '✗' END as tableau_rang_b_status,
  CASE WHEN paroles_musicales IS NOT NULL AND array_length(paroles_musicales, 1) >= 2 THEN '✓ (' || array_length(paroles_musicales, 1) || ')' ELSE '✗' END as paroles_musicales_status,
  CASE WHEN scene_immersive IS NOT NULL THEN '✓' ELSE '✗' END as scene_immersive_status,
  CASE WHEN interaction_config IS NOT NULL THEN '✓' ELSE '✗' END as interaction_config_status,
  CASE WHEN quiz_questions IS NOT NULL THEN '✓' ELSE '✗' END as quiz_questions_status,
  CASE WHEN reward_messages IS NOT NULL THEN '✓' ELSE '✗' END as reward_messages_status
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code;

-- Vérifier le contenu détaillé des paroles musicales
SELECT 
  item_code,
  title,
  paroles_musicales,
  array_length(paroles_musicales, 1) as nb_paroles
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code;

-- Vérifier la structure des tableaux rang A et B
SELECT 
  item_code,
  title,
  tableau_rang_a->'theme' as theme_rang_a,
  tableau_rang_b->'theme' as theme_rang_b,
  jsonb_array_length(COALESCE(tableau_rang_a->'sections', '[]'::jsonb)) as sections_rang_a_count,
  jsonb_array_length(COALESCE(tableau_rang_b->'sections', '[]'::jsonb)) as sections_rang_b_count
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code;
