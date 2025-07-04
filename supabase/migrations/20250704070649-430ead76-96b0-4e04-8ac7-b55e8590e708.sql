-- Création de la table pour stocker les items EDN extraits depuis UNESS
CREATE TABLE public.edn_items_uness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id INTEGER UNIQUE NOT NULL,
  intitule TEXT NOT NULL,
  rangs_a TEXT[] DEFAULT '{}',
  rangs_b TEXT[] DEFAULT '{}',
  contenu_complet_html TEXT,
  date_import TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.edn_items_uness ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture publique
CREATE POLICY "Allow public read access to EDN UNESS items"
ON public.edn_items_uness FOR SELECT
USING (true);

-- Policy pour permettre les insertions/mises à jour via service role
CREATE POLICY "Allow service role to manage EDN UNESS items"
ON public.edn_items_uness FOR ALL
USING (true);

-- Index pour optimiser les requêtes
CREATE INDEX idx_edn_items_uness_item_id ON public.edn_items_uness(item_id);
CREATE INDEX idx_edn_items_uness_date_import ON public.edn_items_uness(date_import);

-- Trigger pour updated_at
CREATE TRIGGER update_edn_items_uness_updated_at
    BEFORE UPDATE ON public.edn_items_uness
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();