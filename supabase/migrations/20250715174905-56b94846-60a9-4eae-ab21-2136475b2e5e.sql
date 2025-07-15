-- Fonction pour corriger automatiquement les items EDN avec les données UNESS
CREATE OR REPLACE FUNCTION public.fix_all_edn_items_complete_oic_correction()
RETURNS TABLE(fixed_count integer, errors_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  item_number INTEGER;
  rang_a_data JSONB := '[]'::jsonb;
  rang_b_data JSONB := '[]'::jsonb;
  fixed INTEGER := 0;
  errors INTEGER := 0;
  result_details JSONB := '[]'::jsonb;
BEGIN
  -- Parcourir tous les items EDN immersifs
  FOR item_record IN 
    SELECT id, item_code, title 
    FROM edn_items_immersive 
    ORDER BY item_code
  LOOP
    BEGIN
      -- Extraire le numéro d'item
      item_number := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
      
      -- Récupérer les compétences OIC Rang A pour cet item
      SELECT jsonb_agg(
        jsonb_build_object(
          'competence_id', objectif_id,
          'concept', COALESCE(intitule, 'Concept ' || objectif_id),
          'definition', COALESCE(description, 'Définition à compléter'),
          'exemple', COALESCE(SUBSTRING(sommaire FROM 1 FOR 200), 'Exemple clinique à développer'),
          'piege', 'Piège classique à identifier',
          'mnemo', 'Moyen mnémotechnique à créer',
          'subtilite', 'Subtilité importante à retenir',
          'application', 'Application pratique en situation clinique',
          'vigilance', 'Point de vigilance particulier',
          'paroles_chantables', ARRAY['Concept ' || objectif_id || ' à retenir', 'Application clinique essentielle']
        )
      ) INTO rang_a_data
      FROM oic_competences 
      WHERE item_parent = 'IC-' || item_number 
        AND rang = 'A'
      ORDER BY objectif_id;
      
      -- Récupérer les compétences OIC Rang B pour cet item
      SELECT jsonb_agg(
        jsonb_build_object(
          'competence_id', objectif_id,
          'concept', COALESCE(intitule, 'Concept avancé ' || objectif_id),
          'analyse', COALESCE(description, 'Analyse experte à développer'),
          'cas', COALESCE(SUBSTRING(sommaire FROM 1 FOR 200), 'Cas clinique complexe'),
          'ecueil', 'Écueil d''expert à éviter',
          'technique', 'Technique spécialisée',
          'maitrise', 'Niveau de maîtrise requis',
          'excellence', 'Critère d''excellence',
          'paroles_chantables', ARRAY['Expertise ' || objectif_id || ' niveau avancé', 'Maîtrise clinique approfondie']
        )
      ) INTO rang_b_data
      FROM oic_competences 
      WHERE item_parent = 'IC-' || item_number 
        AND rang = 'B'
      ORDER BY objectif_id;
      
      -- Si pas de données OIC, utiliser les données UNESS si disponibles
      IF rang_a_data IS NULL OR jsonb_array_length(rang_a_data) = 0 THEN
        -- Récupérer depuis edn_items_uness pour Rang A
        SELECT jsonb_agg(
          jsonb_build_object(
            'competence_id', 'UNESS-' || item_number || '-' || row_number() OVER() || '-A',
            'concept', rang_content,
            'definition', 'Compétence UNESS: ' || rang_content,
            'exemple', 'Application clinique selon UNESS',
            'piege', 'Erreur fréquente à éviter',
            'mnemo', 'Mémorisation item ' || item_number,
            'subtilite', 'Point clé UNESS',
            'application', 'Mise en pratique',
            'vigilance', 'Surveillance clinique',
            'paroles_chantables', ARRAY['Item ' || item_number || ' rang A', 'Compétence UNESS fondamentale']
          )
        ) INTO rang_a_data
        FROM (
          SELECT unnest(rangs_a) as rang_content
          FROM edn_items_uness 
          WHERE item_id = item_number
        ) t
        WHERE rang_content IS NOT NULL;
      END IF;
      
      IF rang_b_data IS NULL OR jsonb_array_length(rang_b_data) = 0 THEN
        -- Récupérer depuis edn_items_uness pour Rang B
        SELECT jsonb_agg(
          jsonb_build_object(
            'competence_id', 'UNESS-' || item_number || '-' || row_number() OVER() || '-B',
            'concept', rang_content,
            'analyse', 'Analyse experte UNESS: ' || rang_content,
            'cas', 'Cas complexe selon UNESS',
            'ecueil', 'Piège d''expert',
            'technique', 'Technique avancée',
            'maitrise', 'Maîtrise experte UNESS',
            'excellence', 'Excellence clinique',
            'paroles_chantables', ARRAY['Item ' || item_number || ' rang B', 'Expertise UNESS avancée']
          )
        ) INTO rang_b_data
        FROM (
          SELECT unnest(rangs_b) as rang_content
          FROM edn_items_uness 
          WHERE item_id = item_number
        ) t
        WHERE rang_content IS NOT NULL;
      END IF;
      
      -- Si toujours pas de données, créer contenu générique unique
      IF rang_a_data IS NULL OR jsonb_array_length(rang_a_data) = 0 THEN
        rang_a_data := jsonb_build_array(
          jsonb_build_object(
            'competence_id', 'GEN-' || LPAD(item_number::text, 3, '0') || '-01-A',
            'concept', 'Concept fondamental item ' || item_number,
            'definition', 'Définition spécifique pour ' || COALESCE(item_record.title, 'Item ' || item_number),
            'exemple', 'Exemple clinique unique pour item ' || item_number,
            'piege', 'Piège spécifique item ' || item_number,
            'mnemo', 'Moyen mnémotechnique item ' || item_number,
            'subtilite', 'Subtilité particulière item ' || item_number,
            'application', 'Application pratique item ' || item_number,
            'vigilance', 'Vigilance requise item ' || item_number,
            'paroles_chantables', ARRAY['Item ' || item_number || ' fondamental unique', 'Base clinique spécifique']
          )
        );
      END IF;
      
      IF rang_b_data IS NULL OR jsonb_array_length(rang_b_data) = 0 THEN
        rang_b_data := jsonb_build_array(
          jsonb_build_object(
            'competence_id', 'GEN-' || LPAD(item_number::text, 3, '0') || '-01-B',
            'concept', 'Expertise avancée item ' || item_number,
            'analyse', 'Analyse experte spécifique pour item ' || item_number || ': ' || COALESCE(item_record.title, 'contenu avancé'),
            'cas', 'Cas clinique complexe unique item ' || item_number,
            'ecueil', 'Écueil d''expert spécifique item ' || item_number,
            'technique', 'Technique spécialisée item ' || item_number,
            'maitrise', 'Maîtrise experte item ' || item_number,
            'excellence', 'Excellence clinique item ' || item_number,
            'paroles_chantables', ARRAY['Item ' || item_number || ' expertise unique', 'Niveau expert spécifique']
          )
        );
      END IF;
      
      -- Mise à jour de l'item avec contenu unique
      UPDATE edn_items_immersive 
      SET 
        tableau_rang_a = jsonb_build_object(
          'title', item_record.item_code || ' Rang A - Connaissances fondamentales',
          'subtitle', 'Compétences de base spécifiques (' || jsonb_array_length(rang_a_data) || ' compétences)',
          'sections', jsonb_build_array(
            jsonb_build_object(
              'title', 'Compétences fondamentales ' || item_record.item_code,
              'concepts', rang_a_data
            )
          )
        ),
        tableau_rang_b = jsonb_build_object(
          'title', item_record.item_code || ' Rang B - Expertise clinique',
          'subtitle', 'Connaissances approfondies spécifiques (' || jsonb_array_length(rang_b_data) || ' compétences)',
          'sections', jsonb_build_array(
            jsonb_build_object(
              'title', 'Expertise avancée ' || item_record.item_code,
              'concepts', rang_b_data
            )
          )
        ),
        paroles_musicales = CASE 
          WHEN jsonb_array_length(rang_a_data) > 0 AND rang_a_data->0->>'competence_id' LIKE 'OIC-%' THEN
            ARRAY[
              'Item ' || item_number || ' - ' || COALESCE(SUBSTRING(item_record.title FROM 1 FOR 50), 'Connaissances OIC'),
              'Compétences OIC spécifiques, maîtrise référentielle',
              'Rang A fondamental, rang B expertise confirmée'
            ]
          WHEN jsonb_array_length(rang_a_data) > 0 AND rang_a_data->0->>'competence_id' LIKE 'UNESS-%' THEN
            ARRAY[
              'Item ' || item_number || ' - ' || COALESCE(SUBSTRING(item_record.title FROM 1 FOR 50), 'Connaissances UNESS'),
              'Données UNESS officielles, contenu validé',
              'Formation médicale continue spécialisée'
            ]
          ELSE
            ARRAY[
              'Item ' || item_number || ' - ' || COALESCE(SUBSTRING(item_record.title FROM 1 FOR 50), 'Connaissances uniques'),
              'Contenu spécifique item ' || item_number,
              'Compétences médicales ciblées'
            ]
        END,
        updated_at = now()
      WHERE id = item_record.id;
      
      fixed := fixed + 1;
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'rang_a_count', jsonb_array_length(rang_a_data),
        'rang_b_count', jsonb_array_length(rang_b_data),
        'data_source', CASE 
          WHEN jsonb_array_length(rang_a_data) > 0 AND rang_a_data->0->>'competence_id' LIKE 'OIC-%' THEN 'OIC'
          WHEN jsonb_array_length(rang_a_data) > 0 AND rang_a_data->0->>'competence_id' LIKE 'UNESS-%' THEN 'UNESS'
          ELSE 'GENERATED'
        END,
        'status', 'updated'
      );
      
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'error', SQLERRM,
        'status', 'error'
      );
    END;
  END LOOP;
  
  RETURN QUERY SELECT fixed, errors, result_details;
END;
$$;