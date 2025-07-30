-- Permettre l'accès public en lecture à backup_oic_competences
CREATE POLICY "Allow public read access to backup OIC competences" 
ON backup_oic_competences 
FOR SELECT 
USING (true);

-- Mettre à jour les items EDN avec les vraies compétences OIC
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
        'url_source', url_source
      ) ORDER BY ordre
    )
    FROM backup_oic_competences 
    WHERE item_parent = LPAD(SUBSTRING(item_code FROM 'IC-([0-9]+)')::text, 3, '0')
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
        'url_source', url_source
      ) ORDER BY ordre
    )
    FROM backup_oic_competences 
    WHERE item_parent = LPAD(SUBSTRING(item_code FROM 'IC-([0-9]+)')::text, 3, '0')
    AND rang = 'B'
  ),
  competences_count_rang_a = (
    SELECT COUNT(*)
    FROM backup_oic_competences 
    WHERE item_parent = LPAD(SUBSTRING(item_code FROM 'IC-([0-9]+)')::text, 3, '0')
    AND rang = 'A'
  ),
  competences_count_rang_b = (
    SELECT COUNT(*)
    FROM backup_oic_competences 
    WHERE item_parent = LPAD(SUBSTRING(item_code FROM 'IC-([0-9]+)')::text, 3, '0')
    AND rang = 'B'
  ),
  competences_count_total = (
    SELECT COUNT(*)
    FROM backup_oic_competences 
    WHERE item_parent = LPAD(SUBSTRING(item_code FROM 'IC-([0-9]+)')::text, 3, '0')
  ),
  updated_at = now()
WHERE item_code ~ '^IC-[0-9]+$';