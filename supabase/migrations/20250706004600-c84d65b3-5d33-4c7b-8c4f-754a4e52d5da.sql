-- 🔧 CORRECTION CRITIQUE : FIX DE LA CORRESPONDANCE DES NUMÉROS D'ITEMS
-- Problème : "001" dans OIC vs "1" dans la recherche

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
  processed INTEGER := 0;
  total_integrated INTEGER := 0;
  total_rang_a INTEGER := 0;
  total_rang_b INTEGER := 0;
  competences_a JSONB;
  competences_b JSONB;
  rang_a_data JSONB;
  rang_b_data JSONB;
  paroles_data TEXT[];
  result_details JSONB := '[]'::jsonb;
  comp_count_a INTEGER;
  comp_count_b INTEGER;
  padded_item_num TEXT;
BEGIN
  -- Parcourir TOUS les items EDN
  FOR item_record IN 
    SELECT 
      id, 
      item_code, 
      title,
      CAST(SUBSTRING(item_code FROM 'IC-([0-9]+)') AS INTEGER) as item_num
    FROM edn_items_immersive 
    ORDER BY item_code
  LOOP
    BEGIN
      -- 🚨 CORRECTION CRITIQUE : Formater le numéro avec zéros (1 -> "001")
      padded_item_num := LPAD(item_record.item_num::TEXT, 3, '0');
      
      -- Récupérer les compétences rang A pour cet item avec numéro formaté
      SELECT jsonb_agg(
        jsonb_build_object(
          'title', COALESCE(NULLIF(TRIM(intitule), ''), 'OIC-' || objectif_id),
          'content', COALESCE(NULLIF(TRIM(description), ''), 'Compétence ' || objectif_id || ' - ' || COALESCE(rubrique, 'Formation médicale')),
          'objectif_id', objectif_id,
          'rubrique', COALESCE(rubrique, 'Médecine générale'),
          'keywords', ARRAY[
            LOWER(COALESCE(rubrique, 'medical')),
            'item' || padded_item_num,
            'rang-a',
            objectif_id,
            'competence'
          ]
        ) ORDER BY ordre, objectif_id
      ), COUNT(*)
      INTO competences_a, comp_count_a
      FROM oic_competences
      WHERE item_parent = padded_item_num AND rang = 'A';
      
      -- Récupérer les compétences rang B pour cet item avec numéro formaté
      SELECT jsonb_agg(
        jsonb_build_object(
          'title', COALESCE(NULLIF(TRIM(intitule), ''), 'OIC-' || objectif_id),
          'content', COALESCE(NULLIF(TRIM(description), ''), 'Compétence ' || objectif_id || ' - ' || COALESCE(rubrique, 'Formation médicale')),
          'objectif_id', objectif_id,
          'rubrique', COALESCE(rubrique, 'Médecine générale'),
          'keywords', ARRAY[
            LOWER(COALESCE(rubrique, 'medical')),
            'item' || padded_item_num,
            'rang-b', 
            objectif_id,
            'competence'
          ]
        ) ORDER BY ordre, objectif_id
      ), COUNT(*)
      INTO competences_b, comp_count_b
      FROM oic_competences
      WHERE item_parent = padded_item_num AND rang = 'B';
      
      -- Construire les données tableau rang A
      rang_a_data := jsonb_build_object(
        'title', item_record.item_code || ' Rang A - Compétences fondamentales',
        'subtitle', 'Connaissances de base à maîtriser',
        'item_number', item_record.item_num,
        'sections', COALESCE(competences_a, '[]'::jsonb),
        'competences_count', COALESCE(comp_count_a, 0)
      );
      
      -- Construire les données tableau rang B
      rang_b_data := jsonb_build_object(
        'title', item_record.item_code || ' Rang B - Compétences approfondies', 
        'subtitle', 'Expertise et applications avancées',
        'item_number', item_record.item_num,
        'sections', COALESCE(competences_b, '[]'::jsonb),
        'competences_count', COALESCE(comp_count_b, 0)
      );
      
      -- Créer des paroles musicales à partir du contenu
      paroles_data := ARRAY[
        '[Rang A - ' || item_record.item_code || '] ' || 
        CASE 
          WHEN comp_count_a > 0 THEN 'Maîtriser ' || comp_count_a || ' compétences de base pour réussir'
          ELSE 'Connaissances fondamentales à acquérir pour réussir'
        END,
        '[Rang B - ' || item_record.item_code || '] ' || 
        CASE 
          WHEN comp_count_b > 0 THEN 'Développer ' || comp_count_b || ' expertises avancées'
          ELSE 'Expertise approfondie pour exceller'
        END
      ];
      
      -- Mettre à jour l'item EDN avec l'intégration complète
      UPDATE edn_items_immersive
      SET 
        tableau_rang_a = rang_a_data,
        tableau_rang_b = rang_b_data,
        paroles_musicales = paroles_data,
        updated_at = now()
      WHERE id = item_record.id;
      
      processed := processed + 1;
      total_integrated := total_integrated + COALESCE(comp_count_a, 0) + COALESCE(comp_count_b, 0);
      total_rang_a := total_rang_a + COALESCE(comp_count_a, 0);
      total_rang_b := total_rang_b + COALESCE(comp_count_b, 0);
      
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'item_number', item_record.item_num,
        'padded_num', padded_item_num,
        'competences_a', COALESCE(comp_count_a, 0),
        'competences_b', COALESCE(comp_count_b, 0),
        'total_competences', COALESCE(comp_count_a, 0) + COALESCE(comp_count_b, 0),
        'status', 'integrated'
      );
      
    EXCEPTION WHEN OTHERS THEN
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'error', SQLERRM,
        'status', 'error'
      );
    END;
  END LOOP;
  
  RETURN QUERY SELECT processed, total_integrated, total_rang_a, total_rang_b, result_details;
END;
$$;

-- Exécuter l'intégration corrigée
SELECT * FROM public.integrate_all_oic_competences_into_edn_items();