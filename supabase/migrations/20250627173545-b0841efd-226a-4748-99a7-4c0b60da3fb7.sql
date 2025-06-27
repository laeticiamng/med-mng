
-- Vérification complète de tous les items pour détecter les erreurs de contenu
SELECT 
  item_code,
  title,
  -- Vérifier dans le tableau Rang A
  tableau_rang_a->>'theme' as theme_a,
  -- Rechercher "coloc singulier" dans le tableau A
  CASE 
    WHEN tableau_rang_a::text ILIKE '%coloc singulier%' THEN 'ERREUR: coloc singulier trouvé dans Rang A'
    ELSE 'OK'
  END as check_coloc_a,
  -- Rechercher "personne de confiance" dans le tableau A
  CASE 
    WHEN tableau_rang_a::text ILIKE '%personne de confiance%' THEN 'ERREUR: personne de confiance trouvé dans Rang A'
    ELSE 'OK'
  END as check_personne_a,
  
  -- Vérifier dans le tableau Rang B
  tableau_rang_b->>'theme' as theme_b,
  -- Rechercher "coloc singulier" dans le tableau B
  CASE 
    WHEN tableau_rang_b::text ILIKE '%coloc singulier%' THEN 'ERREUR: coloc singulier trouvé dans Rang B'
    ELSE 'OK'
  END as check_coloc_b,
  -- Rechercher "personne de confiance" dans le tableau B
  CASE 
    WHEN tableau_rang_b::text ILIKE '%personne de confiance%' THEN 'ERREUR: personne de confiance trouvé dans Rang B'
    ELSE 'OK'
  END as check_personne_b
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code;

-- Recherche détaillée des occurrences problématiques
SELECT 
  item_code,
  title,
  'Tableau Rang A' as source,
  tableau_rang_a::text as contenu
FROM edn_items_immersive 
WHERE (tableau_rang_a::text ILIKE '%coloc singulier%' OR tableau_rang_a::text ILIKE '%personne de confiance%')
  AND item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')

UNION ALL

SELECT 
  item_code,
  title,
  'Tableau Rang B' as source,
  tableau_rang_b::text as contenu
FROM edn_items_immersive 
WHERE (tableau_rang_b::text ILIKE '%coloc singulier%' OR tableau_rang_b::text ILIKE '%personne de confiance%')
  AND item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code, source;
