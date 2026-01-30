-- Fix RLS policy for pwa_metrics to allow anonymous users to update their own metrics via session_id
-- The current UPDATE policy requires user_id = auth.uid() but anonymous users have auth.uid() = NULL
-- and they insert with user_id = NULL, so the update fails.

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "pwa_metrics_update_policy" ON public.pwa_metrics;

-- Create new UPDATE policy that allows:
-- 1. Authenticated users to update rows where user_id = auth.uid()
-- 2. Anonymous users (auth.uid() IS NULL) to update rows where user_id IS NULL
-- The session_id constraint is handled by the frontend (upsert on session_id conflict)
CREATE POLICY "pwa_metrics_update_policy" 
ON public.pwa_metrics
FOR UPDATE
TO anon, authenticated
USING (
  (user_id = auth.uid()) OR 
  (user_id IS NULL AND auth.uid() IS NULL)
)
WITH CHECK (
  (user_id = auth.uid()) OR 
  (user_id IS NULL AND auth.uid() IS NULL)
);