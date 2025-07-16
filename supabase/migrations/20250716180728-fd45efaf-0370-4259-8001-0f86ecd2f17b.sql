-- Mise à jour des compétences dans edn_items_complete en utilisant backup_oic_competences
UPDATE edn_items_complete 
SET 
  competences_oic_rang_a = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', description,
        'rubrique', rubrique,
        'ordre', ordre,
        'url_source', url_source,
        'date_import', date_import,
        'extraction_status', extraction_status,
        'raw_json', raw_json
      )
    )
    FROM backup_oic_competences 
    WHERE item_parent = edn_items_complete.item_code 
    AND rang = 'A'
  ),
  competences_oic_rang_b = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', description,
        'rubrique', rubrique,
        'ordre', ordre,
        'url_source', url_source,
        'date_import', date_import,
        'extraction_status', extraction_status,
        'raw_json', raw_json
      )
    )
    FROM backup_oic_competences 
    WHERE item_parent = edn_items_complete.item_code 
    AND rang = 'B'
  ),
  competences_count_rang_a = (
    SELECT count(*)::integer
    FROM backup_oic_competences 
    WHERE item_parent = edn_items_complete.item_code 
    AND rang = 'A'
  ),
  competences_count_rang_b = (
    SELECT count(*)::integer
    FROM backup_oic_competences 
    WHERE item_parent = edn_items_complete.item_code 
    AND rang = 'B'
  ),
  competences_count_total = (
    SELECT count(*)::integer
    FROM backup_oic_competences 
    WHERE item_parent = edn_items_complete.item_code
  ),
  completeness_score = (
    CASE 
      WHEN (SELECT count(*) FROM backup_oic_competences WHERE item_parent = edn_items_complete.item_code) > 0 
      THEN 100 
      ELSE 0 
    END
  ),
  updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM backup_oic_competences 
  WHERE item_parent = edn_items_complete.item_code
);