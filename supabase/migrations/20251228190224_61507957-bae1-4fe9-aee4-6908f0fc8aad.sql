
-- Ajouter les colonnes manquantes pour BD et Roman
ALTER TABLE public.edn_items_immersive 
ADD COLUMN IF NOT EXISTS bd_panels JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS roman_story JSONB DEFAULT NULL;

-- Ajouter des commentaires pour documentation
COMMENT ON COLUMN public.edn_items_immersive.bd_panels IS 'Panneaux de BD générés à partir des compétences OIC';
COMMENT ON COLUMN public.edn_items_immersive.roman_story IS 'Chapitres du roman narratif générés à partir des compétences OIC';

-- Créer un index pour améliorer les requêtes
CREATE INDEX IF NOT EXISTS idx_edn_items_bd_panels ON public.edn_items_immersive USING GIN (bd_panels) WHERE bd_panels IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_edn_items_roman_story ON public.edn_items_immersive USING GIN (roman_story) WHERE roman_story IS NOT NULL;
