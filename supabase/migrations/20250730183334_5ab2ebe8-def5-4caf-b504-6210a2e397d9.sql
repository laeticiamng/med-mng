-- Fonction pour enrichir les items EDN avec les compétences OIC de la sauvegarde
CREATE OR REPLACE FUNCTION public.enrich_edn_items_with_oic_competences()
RETURNS TABLE(processed_count integer, success_count integer, error_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  item_record RECORD;
  processed INTEGER := 0;
  success INTEGER := 0;
  errors INTEGER := 0;
  error_details JSONB := '[]'::jsonb;
  rang_a_competences JSONB;
  rang_b_competences JSONB;
  total_competences INTEGER := 0;
BEGIN
  -- Parcourir tous les items EDN
  FOR item_record IN 
    SELECT id, item_code, title 
    FROM edn_items_complete 
    ORDER BY item_code
  LOOP
    BEGIN
      processed := processed + 1;
      
      -- Récupérer les compétences Rang A pour cet item
      SELECT jsonb_agg(
        jsonb_build_object(
          'objectif_id', objectif_id,
          'intitule', COALESCE(intitule, 'Compétence ' || objectif_id),
          'description', COALESCE(description, 'Description à compléter'),
          'rubrique', COALESCE(rubrique, 'Rubrique générale'),
          'ordre', COALESCE(ordre, 1),
          'concept', COALESCE(intitule, 'Concept ' || objectif_id),
          'definition', COALESCE(SUBSTRING(description FROM 1 FOR 300), 'Définition à développer'),
          'exemple', 'Exemple clinique pratique à développer',
          'piege', 'Piège diagnostique ou thérapeutique à identifier',
          'mnemo', 'Moyen mnémotechnique pour retenir',
          'subtilite', 'Subtilité importante en pratique',
          'application', 'Application concrète en situation clinique',
          'vigilance', 'Point de vigilance particulier',
          'paroles_chantables', ARRAY[
            COALESCE(intitule, 'Compétence ' || objectif_id) || ' à maîtriser',
            'Application clinique essentielle'
          ]
        )
      ) INTO rang_a_competences
      FROM backup_oic_competences 
      WHERE item_parent = item_record.item_code 
        AND rang = 'A'
      ORDER BY ordre, objectif_id;
      
      -- Récupérer les compétences Rang B pour cet item
      SELECT jsonb_agg(
        jsonb_build_object(
          'objectif_id', objectif_id,
          'intitule', COALESCE(intitule, 'Compétence approfondie ' || objectif_id),
          'description', COALESCE(description, 'Description avancée à compléter'),
          'rubrique', COALESCE(rubrique, 'Rubrique spécialisée'),
          'ordre', COALESCE(ordre, 1),
          'concept', COALESCE(intitule, 'Concept avancé ' || objectif_id),
          'definition', COALESCE(SUBSTRING(description FROM 1 FOR 300), 'Définition approfondie à développer'),
          'exemple', 'Cas clinique complexe à analyser',
          'piege', 'Piège de niveau expert à éviter',
          'mnemo', 'Technique mnémotechnique avancée',
          'subtilite', 'Nuances expertes en pratique spécialisée',
          'application', 'Application dans des situations complexes',
          'vigilance', 'Vigilance de niveau expert',
          'paroles_chantables', ARRAY[
            COALESCE(intitule, 'Expertise ' || objectif_id) || ' approfondie',
            'Maîtrise experte indispensable'
          ]
        )
      ) INTO rang_b_competences
      FROM backup_oic_competences 
      WHERE item_parent = item_record.item_code 
        AND rang = 'B'
      ORDER BY ordre, objectif_id;
      
      -- Compter le total des compétences
      SELECT 
        COALESCE(jsonb_array_length(rang_a_competences), 0) + 
        COALESCE(jsonb_array_length(rang_b_competences), 0)
      INTO total_competences;
      
      -- Si aucune compétence trouvée, créer des compétences par défaut
      IF rang_a_competences IS NULL THEN
        rang_a_competences := jsonb_build_array(
          jsonb_build_object(
            'objectif_id', item_record.item_code || '-A1',
            'intitule', 'Connaissances fondamentales',
            'description', 'Connaissances de base pour ' || item_record.title,
            'rubrique', 'Base théorique',
            'ordre', 1,
            'concept', 'Concept fondamental',
            'definition', 'Bases essentielles à maîtriser',
            'exemple', 'Situations cliniques courantes',
            'piege', 'Erreurs fréquentes à éviter',
            'mnemo', 'Points clés à retenir',
            'subtilite', 'Nuances importantes',
            'application', 'Usage en pratique quotidienne',
            'vigilance', 'Précautions de base',
            'paroles_chantables', ARRAY[
              'Fondamentaux ' || item_record.item_code || ' essentiels',
              'Base solide pour la pratique'
            ]
          )
        );
      END IF;
      
      IF rang_b_competences IS NULL THEN
        rang_b_competences := jsonb_build_array(
          jsonb_build_object(
            'objectif_id', item_record.item_code || '-B1',
            'intitule', 'Expertise approfondie',
            'description', 'Connaissances approfondies pour ' || item_record.title,
            'rubrique', 'Expertise avancée',
            'ordre', 1,
            'concept', 'Maîtrise experte',
            'definition', 'Compétences de haut niveau',
            'exemple', 'Cas complexes et situations rares',
            'piege', 'Pièges subtils d''expert',
            'mnemo', 'Techniques avancées de mémorisation',
            'subtilite', 'Finesses de l''expertise',
            'application', 'Situations complexes et spécialisées',
            'vigilance', 'Vigilance de niveau expert',
            'paroles_chantables', ARRAY[
              'Expertise ' || item_record.item_code || ' avancée',
              'Maîtrise experte indispensable'
            ]
          )
        );
      END IF;
      
      -- Mettre à jour l'item avec les compétences enrichies
      UPDATE edn_items_complete 
      SET 
        competences_oic_rang_a = rang_a_competences,
        competences_oic_rang_b = rang_b_competences,
        competences_count_rang_a = jsonb_array_length(rang_a_competences),
        competences_count_rang_b = jsonb_array_length(rang_b_competences),
        competences_count_total = jsonb_array_length(rang_a_competences) + jsonb_array_length(rang_b_competences),
        updated_at = now()
      WHERE id = item_record.id;
      
      success := success + 1;
      
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      error_details := error_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  -- Retourner les résultats
  RETURN QUERY SELECT processed, success, errors, error_details;
END;
$function$;

-- Exécuter la fonction d'enrichissement
SELECT * FROM public.enrich_edn_items_with_oic_competences();