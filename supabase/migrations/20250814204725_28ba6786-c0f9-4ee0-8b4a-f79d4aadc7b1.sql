-- Fonction pour nettoyer les compétences avec contenu générique LiSA
CREATE OR REPLACE FUNCTION public.clean_generic_lisa_content()
RETURNS TABLE(
  cleaned_count integer,
  affected_competences jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cleaned INTEGER := 0;
  competence_list jsonb := '[]'::jsonb;
  competence_record RECORD;
BEGIN
  -- Identifier et collecter les compétences avec contenu générique
  FOR competence_record IN
    SELECT objectif_id, description
    FROM backup_oic_competences
    WHERE description IS NOT NULL
    AND (
      description ILIKE 'Bienvenue sur LiSA EDN 2025%'
      OR description ILIKE '%Items de connaissances%Les items de connaissances (Fiche LiSA)%'
      OR description ILIKE '%La conférence des Doyens a retenu sept compétences génériques%'
      OR description ILIKE '%Consultez la charte d''utilisation de la plateforme LiSA%'
    )
  LOOP
    -- Ajouter à la liste des compétences affectées
    competence_list := competence_list || jsonb_build_object(
      'objectif_id', competence_record.objectif_id,
      'description_preview', LEFT(competence_record.description, 100)
    );
    
    cleaned := cleaned + 1;
  END LOOP;
  
  -- Nettoyer les compétences identifiées
  UPDATE backup_oic_competences
  SET 
    description = NULL,
    completion_status = NULL,
    completion_last_error = 'generic_lisa_content_detected',
    completion_updated_at = now(),
    source_etag = NULL
  WHERE description IS NOT NULL
  AND (
    description ILIKE 'Bienvenue sur LiSA EDN 2025%'
    OR description ILIKE '%Items de connaissances%Les items de connaissances (Fiche LiSA)%'
    OR description ILIKE '%La conférence des Doyens a retenu sept compétences génériques%'
    OR description ILIKE '%Consultez la charte d''utilisation de la plateforme LiSA%'
  );
  
  RETURN QUERY SELECT cleaned, competence_list;
END;
$$;

-- Fonction pour vérifier le statut des compétences corrompues
CREATE OR REPLACE FUNCTION public.count_generic_lisa_content()
RETURNS TABLE(
  total_count integer,
  sample_objectifs jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_generic INTEGER := 0;
  sample_list jsonb := '[]'::jsonb;
  competence_record RECORD;
BEGIN
  -- Compter le total
  SELECT COUNT(*)
  INTO total_generic
  FROM backup_oic_competences
  WHERE description IS NOT NULL
  AND (
    description ILIKE 'Bienvenue sur LiSA EDN 2025%'
    OR description ILIKE '%Items de connaissances%Les items de connaissances (Fiche LiSA)%'
    OR description ILIKE '%La conférence des Doyens a retenu sept compétences génériques%'
    OR description ILIKE '%Consultez la charte d''utilisation de la plateforme LiSA%'
  );
  
  -- Récupérer un échantillon
  FOR competence_record IN
    SELECT objectif_id, LEFT(description, 200) as preview
    FROM backup_oic_competences
    WHERE description IS NOT NULL
    AND (
      description ILIKE 'Bienvenue sur LiSA EDN 2025%'
      OR description ILIKE '%Items de connaissances%Les items de connaissances (Fiche LiSA)%'
      OR description ILIKE '%La conférence des Doyens a retenu sept compétences génériques%'
      OR description ILIKE '%Consultez la charte d''utilisation de la plateforme LiSA%'
    )
    LIMIT 5
  LOOP
    sample_list := sample_list || jsonb_build_object(
      'objectif_id', competence_record.objectif_id,
      'preview', competence_record.preview
    );
  END LOOP;
  
  RETURN QUERY SELECT total_generic, sample_list;
END;
$$;