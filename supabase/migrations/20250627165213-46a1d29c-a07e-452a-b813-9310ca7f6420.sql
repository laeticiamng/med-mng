
-- Audit complet des tableaux Rang A et Rang B pour les items IC-1 à IC-5 (corrigé)
SELECT 
  item_code,
  title,
  -- Extraire le thème du tableau Rang A
  CASE 
    WHEN tableau_rang_a IS NOT NULL THEN tableau_rang_a->>'theme'
    ELSE 'ABSENT'
  END as theme_rang_a,
  -- Extraire le thème du tableau Rang B  
  CASE 
    WHEN tableau_rang_b IS NOT NULL THEN tableau_rang_b->>'theme'
    ELSE 'ABSENT'
  END as theme_rang_b,
  -- Compter les lignes du tableau Rang A
  CASE 
    WHEN tableau_rang_a IS NOT NULL AND tableau_rang_a->'lignes' IS NOT NULL THEN 
      jsonb_array_length(tableau_rang_a->'lignes')
    ELSE 0
  END as nb_lignes_rang_a,
  -- Compter les lignes du tableau Rang B
  CASE 
    WHEN tableau_rang_b IS NOT NULL AND tableau_rang_b->'lignes' IS NOT NULL THEN 
      jsonb_array_length(tableau_rang_b->'lignes')
    ELSE 0
  END as nb_lignes_rang_b,
  -- Vérifier les premiers concepts (sans erreur JSON)
  CASE 
    WHEN tableau_rang_a IS NOT NULL AND tableau_rang_a->'lignes' IS NOT NULL THEN 
      tableau_rang_a->'lignes'->0->>0
    ELSE 'ABSENT'
  END as premier_concept_rang_a
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code;

-- Vérification détaillée des contenus IC-4 et IC-5
SELECT 
  item_code,
  title,
  -- Premier concept de chaque item
  CASE 
    WHEN tableau_rang_a IS NOT NULL AND tableau_rang_a->'lignes' IS NOT NULL THEN 
      tableau_rang_a->'lignes'->0->>0
    ELSE 'ABSENT'
  END as concept_1,
  -- Deuxième concept
  CASE 
    WHEN tableau_rang_a IS NOT NULL AND tableau_rang_a->'lignes' IS NOT NULL AND jsonb_array_length(tableau_rang_a->'lignes') > 1 THEN 
      tableau_rang_a->'lignes'->1->>0
    ELSE 'ABSENT'
  END as concept_2,
  -- Troisième concept
  CASE 
    WHEN tableau_rang_a IS NOT NULL AND tableau_rang_a->'lignes' IS NOT NULL AND jsonb_array_length(tableau_rang_a->'lignes') > 2 THEN 
      tableau_rang_a->'lignes'->2->>0
    ELSE 'ABSENT'
  END as concept_3
FROM edn_items_immersive 
WHERE item_code IN ('IC-4', 'IC-5')
ORDER BY item_code;
