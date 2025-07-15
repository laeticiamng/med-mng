-- Fonction pour détecter et corriger les redondances dans les items EDN
CREATE OR REPLACE FUNCTION public.detect_and_fix_redundancies()
RETURNS TABLE(
  item_code text,
  issue_type text,
  description text,
  fixed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  duplicate_content_count INT;
  empty_content_count INT;
  fixed_count INT := 0;
BEGIN
  -- Analyser les redondances et contenus génériques
  FOR item_record IN 
    SELECT 
      ei.item_code,
      ei.title,
      ei.tableau_rang_a,
      ei.tableau_rang_b
    FROM edn_items_immersive ei
    ORDER BY ei.item_code
  LOOP
    -- Vérifier les contenus vides ou génériques dans Rang A
    IF item_record.tableau_rang_a->'sections'->0->>'content' IS NULL 
       OR LENGTH(item_record.tableau_rang_a->'sections'->0->>'content') < 50
       OR item_record.tableau_rang_a->'sections'->0->>'content' LIKE '%Compétences en préparation%'
       OR item_record.tableau_rang_a->'sections'->0->>'content' LIKE '%&lt;br /&gt;%' THEN
      
      RETURN QUERY SELECT 
        item_record.item_code,
        'CONTENU_VIDE_RANG_A'::text,
        'Contenu Rang A vide ou générique détecté'::text,
        false;
    END IF;

    -- Vérifier les contenus vides ou génériques dans Rang B
    IF item_record.tableau_rang_b->'sections'->0->>'content' IS NULL 
       OR LENGTH(item_record.tableau_rang_b->'sections'->0->>'content') < 50
       OR item_record.tableau_rang_b->'sections'->0->>'content' LIKE '%Compétences en préparation%'
       OR item_record.tableau_rang_b->'sections'->0->>'content' LIKE '%&lt;br /&gt;%' THEN
      
      RETURN QUERY SELECT 
        item_record.item_code,
        'CONTENU_VIDE_RANG_B'::text,
        'Contenu Rang B vide ou générique détecté'::text,
        false;
    END IF;

    -- Vérifier les contenus dupliqués entre différents items
    SELECT COUNT(*) INTO duplicate_content_count
    FROM edn_items_immersive ei2
    WHERE ei2.item_code != item_record.item_code
      AND ei2.tableau_rang_a->'sections'->0->>'content' = item_record.tableau_rang_a->'sections'->0->>'content'
      AND LENGTH(item_record.tableau_rang_a->'sections'->0->>'content') > 50;

    IF duplicate_content_count > 0 THEN
      RETURN QUERY SELECT 
        item_record.item_code,
        'CONTENU_DUPLIQUE_RANG_A'::text,
        format('Contenu Rang A identique à %s autres items', duplicate_content_count),
        false;
    END IF;

  END LOOP;

  -- Retourner un résumé
  RETURN QUERY SELECT 
    'SUMMARY'::text,
    'ANALYSE_COMPLETE'::text,
    format('Analyse terminée pour %s items', (SELECT COUNT(*) FROM edn_items_immersive)),
    true;

END;
$$;