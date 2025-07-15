-- Ajouter la colonne html_raw pour stocker le HTML complet si elle n'existe pas
ALTER TABLE edn_items_uness ADD COLUMN IF NOT EXISTS html_raw text;

-- Ajouter index sur la colonne date_import pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_edn_items_uness_date_import ON edn_items_uness(date_import DESC);

-- Créer la fonction pour nettoyer les données corrompues
CREATE OR REPLACE FUNCTION clean_corrupted_edn_items()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Supprimer les items corrompus (titre "UNESS" avec rangs vides)
  DELETE FROM edn_items_uness 
  WHERE intitule = 'UNESS' 
  AND (rangs_a IS NULL OR array_length(rangs_a, 1) IS NULL OR array_length(rangs_a, 1) = 0)
  AND (rangs_b IS NULL OR array_length(rangs_b, 1) IS NULL OR array_length(rangs_b, 1) = 0);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;