-- Supprimer TOUTES les politiques existantes sur pwa_metrics
DROP POLICY IF EXISTS "Admins can view all pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Allow anonymous insert on pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Allow anonymous update on pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Allow read own metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Service role manages pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Users can insert own pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Users can view own pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_select_own" ON public.pwa_metrics;

-- Recréer des politiques simples et permissives pour le rôle anon
CREATE POLICY "pwa_metrics_anon_insert" 
ON public.pwa_metrics 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "pwa_metrics_anon_update" 
ON public.pwa_metrics 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "pwa_metrics_anon_select" 
ON public.pwa_metrics 
FOR SELECT 
TO anon, authenticated
USING (true);