
-- Phase 1: Fix verification_results INSERT policy (public → service_role)
DROP POLICY IF EXISTS "Allow service role insert on verification_results" ON public.verification_results;
CREATE POLICY "Allow service role insert on verification_results"
  ON public.verification_results
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Phase 3: Consolidate pwa_metrics INSERT policies (9 → 3)
-- Drop all redundant INSERT policies
DROP POLICY IF EXISTS "Authenticated users can insert pwa metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Authenticated users can insert pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Authenticated users can insert their own pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_authenticated_insert" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_insert_anonymous" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_insert_authenticated" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_owner_insert" ON public.pwa_metrics;

-- Drop redundant SELECT policies (keep one clean set)
DROP POLICY IF EXISTS "Users can read their own pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_owner_select" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_select_policy" ON public.pwa_metrics;

-- Drop redundant UPDATE/DELETE
DROP POLICY IF EXISTS "pwa_metrics_update_policy" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_delete_policy" ON public.pwa_metrics;

-- Create 3 clean INSERT policies
CREATE POLICY "pwa_metrics_anon_insert"
  ON public.pwa_metrics
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "pwa_metrics_auth_insert"
  ON public.pwa_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create clean SELECT policy
CREATE POLICY "pwa_metrics_select"
  ON public.pwa_metrics
  FOR SELECT
  TO anon, authenticated
  USING ((user_id = auth.uid()) OR (user_id IS NULL));

-- Create clean UPDATE policy
CREATE POLICY "pwa_metrics_update"
  ON public.pwa_metrics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create clean DELETE policy
CREATE POLICY "pwa_metrics_delete"
  ON public.pwa_metrics
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
