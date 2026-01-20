-- Supprimer les anciennes politiques RLS
DROP POLICY IF EXISTS "Users can view their own metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Users can insert their own metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Users can update their own metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Anyone can insert PWA metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Anyone can view PWA metrics" ON public.pwa_metrics;

-- Créer des politiques permissives pour le tracking PWA (anonyme ou authentifié)
CREATE POLICY "Allow anonymous insert on pwa_metrics" 
ON public.pwa_metrics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anonymous update on pwa_metrics" 
ON public.pwa_metrics 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow read own metrics" 
ON public.pwa_metrics 
FOR SELECT 
USING (true);