-- Vérifier le type actuel des colonnes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'edn_items_immersive' 
AND column_name IN ('tableau_rang_a', 'tableau_rang_b');

-- Si nécessaire, convertir en JSONB
-- ALTER TABLE edn_items_immersive 
--   ALTER COLUMN tableau_rang_a TYPE jsonb USING tableau_rang_a::jsonb,
--   ALTER COLUMN tableau_rang_b TYPE jsonb USING tableau_rang_b::jsonb;