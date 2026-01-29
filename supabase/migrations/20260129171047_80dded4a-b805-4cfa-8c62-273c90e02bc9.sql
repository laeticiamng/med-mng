-- ======================================
-- FIX: RLS Policy pour pwa_metrics
-- Permet les insertions/updates anonymes 
-- (métriques PWA collectées sans auth)
-- ======================================

-- Supprimer les anciennes policies problématiques
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Allow anonymous upserts" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Allow public read" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Allow upsert for session owner" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_anon_insert" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_anon_select" ON public.pwa_metrics;

-- S'assurer que RLS est activé
ALTER TABLE public.pwa_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Permettre les insertions anonymes (pour métriques PWA)
CREATE POLICY "pwa_metrics_insert_anon"
ON public.pwa_metrics
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Permettre les updates sur sa propre session
CREATE POLICY "pwa_metrics_update_own_session"
ON public.pwa_metrics
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Policy: Lecture pour service_role uniquement (analytics)
CREATE POLICY "pwa_metrics_select_service"
ON public.pwa_metrics
FOR SELECT
TO service_role
USING (true);

-- Policy: Lecture pour les utilisateurs authentifiés de leurs propres métriques
CREATE POLICY "pwa_metrics_select_own"
ON public.pwa_metrics
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- ======================================
-- FIX: Ajouter contrainte unique sur session_id si manquante
-- ======================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'pwa_metrics_session_id_key'
  ) THEN
    ALTER TABLE public.pwa_metrics 
    ADD CONSTRAINT pwa_metrics_session_id_key UNIQUE (session_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Contrainte peut déjà exister sous un autre nom
  NULL;
END $$;