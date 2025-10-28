-- Activer RLS sur edn_items_immersive si pas déjà fait
ALTER TABLE public.edn_items_immersive ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre la lecture publique (anon + authenticated)
CREATE POLICY "Allow public read access to edn_items_immersive"
ON public.edn_items_immersive
FOR SELECT
TO public
USING (true);

-- Vérifier aussi backup_oic_competences
ALTER TABLE public.backup_oic_competences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to backup_oic_competences"
ON public.backup_oic_competences
FOR SELECT
TO public
USING (true);

-- Vérifier edn_items_complete
ALTER TABLE public.edn_items_complete ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to edn_items_complete"
ON public.edn_items_complete
FOR SELECT
TO public
USING (true);