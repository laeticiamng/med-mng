-- Migration corrective COMPLÈTE pour tous les 367 items EDN
-- Utilise UNIQUEMENT les vraies compétences OIC, rien d'autre

CREATE OR REPLACE FUNCTION fix_all_edn_items_complete_oic_correction()
RETURNS TABLE(fixed_count integer, errors_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  fixed INTEGER := 0;
  errors INTEGER := 0;
  item_num INTEGER;
  padded_item_code TEXT;
  real_rang_a JSONB;
  real_rang_b JSONB;
  competences_rang_a JSONB := '[]'::jsonb;
  competences_rang_b JSONB := '[]'::jsonb;
  comp_record RECORD;
  result_details JSONB := '[]'::jsonb;
  count_a INTEGER := 0;
  count_b INTEGER := 0;
BEGIN
  -- Traitement pour TOUS les 367 items EDN
  FOR item_record IN SELECT id, item_code, title FROM edn_items_immersive ORDER BY item_code LOOP
    BEGIN
      -- Extraire le numéro d'item (IC-1 -> 1, IC-29 -> 29, etc.)
      item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
      
      -- Créer le code paddé pour la recherche (1 -> 001, 29 -> 029, etc.)
      padded_item_code := LPAD(item_num::TEXT, 3, '0');
      
      -- Réinitialiser les compétences
      competences_rang_a := '[]'::jsonb;
      competences_rang_b := '[]'::jsonb;
      count_a := 0;
      count_b := 0;
      
      -- Récupérer les compétences Rang A RÉELLES de la table oic_competences
      FOR comp_record IN 
        SELECT intitule, description 
        FROM oic_competences 
        WHERE item_parent = padded_item_code AND rang = 'A'
        ORDER BY objectif_id
      LOOP
        competences_rang_a := competences_rang_a || jsonb_build_object(
          'intitule', comp_record.intitule,
          'description', COALESCE(comp_record.description, '')
        );
        count_a := count_a + 1;
      END LOOP;
      
      -- Récupérer les compétences Rang B RÉELLES de la table oic_competences
      FOR comp_record IN 
        SELECT intitule, description 
        FROM oic_competences 
        WHERE item_parent = padded_item_code AND rang = 'B'
        ORDER BY objectif_id
      LOOP
        competences_rang_b := competences_rang_b || jsonb_build_object(
          'intitule', comp_record.intitule,
          'description', COALESCE(comp_record.description, '')
        );
        count_b := count_b + 1;
      END LOOP;
      
      -- Créer le tableau Rang A selon les compétences réellement disponibles
      IF count_a > 0 THEN
        real_rang_a := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - Compétences OIC officielles',
          'competences', competences_rang_a,
          'count', count_a,
          'theme', 'Compétences OIC officielles extraites pour ' || item_record.item_code
        );
      ELSE
        -- Aucune compétence OIC Rang A trouvée
        real_rang_a := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - Aucune compétence OIC disponible',
          'competences', '[]'::jsonb,
          'count', 0,
          'theme', 'Aucune compétence OIC Rang A disponible pour ' || item_record.item_code
        );
      END IF;
      
      -- Créer le tableau Rang B selon les compétences réellement disponibles
      IF count_b > 0 THEN
        real_rang_b := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - Compétences OIC officielles avancées',
          'competences', competences_rang_b,
          'count', count_b,
          'theme', 'Compétences OIC officielles avancées pour ' || item_record.item_code
        );
      ELSE
        -- Aucune compétence OIC Rang B trouvée
        real_rang_b := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - Aucune compétence OIC disponible',
          'competences', '[]'::jsonb,
          'count', 0,
          'theme', 'Aucune compétence OIC Rang B disponible pour ' || item_record.item_code
        );
      END IF;
      
      -- Mettre à jour l'item avec UNIQUEMENT les vraies compétences OIC
      UPDATE edn_items_immersive 
      SET 
        tableau_rang_a = real_rang_a,
        tableau_rang_b = real_rang_b,
        -- Mettre à jour aussi les paroles pour correspondre aux vraies compétences
        paroles_musicales = CASE 
          WHEN count_a > 0 OR count_b > 0 THEN 
            ARRAY[
              '[' || item_record.item_code || ' Rang A - ' || count_a || ' compétences OIC] Voici les compétences officielles à maîtriser',
              '[' || item_record.item_code || ' Rang B - ' || count_b || ' compétences OIC] Expertise avancée selon le référentiel officiel'
            ]
          ELSE 
            ARRAY[
              '[' || item_record.item_code || '] Item sans compétences OIC définies actuellement',
              '[' || item_record.item_code || ' - En attente] Compétences à définir selon le référentiel'
            ]
        END,
        updated_at = now()
      WHERE id = item_record.id;
      
      fixed := fixed + 1;
      
      -- Ajouter aux détails
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'padded_code', padded_item_code,
        'rang_a_count', count_a,
        'rang_b_count', count_b,
        'status', CASE 
          WHEN count_a > 0 OR count_b > 0 THEN 'updated_with_real_oic_competences'
          ELSE 'updated_with_no_oic_competences_found'
        END
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

-- Exécuter la correction complète
SELECT * FROM fix_all_edn_items_complete_oic_correction();