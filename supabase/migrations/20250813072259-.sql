-- Ajout des colonnes de traçabilité pour la complétion OIC
ALTER TABLE public.backup_oic_competences
ADD COLUMN IF NOT EXISTS completion_status text,
ADD COLUMN IF NOT EXISTS completion_last_http int,
ADD COLUMN IF NOT EXISTS completion_last_error text,
ADD COLUMN IF NOT EXISTS completion_updated_at timestamptz,
ADD COLUMN IF NOT EXISTS source_etag text;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_oic_objectif_id
ON public.backup_oic_competences (objectif_id);

CREATE INDEX IF NOT EXISTS idx_oic_completion_status
ON public.backup_oic_competences (completion_status);