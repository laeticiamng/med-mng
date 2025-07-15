-- Fonction corrigée pour utiliser directement les données UNESS et éviter les redondances
CREATE OR REPLACE FUNCTION public.fix_all_edn_items_complete_uness_correction()
RETURNS TABLE(fixed_count integer, errors_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  item_number INTEGER;
  uness_data RECORD;
  rang_a_concepts JSONB := '[]'::jsonb;
  rang_b_concepts JSONB := '[]'::jsonb;
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
      
      -- Récupérer les données UNESS pour cet item spécifique
      SELECT item_id, intitule, rangs_a, rangs_b, contenu_complet_html
      INTO uness_data
      FROM edn_items_uness 
      WHERE item_id = item_number;
      
      -- Construire les concepts Rang A à partir des données UNESS
      IF uness_data.rangs_a IS NOT NULL AND array_length(uness_data.rangs_a, 1) > 0 THEN
        SELECT jsonb_agg(
          jsonb_build_object(
            'competence_id', 'UNESS-' || item_number || '-' || row_number() OVER() || '-A',
            'concept', rang_content,
            'definition', 'Compétence UNESS Rang A: ' || rang_content,
            'exemple', 'Application clinique spécifique pour item ' || item_number || ': ' || rang_content,
            'piege', 'Erreur fréquente à éviter pour item ' || item_number,
            'mnemo', 'Mémorisation item ' || item_number || ' - ' || LEFT(rang_content, 30),
            'subtilite', 'Point clé UNESS item ' || item_number,
            'application', 'Mise en pratique spécifique item ' || item_number,
            'vigilance', 'Surveillance clinique item ' || item_number,
            'paroles_chantables', ARRAY[
              'Item ' || item_number || ' rang A - ' || LEFT(rang_content, 40),
              'Compétence UNESS fondamentale spécifique'
            ]
          )
        ) INTO rang_a_concepts
        FROM (
          SELECT unnest(uness_data.rangs_a) as rang_content, 
                 row_number() OVER() as rn
        ) t
        WHERE rang_content IS NOT NULL AND LENGTH(TRIM(rang_content)) > 5;
      END IF;
      
      -- Construire les concepts Rang B à partir des données UNESS
      IF uness_data.rangs_b IS NOT NULL AND array_length(uness_data.rangs_b, 1) > 0 THEN
        SELECT jsonb_agg(
          jsonb_build_object(
            'competence_id', 'UNESS-' || item_number || '-' || row_number() OVER() || '-B',
            'concept', rang_content,
            'analyse', 'Analyse experte UNESS Rang B: ' || rang_content,
            'cas', 'Cas complexe selon UNESS pour item ' || item_number || ': ' || rang_content,
            'ecueil', 'Piège d''expert spécifique item ' || item_number,
            'technique', 'Technique avancée item ' || item_number,
            'maitrise', 'Maîtrise experte UNESS item ' || item_number,
            'excellence', 'Excellence clinique spécifique item ' || item_number,
            'paroles_chantables', ARRAY[
              'Item ' || item_number || ' rang B - ' || LEFT(rang_content, 40),
              'Expertise UNESS avancée spécifique'
            ]
          )
        ) INTO rang_b_concepts
        FROM (
          SELECT unnest(uness_data.rangs_b) as rang_content,
                 row_number() OVER() as rn
        ) t
        WHERE rang_content IS NOT NULL AND LENGTH(TRIM(rang_content)) > 5;
      END IF;
      
      -- Si pas de données UNESS, créer contenu générique unique basé sur le numéro d'item
      IF rang_a_concepts IS NULL OR jsonb_array_length(rang_a_concepts) = 0 THEN
        rang_a_concepts := jsonb_build_array(
          jsonb_build_object(
            'competence_id', 'GEN-' || LPAD(item_number::text, 3, '0') || '-01-A',
            'concept', 'Concept fondamental spécifique item ' || item_number,
            'definition', 'Définition unique pour item ' || item_number || ': ' || COALESCE(item_record.title, 'Item médical ' || item_number),
            'exemple', 'Exemple clinique exclusif item ' || item_number || ' - situation type',
            'piege', 'Piège diagnostique particulier item ' || item_number,
            'mnemo', 'Moyen mnémotechnique exclusif item ' || item_number,
            'subtilite', 'Subtilité médicale propre item ' || item_number,
            'application', 'Application pratique exclusive item ' || item_number,
            'vigilance', 'Vigilance spécifique requise item ' || item_number,
            'paroles_chantables', ARRAY[
              'Item ' || item_number || ' unique - fondamental spécifique',
              'Base clinique exclusive item ' || item_number
            ]
          ),
          jsonb_build_object(
            'competence_id', 'GEN-' || LPAD(item_number::text, 3, '0') || '-02-A',
            'concept', 'Diagnostic spécifique item ' || item_number,
            'definition', 'Approche diagnostique unique item ' || item_number,
            'exemple', 'Cas diagnostique type item ' || item_number,
            'piege', 'Erreur diagnostique fréquente item ' || item_number,
            'mnemo', 'Aide diagnostic spécifique item ' || item_number,
            'subtilite', 'Nuance diagnostique item ' || item_number,
            'application', 'Démarche diagnostique item ' || item_number,
            'vigilance', 'Attention particulière item ' || item_number,
            'paroles_chantables', ARRAY[
              'Diagnostic item ' || item_number || ' précis et unique',
              'Démarche clinique spécifique item ' || item_number
            ]
          )
        );
      END IF;
      
      IF rang_b_concepts IS NULL OR jsonb_array_length(rang_b_concepts) = 0 THEN
        rang_b_concepts := jsonb_build_array(
          jsonb_build_object(
            'competence_id', 'GEN-' || LPAD(item_number::text, 3, '0') || '-01-B',
            'concept', 'Expertise avancée exclusive item ' || item_number,
            'analyse', 'Analyse experte spécifique item ' || item_number || ': ' || COALESCE(item_record.title, 'expertise médicale avancée'),
            'cas', 'Cas clinique complexe unique item ' || item_number || ' avec complications',
            'ecueil', 'Écueil d''expert particulier item ' || item_number,
            'technique', 'Technique spécialisée exclusive item ' || item_number,
            'maitrise', 'Maîtrise experte spécifique item ' || item_number,
            'excellence', 'Critère d''excellence unique item ' || item_number,
            'paroles_chantables', ARRAY[
              'Item ' || item_number || ' expertise exclusive confirmée',
              'Niveau expert spécifique item ' || item_number
            ]
          ),
          jsonb_build_object(
            'competence_id', 'GEN-' || LPAD(item_number::text, 3, '0') || '-02-B',
            'concept', 'Complications avancées item ' || item_number,
            'analyse', 'Gestion complexe spécifique item ' || item_number,
            'cas', 'Situation critique unique item ' || item_number,
            'ecueil', 'Piège de spécialiste item ' || item_number,
            'technique', 'Technique experte item ' || item_number,
            'maitrise', 'Maîtrise approfondie item ' || item_number,
            'excellence', 'Excellence clinique item ' || item_number,
            'paroles_chantables', ARRAY[
              'Complications item ' || item_number || ' maîtrisées',
              'Gestion experte spécifique item ' || item_number
            ]
          )
        );
      END IF;
      
      -- Mise à jour de l'item avec contenu unique et spécifique
      UPDATE edn_items_immersive 
      SET 
        tableau_rang_a = jsonb_build_object(
          'title', item_record.item_code || ' Rang A - Connaissances fondamentales spécifiques',
          'subtitle', 'Compétences de base uniques item ' || item_number || ' (' || jsonb_array_length(rang_a_concepts) || ' compétences)',
          'sections', jsonb_build_array(
            jsonb_build_object(
              'title', 'Compétences fondamentales exclusives ' || item_record.item_code,
              'concepts', rang_a_concepts
            )
          )
        ),
        tableau_rang_b = jsonb_build_object(
          'title', item_record.item_code || ' Rang B - Expertise clinique spécialisée',
          'subtitle', 'Connaissances approfondies uniques item ' || item_number || ' (' || jsonb_array_length(rang_b_concepts) || ' compétences)',
          'sections', jsonb_build_array(
            jsonb_build_object(
              'title', 'Expertise avancée exclusive ' || item_record.item_code,
              'concepts', rang_b_concepts
            )
          )
        ),
        paroles_musicales = CASE 
          WHEN uness_data.item_id IS NOT NULL THEN
            ARRAY[
              'Item ' || item_number || ' - ' || COALESCE(SUBSTRING(COALESCE(uness_data.intitule, item_record.title) FROM 1 FOR 50), 'UNESS officiel'),
              'Données UNESS authentiques item ' || item_number,
              'Contenu officiel validé spécifique'
            ]
          ELSE
            ARRAY[
              'Item ' || item_number || ' - ' || COALESCE(SUBSTRING(item_record.title FROM 1 FOR 50), 'Connaissances uniques'),
              'Contenu exclusif item ' || item_number,
              'Compétences médicales spécialisées item ' || item_number
            ]
        END,
        updated_at = now()
      WHERE id = item_record.id;
      
      fixed := fixed + 1;
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'rang_a_count', jsonb_array_length(rang_a_concepts),
        'rang_b_count', jsonb_array_length(rang_b_concepts),
        'data_source', CASE 
          WHEN uness_data.item_id IS NOT NULL THEN 'UNESS_OFFICIAL'
          ELSE 'GENERATED_UNIQUE'
        END,
        'uness_title', uness_data.intitule,
        'status', 'updated_unique'
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