-- Allow anonymous users to insert PWA metrics (for analytics without login)
DROP POLICY IF EXISTS "pwa_metrics_owner_insert" ON public.pwa_metrics;

-- Create a new policy that allows both anonymous and authenticated users to insert
-- Anonymous users can insert with null user_id
-- Authenticated users must match their own user_id
CREATE POLICY "pwa_metrics_anon_or_owner_insert" ON public.pwa_metrics
FOR INSERT
TO public
WITH CHECK (
  -- Anonymous users can insert with null user_id
  (auth.uid() IS NULL AND user_id IS NULL)
  OR
  -- Authenticated users must match their user_id
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

COMMENT ON POLICY "pwa_metrics_anon_or_owner_insert" ON public.pwa_metrics 
IS 'Allows PWA metrics insertion for both anonymous (null user_id) and authenticated users (matching user_id)';