-- Désactiver temporairement RLS pour nettoyer
ALTER TABLE public.pwa_metrics DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'pwa_metrics' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.pwa_metrics', pol_name);
    END LOOP;
END $$;

-- Réactiver RLS
ALTER TABLE public.pwa_metrics ENABLE ROW LEVEL SECURITY;

-- Créer UNE SEULE politique permissive pour tous les accès anonymes
CREATE POLICY "pwa_metrics_public_all"
ON public.pwa_metrics
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);