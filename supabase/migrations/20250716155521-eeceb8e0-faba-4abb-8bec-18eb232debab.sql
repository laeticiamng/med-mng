CREATE OR REPLACE FUNCTION public.audit_tableau_duplicates()
RETURNS TABLE(
  audit_type text,
  item_code_result text,
  issue_description text,
  duplicate_content text,
  severity text,
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  total_issues INTEGER := 0;
BEGIN
  -- Vérifier les doublons dans tableau_rang_a
  FOR item_record IN 
    SELECT ei1.item_code, ei1.tableau_rang_a, 
           array_agg(ei2.item_code) as duplicate_items
    FROM edn_items_immersive ei1
    JOIN edn_items_immersive ei2 ON ei1.tableau_rang_a::text = ei2.tableau_rang_a::text 
      AND ei1.item_code != ei2.item_code
    WHERE ei1.tableau_rang_a IS NOT NULL
    GROUP BY ei1.item_code, ei1.tableau_rang_a
    HAVING count(*) > 1
  LOOP
    total_issues := total_issues + 1;
    RETURN QUERY SELECT 
      'DUPLICATE_RANG_A'::text,
      item_record.item_code,
      'Contenu identique dans tableau Rang A avec items: ' || array_to_string(item_record.duplicate_items, ', '),
      SUBSTRING(item_record.tableau_rang_a::text FROM 1 FOR 100) || '...',
      'CRITICAL'::text,
      'Générer du contenu unique spécifique à cet item'::text;
  END LOOP;

  -- Vérifier les doublons dans tableau_rang_b
  FOR item_record IN 
    SELECT ei1.item_code, ei1.tableau_rang_b,
           array_agg(ei2.item_code) as duplicate_items
    FROM edn_items_immersive ei1
    JOIN edn_items_immersive ei2 ON ei1.tableau_rang_b::text = ei2.tableau_rang_b::text 
      AND ei1.item_code != ei2.item_code
    WHERE ei1.tableau_rang_b IS NOT NULL
    GROUP BY ei1.item_code, ei1.tableau_rang_b
    HAVING count(*) > 1
  LOOP
    total_issues := total_issues + 1;
    RETURN QUERY SELECT 
      'DUPLICATE_RANG_B'::text,
      item_record.item_code,
      'Contenu identique dans tableau Rang B avec items: ' || array_to_string(item_record.duplicate_items, ', '),
      SUBSTRING(item_record.tableau_rang_b::text FROM 1 FOR 100) || '...',
      'CRITICAL'::text,
      'Générer du contenu unique spécifique à cet item'::text;
  END LOOP;

  -- Vérifier les doublons dans paroles_musicales
  FOR item_record IN 
    SELECT ei1.item_code, ei1.paroles_musicales,
           array_agg(ei2.item_code) as duplicate_items
    FROM edn_items_immersive ei1
    JOIN edn_items_immersive ei2 ON ei1.paroles_musicales::text = ei2.paroles_musicales::text 
      AND ei1.item_code != ei2.item_code
    WHERE ei1.paroles_musicales IS NOT NULL
    GROUP BY ei1.item_code, ei1.paroles_musicales
    HAVING count(*) > 1
  LOOP
    total_issues := total_issues + 1;
    RETURN QUERY SELECT 
      'DUPLICATE_PAROLES'::text,
      item_record.item_code,
      'Paroles musicales identiques avec items: ' || array_to_string(item_record.duplicate_items, ', '),
      array_to_string(item_record.paroles_musicales, ' | '),
      'HIGH'::text,
      'Créer des paroles musicales uniques pour cet item'::text;
  END LOOP;

  -- Vérifier les contenus génériques dans les sections
  FOR item_record IN 
    SELECT ei.item_code, ei.tableau_rang_a
    FROM edn_items_immersive ei
    WHERE ei.tableau_rang_a::text LIKE '%Connaissances de base%'
       OR ei.tableau_rang_a::text LIKE '%Concept fondamental%'
       OR ei.tableau_rang_a::text LIKE '%Item médical%'
  LOOP
    total_issues := total_issues + 1;
    RETURN QUERY SELECT 
      'GENERIC_CONTENT'::text,
      item_record.item_code,
      'Contenu générique détecté dans tableau Rang A',
      'Contenu trop générique sans spécificité médicale',
      'MEDIUM'::text,
      'Remplacer par du contenu médical spécialisé'::text;
  END LOOP;

  -- Vérifier les quiz identiques
  FOR item_record IN 
    SELECT ei1.item_code, ei1.quiz_questions,
           array_agg(ei2.item_code) as duplicate_items
    FROM edn_items_immersive ei1
    JOIN edn_items_immersive ei2 ON ei1.quiz_questions::text = ei2.quiz_questions::text 
      AND ei1.item_code != ei2.item_code
    WHERE ei1.quiz_questions IS NOT NULL
    GROUP BY ei1.item_code, ei1.quiz_questions
    HAVING count(*) > 1
  LOOP
    total_issues := total_issues + 1;
    RETURN QUERY SELECT 
      'DUPLICATE_QUIZ'::text,
      item_record.item_code,
      'Quiz identiques avec items: ' || array_to_string(item_record.duplicate_items, ', '),
      'Questions et réponses identiques',
      'HIGH'::text,
      'Créer des questions spécifiques à cet item'::text;
  END LOOP;

  -- Si aucun problème trouvé
  IF total_issues = 0 THEN
    RETURN QUERY SELECT 
      'NO_ISSUES'::text,
      'GLOBAL'::text,
      'Aucun doublon détecté dans les tableaux'::text,
      'Tous les contenus sont uniques'::text,
      'INFO'::text,
      'Plateforme opérationnelle'::text;
  END IF;

END;
$$;