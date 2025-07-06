-- Convertir en JSONB si nécessaire
ALTER TABLE edn_items_immersive 
  ALTER COLUMN tableau_rang_a TYPE jsonb USING tableau_rang_a::jsonb,
  ALTER COLUMN tableau_rang_b TYPE jsonb USING tableau_rang_b::jsonb;