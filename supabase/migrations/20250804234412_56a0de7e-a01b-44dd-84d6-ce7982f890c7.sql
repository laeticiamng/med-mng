-- Ajouter les colonnes pour les trois versions de paroles si elles n'existent pas
ALTER TABLE edn_items_complete 
ADD COLUMN IF NOT EXISTS paroles_rang_a text[],
ADD COLUMN IF NOT EXISTS paroles_rang_b text[],
ADD COLUMN IF NOT EXISTS paroles_rang_ab text[];