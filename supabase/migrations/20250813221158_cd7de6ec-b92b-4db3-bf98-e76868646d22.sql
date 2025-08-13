-- Migration corrigée pour ajouter les colonnes de traçabilité OIC
-- Supprimer la vue existante si elle existe
DROP VIEW IF EXISTS public.oic_completion_dashboard;

-- Ajouter les colonnes de traçabilité
ALTER TABLE public.backup_oic_competences
ADD COLUMN IF NOT EXISTS completion_status text,            -- 'updated' | 'skipped_empty' | 'skipped_error'
ADD COLUMN IF NOT EXISTS completion_last_http int,
ADD COLUMN IF NOT EXISTS completion_last_error text,
ADD COLUMN IF NOT EXISTS completion_updated_at timestamptz,
ADD COLUMN IF NOT EXISTS source_etag text;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_oic_objectif_id
  ON public.backup_oic_competences (objectif_id);

CREATE INDEX IF NOT EXISTS idx_oic_completion_status
  ON public.backup_oic_competences (completion_status);

-- Recréer la vue de monitoring
CREATE OR REPLACE VIEW public.oic_completion_dashboard AS
SELECT
  count(*)                                                 AS total,
  count(*) FILTER (WHERE completion_status='updated')       AS nb_updated,
  count(*) FILTER (WHERE completion_status='skipped_empty') AS nb_empty,
  count(*) FILTER (WHERE completion_status='skipped_error') AS nb_error
FROM public.backup_oic_competences;