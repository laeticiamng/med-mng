-- Améliorer la table d'audit pour stocker les analyses détaillées par compétence

ALTER TABLE public.edn_items_audit 
ADD COLUMN IF NOT EXISTS expected_competences_rang_a TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expected_competences_rang_b TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS incomplete_rang_a TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS incomplete_rang_b TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS competence_details JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.edn_items_audit.expected_competences_rang_a IS 'Liste des compétences rang A attendues pour cet item selon le référentiel';
COMMENT ON COLUMN public.edn_items_audit.expected_competences_rang_b IS 'Liste des compétences rang B attendues pour cet item selon le référentiel';
COMMENT ON COLUMN public.edn_items_audit.incomplete_rang_a IS 'Compétences rang A présentes mais incomplètes';
COMMENT ON COLUMN public.edn_items_audit.incomplete_rang_b IS 'Compétences rang B présentes mais incomplètes';
COMMENT ON COLUMN public.edn_items_audit.competence_details IS 'Détails de l''analyse par compétence';