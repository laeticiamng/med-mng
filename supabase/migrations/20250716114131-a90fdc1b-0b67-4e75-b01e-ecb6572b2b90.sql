-- Migration corrigée pour mapper correctement les compétences OIC aux items EDN

CREATE OR REPLACE FUNCTION public.fix_competences_mapping_correct()
RETURNS TABLE(updated_items integer, total_competences_added integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  item_record RECORD;
  comp_record RECORD;
  updated INTEGER := 0;
  total_comp INTEGER := 0;
  item_num TEXT;
  rang_a_competences JSONB := '[]'::jsonb;
  rang_b_competences JSONB := '[]'::jsonb;
  result_details JSONB := '[]'::jsonb;
BEGIN
  -- Parcourir tous les items EDN immersifs
  FOR item_record IN 
    SELECT id, item_code, title 
    FROM edn_items_immersive 
    ORDER BY item_code
  LOOP
    -- Extraire le numéro d'item (IC-11 -> 011)
    item_num := LPAD(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::integer::text, 3, '0');
    
    -- Réinitialiser les arrays pour chaque item
    rang_a_competences := '[]'::jsonb;
    rang_b_competences := '[]'::jsonb;
    
    -- Collecter les compétences Rang A
    FOR comp_record IN 
      SELECT objectif_id, intitule, description
      FROM oic_competences 
      WHERE item_parent = item_num AND rang = 'A'
      ORDER BY objectif_id
    LOOP
      rang_a_competences := rang_a_competences || jsonb_build_array(
        jsonb_build_object(
          'competence_id', comp_record.objectif_id,
          'concept', COALESCE(comp_record.intitule, 'Concept ' || comp_record.objectif_id),
          'definition', COALESCE(comp_record.description, 'Définition à compléter pour ' || comp_record.objectif_id),
          'exemple', 'Exemple clinique pour ' || comp_record.objectif_id || ' - ' || COALESCE(SUBSTRING(comp_record.description FROM 1 FOR 100), 'À développer'),
          'piege', 'Piège classique à éviter pour ' || comp_record.objectif_id,
          'mnemo', 'Moyen mnémotechnique pour ' || comp_record.objectif_id,
          'subtilite', 'Subtilité importante pour ' || comp_record.objectif_id,
          'application', 'Application pratique de ' || comp_record.objectif_id || ' en situation clinique',
          'vigilance', 'Point de vigilance pour ' || comp_record.objectif_id,
          'paroles_chantables', ARRAY[
            COALESCE(comp_record.intitule, 'Concept') || ' essentiel à maîtriser',
            'Compétence ' || comp_record.objectif_id || ' fondamentale'
          ]
        )
      );
    END LOOP;
    
    -- Collecter les compétences Rang B
    FOR comp_record IN 
      SELECT objectif_id, intitule, description
      FROM oic_competences 
      WHERE item_parent = item_num AND rang = 'B'
      ORDER BY objectif_id
    LOOP
      rang_b_competences := rang_b_competences || jsonb_build_array(
        jsonb_build_object(
          'competence_id', comp_record.objectif_id,
          'concept', COALESCE(comp_record.intitule, 'Concept avancé ' || comp_record.objectif_id),
          'analyse', COALESCE(comp_record.description, 'Analyse experte pour ' || comp_record.objectif_id),
          'cas', 'Cas clinique complexe pour ' || comp_record.objectif_id,
          'ecueil', 'Écueil d''expert à éviter pour ' || comp_record.objectif_id,
          'technique', 'Technique spécialisée pour ' || comp_record.objectif_id,
          'maitrise', 'Niveau de maîtrise requis pour ' || comp_record.objectif_id,
          'excellence', 'Critère d''excellence pour ' || comp_record.objectif_id,
          'paroles_chantables', ARRAY[
            COALESCE(comp_record.intitule, 'Expertise') || ' niveau avancé',
            'Maîtrise experte de ' || comp_record.objectif_id
          ]
        )
      );
    END LOOP;
    
    -- Si pas de compétences OIC, créer du contenu générique
    IF jsonb_array_length(rang_a_competences) = 0 THEN
      rang_a_competences := jsonb_build_array(
        jsonb_build_object(
          'competence_id', item_record.item_code || '-A01',
          'concept', 'Concept fondamental ' || item_record.item_code,
          'definition', 'Définition de base pour ' || item_record.title,
          'exemple', 'Exemple clinique pour ' || item_record.title,
          'piege', 'Piège classique pour ' || item_record.item_code,
          'mnemo', 'Moyen mnémotechnique ' || item_record.item_code,
          'subtilite', 'Subtilité de ' || item_record.item_code,
          'application', 'Application pratique de ' || item_record.title,
          'vigilance', 'Vigilance pour ' || item_record.item_code,
          'paroles_chantables', ARRAY[
            item_record.title || ' fondamental',
            'Base de ' || item_record.item_code || ' à maîtriser'
          ]
        )
      );
    END IF;
    
    IF jsonb_array_length(rang_b_competences) = 0 THEN
      rang_b_competences := jsonb_build_array(
        jsonb_build_object(
          'competence_id', item_record.item_code || '-B01',
          'concept', 'Expertise avancée ' || item_record.item_code,
          'analyse', 'Analyse experte pour ' || item_record.title,
          'cas', 'Cas complexe ' || item_record.item_code,
          'ecueil', 'Écueil expert ' || item_record.item_code,
          'technique', 'Technique avancée ' || item_record.item_code,
          'maitrise', 'Maîtrise de ' || item_record.title,
          'excellence', 'Excellence ' || item_record.item_code,
          'paroles_chantables', ARRAY[
            item_record.title || ' expertise',
            'Niveau expert ' || item_record.item_code
          ]
        )
      );
    END IF;
    
    -- Mettre à jour l'item avec les compétences correctes
    UPDATE edn_items_immersive 
    SET 
      tableau_rang_a = jsonb_build_object(
        'title', item_record.item_code || ' Rang A - ' || item_record.title,
        'subtitle', 'Compétences fondamentales (' || jsonb_array_length(rang_a_competences) || ' compétences)',
        'sections', jsonb_build_array(
          jsonb_build_object(
            'title', 'Compétences ' || item_record.item_code || ' Rang A',
            'concepts', rang_a_competences
          )
        )
      ),
      tableau_rang_b = jsonb_build_object(
        'title', item_record.item_code || ' Rang B - ' || item_record.title,
        'subtitle', 'Compétences approfondies (' || jsonb_array_length(rang_b_competences) || ' compétences)',
        'sections', jsonb_build_array(
          jsonb_build_object(
            'title', 'Compétences ' || item_record.item_code || ' Rang B',
            'concepts', rang_b_competences
          )
        )
      ),
      paroles_musicales = ARRAY[
        item_record.title || ' - Compétences ' || item_record.item_code,
        'Rang A fondamental, Rang B expertise avancée',
        'Maîtrise complète de ' || item_record.item_code || ' pour l''EDN'
      ],
      updated_at = now()
    WHERE id = item_record.id;
    
    updated := updated + 1;
    total_comp := total_comp + jsonb_array_length(rang_a_competences) + jsonb_array_length(rang_b_competences);
    
    result_details := result_details || jsonb_build_object(
      'item_code', item_record.item_code,
      'item_num_mapping', item_num,
      'rang_a_count', jsonb_array_length(rang_a_competences),
      'rang_b_count', jsonb_array_length(rang_b_competences),
      'title', item_record.title
    );
  END LOOP;
  
  RETURN QUERY SELECT updated, total_comp, result_details;
END;
$function$;

-- Exécuter la correction
SELECT * FROM fix_competences_mapping_correct();