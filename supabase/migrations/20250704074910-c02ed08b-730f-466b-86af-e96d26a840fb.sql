-- Création de la table pour stocker les situations de départ ECOS extraites depuis UNESS
CREATE TABLE public.ecos_situations_uness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sd_id INTEGER UNIQUE NOT NULL,
  intitule_sd TEXT NOT NULL,
  contenu_complet_html TEXT,
  competences_associees TEXT[] DEFAULT '{}',
  url_source TEXT,
  date_import TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ecos_situations_uness ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture publique
CREATE POLICY "Allow public read access to ECOS situations UNESS"
ON public.ecos_situations_uness FOR SELECT
USING (true);

-- Policy pour permettre les insertions/mises à jour via service role
CREATE POLICY "Allow service role to manage ECOS situations UNESS"
ON public.ecos_situations_uness FOR ALL
USING (true);

-- Index pour optimiser les requêtes
CREATE INDEX idx_ecos_situations_uness_sd_id ON public.ecos_situations_uness(sd_id);
CREATE INDEX idx_ecos_situations_uness_date_import ON public.ecos_situations_uness(date_import);

-- Trigger pour updated_at
CREATE TRIGGER update_ecos_situations_uness_updated_at
    BEFORE UPDATE ON public.ecos_situations_uness
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();