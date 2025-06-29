
-- Vérifier le contenu détaillé des paroles musicales pour tous les items
SELECT 
  item_code,
  title,
  paroles_musicales,
  array_length(paroles_musicales, 1) as nb_paroles
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code;

-- Vérifier aussi si les paroles sont bien formatées
SELECT 
  item_code,
  CASE 
    WHEN paroles_musicales IS NULL THEN 'NULL'
    WHEN array_length(paroles_musicales, 1) IS NULL THEN 'ARRAY_EMPTY'
    WHEN array_length(paroles_musicales, 1) = 0 THEN 'ARRAY_LENGTH_0'
    ELSE 'HAS_DATA'
  END as status,
  array_length(paroles_musicales, 1) as length
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code;
