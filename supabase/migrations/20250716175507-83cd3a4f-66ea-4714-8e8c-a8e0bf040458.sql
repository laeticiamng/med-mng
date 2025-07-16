-- 🚀 INTÉGRATION COMPLÈTE DES 4872 COMPÉTENCES OIC DANS LES 367 ITEMS EDN
-- Migration pour intégrer automatiquement toutes les compétences OIC réelles

CREATE OR REPLACE FUNCTION public.integrate_all_oic_competences_into_edn_items()
RETURNS TABLE(
  processed_items INTEGER,
  integrated_competences INTEGER,
  rang_a_total INTEGER,
  rang_b_total INTEGER,
  success_details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  item_number TEXT;
  rang_a_competences JSONB := '[]'::jsonb;
  rang_b_competences JSONB := '[]'::jsonb;
  processed INTEGER := 0;
  total_integrated INTEGER := 0;
  total_rang_a INTEGER := 0;
  total_rang_b INTEGER := 0;
  result_details JSONB := '[]'::jsonb;
  competence_record RECORD;
  temp_rang_a JSONB := '[]'::jsonb;
  temp_rang_b JSONB := '[]'::jsonb;
BEGIN
  -- Parcourir tous les items EDN
  FOR item_record IN 
    SELECT id, item_code, title 
    FROM edn_items_immersive 
    ORDER BY item_code
  LOOP
    BEGIN
      processed := processed + 1;
      
      -- Extraire le numéro d'item (IC-1 -> 001, IC-23 -> 023)
      item_number := LPAD(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER::TEXT, 3, '0');
      
      -- Réinitialiser les tableaux temporaires
      temp_rang_a := '[]'::jsonb;
      temp_rang_b := '[]'::jsonb;
      
      -- Récupérer et construire les compétences Rang A
      FOR competence_record IN
        SELECT 
          objectif_id,
          intitule,
          description,
          sommaire,
          mecanismes,
          indications,
          effets_indesirables,
          interactions,
          modalites_surveillance,
          causes_echec,
          contributeurs,
          titre_complet
        FROM oic_competences 
        WHERE item_parent = item_number 
          AND rang = 'A'
        ORDER BY objectif_id
      LOOP
        temp_rang_a := temp_rang_a || jsonb_build_object(
          'competence_id', competence_record.objectif_id,
          'concept', COALESCE(competence_record.intitule, 'Concept ' || competence_record.objectif_id),
          'definition', COALESCE(competence_record.description, 'Définition médicale à compléter'),
          'titre_complet', COALESCE(competence_record.titre_complet, ''),
          'sommaire', COALESCE(competence_record.sommaire, ''),
          'mecanismes', COALESCE(competence_record.mecanismes, ''),
          'indications', COALESCE(competence_record.indications, ''),
          'effets_indesirables', COALESCE(competence_record.effets_indesirables, ''),
          'interactions', COALESCE(competence_record.interactions, ''),
          'modalites_surveillance', COALESCE(competence_record.modalites_surveillance, ''),
          'causes_echec', COALESCE(competence_record.causes_echec, ''),
          'contributeurs', COALESCE(competence_record.contributeurs, ''),
          'exemple', COALESCE(SUBSTRING(competence_record.sommaire FROM 1 FOR 200), 'Exemple clinique à développer'),
          'piege', 'Piège classique à identifier pour ' || competence_record.objectif_id,
          'mnemo', 'Moyen mnémotechnique pour ' || competence_record.objectif_id,
          'subtilite', 'Subtilité importante à retenir',
          'application', 'Application pratique en situation clinique',
          'vigilance', 'Point de vigilance particulier',
          'paroles_chantables', ARRAY[
            COALESCE(competence_record.intitule, 'Concept ' || competence_record.objectif_id),
            'Application clinique essentielle'
          ]
        );
        total_rang_a := total_rang_a + 1;
      END LOOP;
      
      -- Récupérer et construire les compétences Rang B
      FOR competence_record IN
        SELECT 
          objectif_id,
          intitule,
          description,
          sommaire,
          mecanismes,
          indications,
          effets_indesirables,
          interactions,
          modalites_surveillance,
          causes_echec,
          contributeurs,
          titre_complet
        FROM oic_competences 
        WHERE item_parent = item_number 
          AND rang = 'B'
        ORDER BY objectif_id
      LOOP
        temp_rang_b := temp_rang_b || jsonb_build_object(
          'competence_id', competence_record.objectif_id,
          'concept', COALESCE(competence_record.intitule, 'Concept avancé ' || competence_record.objectif_id),
          'analyse', COALESCE(competence_record.description, 'Analyse experte à développer'),
          'titre_complet', COALESCE(competence_record.titre_complet, ''),
          'sommaire', COALESCE(competence_record.sommaire, ''),
          'mecanismes', COALESCE(competence_record.mecanismes, ''),
          'indications', COALESCE(competence_record.indications, ''),
          'effets_indesirables', COALESCE(competence_record.effets_indesirables, ''),
          'interactions', COALESCE(competence_record.interactions, ''),
          'modalites_surveillance', COALESCE(competence_record.modalites_surveillance, ''),
          'causes_echec', COALESCE(competence_record.causes_echec, ''),
          'contributeurs', COALESCE(competence_record.contributeurs, ''),
          'cas', COALESCE(SUBSTRING(competence_record.sommaire FROM 1 FOR 200), 'Cas clinique complexe'),
          'ecueil', 'Écueil d''expert à éviter pour ' || competence_record.objectif_id,
          'technique', 'Technique spécialisée avancée',
          'maitrise', 'Niveau de maîtrise expert requis',
          'excellence', 'Critère d''excellence clinique',
          'paroles_chantables', ARRAY[
            COALESCE(competence_record.intitule, 'Expertise ' || competence_record.objectif_id),
            'Maîtrise clinique approfondie'
          ]
        );
        total_rang_b := total_rang_b + 1;
      END LOOP;
      
      -- Construire les données finales pour les tableaux
      rang_a_competences := jsonb_build_object(
        'title', item_record.item_code || ' Rang A - Compétences fondamentales',
        'subtitle', 'Connaissances de base à maîtriser (' || jsonb_array_length(temp_rang_a) || ' compétences OIC)',
        'sections', jsonb_build_array(
          jsonb_build_object(
            'title', 'Compétences OIC authentiques ' || item_record.item_code,
            'competences', temp_rang_a,
            'source', 'Compétences officielles OIC intégrées'
          )
        )
      );
      
      rang_b_competences := jsonb_build_object(
        'title', item_record.item_code || ' Rang B - Expertise clinique',
        'subtitle', 'Connaissances approfondies (' || jsonb_array_length(temp_rang_b) || ' compétences OIC)',
        'sections', jsonb_build_array(
          jsonb_build_object(
            'title', 'Expertise OIC avancée ' || item_record.item_code,
            'competences', temp_rang_b,
            'source', 'Compétences officielles OIC niveau expert'
          )
        )
      );
      
      -- Mettre à jour l'item avec les compétences réelles
      UPDATE edn_items_immersive 
      SET 
        tableau_rang_a = rang_a_competences,
        tableau_rang_b = rang_b_competences,
        paroles_musicales = ARRAY[
          'Item ' || SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER || ' - ' || COALESCE(SUBSTRING(item_record.title FROM 1 FOR 50), 'Compétences médicales'),
          'Rang A fondamental avec ' || jsonb_array_length(temp_rang_a) || ' compétences OIC',
          'Rang B expertise avec ' || jsonb_array_length(temp_rang_b) || ' compétences OIC avancées',
          'Compétences ' || item_record.item_code || ' intégrées depuis la base OIC officielle',
          'Formation médicale continue, excellence clinique garantie'
        ],
        updated_at = now()
      WHERE id = item_record.id;
      
      total_integrated := total_integrated + jsonb_array_length(temp_rang_a) + jsonb_array_length(temp_rang_b);
      
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'item_number', item_number,
        'rang_a_count', jsonb_array_length(temp_rang_a),
        'rang_b_count', jsonb_array_length(temp_rang_b),
        'total_competences', jsonb_array_length(temp_rang_a) + jsonb_array_length(temp_rang_b),
        'status', 'success'
      );
      
    EXCEPTION WHEN OTHERS THEN
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'item_number', item_number,
        'error', SQLERRM,
        'status', 'error'
      );
    END;
  END LOOP;
  
  RETURN QUERY SELECT 
    processed, 
    total_integrated, 
    total_rang_a, 
    total_rang_b, 
    result_details;
END;
$$;

-- Exécuter l'intégration complète
SELECT * FROM public.integrate_all_oic_competences_into_edn_items();