-- Enrichir la structure OIC pour avoir le même niveau de détail que LiSA
-- Ajouter les colonnes manquantes pour stocker le contenu détaillé

ALTER TABLE oic_competences 
ADD COLUMN IF NOT EXISTS sommaire TEXT,
ADD COLUMN IF NOT EXISTS mecanismes TEXT,
ADD COLUMN IF NOT EXISTS indications TEXT,
ADD COLUMN IF NOT EXISTS effets_indesirables TEXT,
ADD COLUMN IF NOT EXISTS interactions TEXT,
ADD COLUMN IF NOT EXISTS modalites_surveillance TEXT,
ADD COLUMN IF NOT EXISTS causes_echec TEXT,
ADD COLUMN IF NOT EXISTS contributeurs TEXT,
ADD COLUMN IF NOT EXISTS ordre_affichage INTEGER,
ADD COLUMN IF NOT EXISTS contenu_detaille JSONB,
ADD COLUMN IF NOT EXISTS titre_complet TEXT,
ADD COLUMN IF NOT EXISTS sections_detaillees JSONB;