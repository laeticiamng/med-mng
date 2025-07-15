-- Nettoyer les données corrompues (items vides avec titre "UNESS")
DELETE FROM edn_items_uness 
WHERE intitule = 'UNESS' 
AND (rangs_a IS NULL OR array_length(rangs_a, 1) IS NULL OR array_length(rangs_a, 1) = 0)
AND (rangs_b IS NULL OR array_length(rangs_b, 1) IS NULL OR array_length(rangs_b, 1) = 0);

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_edn_items_uness_date_import ON edn_items_uness(date_import DESC);

-- Ajouter une contrainte pour éviter les doublons sur upsert
ALTER TABLE edn_items_uness DROP CONSTRAINT IF EXISTS edn_items_uness_item_id_key;
ALTER TABLE edn_items_uness ADD CONSTRAINT edn_items_uness_item_id_unique UNIQUE (item_id);