
-- Nettoyer les policies dupliquées sur pwa_metrics et garder une structure simple et fonctionnelle
DROP POLICY IF EXISTS "Anonymous can insert anonymous pwa metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Authenticated users can view all pwa metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Users can insert own pwa metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Users can view own pwa metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_secure_delete" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_secure_insert" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_secure_select" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_secure_update" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_service_role_all" ON public.pwa_metrics;

-- Policy unifiée pour INSERT - permet anon avec user_id NULL et auth avec leur ID
CREATE POLICY "pwa_metrics_insert_policy" ON public.pwa_metrics
FOR INSERT TO anon, authenticated
WITH CHECK (
  (user_id IS NULL) OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- Policy pour SELECT - auth peut voir ses propres métriques + celles anonymes
CREATE POLICY "pwa_metrics_select_policy" ON public.pwa_metrics
FOR SELECT TO authenticated
USING ((user_id = auth.uid()) OR (user_id IS NULL));

-- Policy pour UPDATE - seulement ses propres métriques
CREATE POLICY "pwa_metrics_update_policy" ON public.pwa_metrics
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy pour DELETE - seulement ses propres métriques
CREATE POLICY "pwa_metrics_delete_policy" ON public.pwa_metrics
FOR DELETE TO authenticated
USING (user_id = auth.uid());
