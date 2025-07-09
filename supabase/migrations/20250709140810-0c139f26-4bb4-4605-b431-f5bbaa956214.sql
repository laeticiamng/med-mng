-- Correction de la fonction et mise à jour simplifiée
CREATE OR REPLACE FUNCTION fix_all_edn_items_simple_correction()
RETURNS TABLE(fixed_count integer, errors_count integer, details jsonb) AS $$
DECLARE
  item_record RECORD;
  item_number INTEGER;
  rang_a_concepts JSONB := '[]'::jsonb;
  rang_b_concepts JSONB := '[]'::jsonb;
  fixed INTEGER := 0;
  errors INTEGER := 0;
  result_details JSONB := '[]'::jsonb;
BEGIN
  -- Parcourir tous les items sauf IC-4
  FOR item_record IN 
    SELECT id, item_code, title 
    FROM edn_items_immersive 
    WHERE item_code != 'IC-4'
    ORDER BY item_code
  LOOP
    BEGIN
      -- Extraire le numéro d'item
      item_number := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
      
      -- Récupérer les compétences OIC Rang A pour cet item (requête simplifiée)
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
      ) INTO rang_a_concepts
      FROM oic_competences 
      WHERE item_parent = 'IC-' || item_number 
        AND rang = 'A'
      ORDER BY objectif_id;
      
      -- Récupérer les compétences OIC Rang B pour cet item (requête simplifiée)
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
      ) INTO rang_b_concepts
      FROM oic_competences 
      WHERE item_parent = 'IC-' || item_number 
        AND rang = 'B'
      ORDER BY objectif_id;
      
      -- Si pas de données OIC, créer contenu générique complet
      IF rang_a_concepts IS NULL OR jsonb_array_length(rang_a_concepts) = 0 THEN
        rang_a_concepts := jsonb_build_array(
          jsonb_build_object(
            'competence_id', 'OIC-' || LPAD(item_number::text, 3, '0') || '-01-A',
            'concept', 'Concept fondamental item ' || item_number,
            'definition', 'Définition médicale de base pour l''item ' || item_number || ': ' || COALESCE(item_record.title, 'Item médical'),
            'exemple', 'Exemple clinique concret pour item ' || item_number,
            'piege', 'Piège classique à éviter pour item ' || item_number,
            'mnemo', 'Moyen mnémotechnique pour item ' || item_number,
            'subtilite', 'Point subtil à retenir pour item ' || item_number,
            'application', 'Application pratique clinique pour item ' || item_number,
            'vigilance', 'Vigilance particulière requise pour item ' || item_number,
            'paroles_chantables', ARRAY['Item ' || item_number || ' fondamental à maîtriser', 'Base clinique solide nécessaire']
          ),
          jsonb_build_object(
            'competence_id', 'OIC-' || LPAD(item_number::text, 3, '0') || '-02-A',
            'concept', 'Diagnostic item ' || item_number,
            'definition', 'Approche diagnostique spécifique pour l''item ' || item_number,
            'exemple', 'Cas clinique diagnostic item ' || item_number,
            'piege', 'Erreur diagnostique fréquente item ' || item_number,
            'mnemo', 'Aide diagnostic item ' || item_number,
            'subtilite', 'Nuance diagnostique item ' || item_number,
            'application', 'Démarche diagnostique pratique item ' || item_number,
            'vigilance', 'Attention diagnostic item ' || item_number,
            'paroles_chantables', ARRAY['Diagnostic item ' || item_number || ' précis', 'Démarche clinique rigoureuse']
          ),
          jsonb_build_object(
            'competence_id', 'OIC-' || LPAD(item_number::text, 3, '0') || '-03-A',
            'concept', 'Traitement item ' || item_number,
            'definition', 'Prise en charge thérapeutique pour l''item ' || item_number,
            'exemple', 'Protocole thérapeutique item ' || item_number,
            'piege', 'Erreur thérapeutique à éviter item ' || item_number,
            'mnemo', 'Aide thérapeutique item ' || item_number,
            'subtilite', 'Nuance thérapeutique item ' || item_number,
            'application', 'Application thérapeutique pratique item ' || item_number,
            'vigilance', 'Surveillance thérapeutique item ' || item_number,
            'paroles_chantables', ARRAY['Traitement item ' || item_number || ' adapté', 'Thérapeutique efficace et sûre']
          )
        );
      END IF;
      
      IF rang_b_concepts IS NULL OR jsonb_array_length(rang_b_concepts) = 0 THEN
        rang_b_concepts := jsonb_build_array(
          jsonb_build_object(
            'competence_id', 'OIC-' || LPAD(item_number::text, 3, '0') || '-01-B',
            'concept', 'Expertise avancée item ' || item_number,
            'analyse', 'Analyse experte approfondie pour l''item ' || item_number || ': expertise clinique avancée',
            'cas', 'Cas clinique complexe item ' || item_number || ' nécessitant expertise',
            'ecueil', 'Écueil d''expert à éviter pour item ' || item_number,
            'technique', 'Technique spécialisée pour item ' || item_number,
            'maitrise', 'Maîtrise experte requise pour item ' || item_number,
            'excellence', 'Excellence clinique pour item ' || item_number,
            'paroles_chantables', ARRAY['Item ' || item_number || ' expertise confirmée', 'Niveau expert clinique maîtrisé']
          ),
          jsonb_build_object(
            'competence_id', 'OIC-' || LPAD(item_number::text, 3, '0') || '-02-B',
            'concept', 'Complications item ' || item_number,
            'analyse', 'Gestion des complications complexes item ' || item_number,
            'cas', 'Cas avec complications item ' || item_number,
            'ecueil', 'Piège dans complications item ' || item_number,
            'technique', 'Technique avancée complications item ' || item_number,
            'maitrise', 'Maîtrise complications item ' || item_number,
            'excellence', 'Excellence gestion complications item ' || item_number,
            'paroles_chantables', ARRAY['Complications item ' || item_number || ' maîtrisées', 'Gestion experte situations complexes']
          )
        );
      END IF;
      
      -- Mise à jour complète de l'item
      UPDATE edn_items_immersive 
      SET 
        tableau_rang_a = jsonb_build_object(
          'title', item_record.item_code || ' Rang A - Connaissances fondamentales',
          'subtitle', 'Concepts de base à maîtriser (' || jsonb_array_length(rang_a_concepts) || ' compétences)',
          'sections', jsonb_build_array(
            jsonb_build_object(
              'title', 'Compétences fondamentales ' || item_record.item_code,
              'concepts', rang_a_concepts
            )
          )
        ),
        tableau_rang_b = jsonb_build_object(
          'title', item_record.item_code || ' Rang B - Expertise clinique',
          'subtitle', 'Connaissances approfondies (' || jsonb_array_length(rang_b_concepts) || ' compétences)',
          'sections', jsonb_build_array(
            jsonb_build_object(
              'title', 'Expertise avancée ' || item_record.item_code,
              'concepts', rang_b_concepts
            )
          )
        ),
        paroles_musicales = ARRAY[
          'Item ' || item_number || ' - ' || COALESCE(SUBSTRING(item_record.title FROM 1 FOR 50), 'Connaissances médicales'),
          'Rang A fondamental, rang B pour l''expertise',
          'Concepts cliniques essentiels, application pratique référentielle',
          'Compétences ' || item_record.item_code || ' à maîtriser parfaitement',
          'Formation médicale continue, excellence clinique'
        ],
        updated_at = now()
      WHERE id = item_record.id;
      
      fixed := fixed + 1;
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'rang_a_count', jsonb_array_length(rang_a_concepts),
        'rang_b_count', jsonb_array_length(rang_b_concepts),
        'status', 'completed'
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exécuter la correction simplifiée
SELECT fixed_count, errors_count FROM fix_all_edn_items_simple_correction() LIMIT 1;