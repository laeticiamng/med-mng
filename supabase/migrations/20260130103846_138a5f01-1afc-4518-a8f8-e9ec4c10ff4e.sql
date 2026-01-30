-- Fix RLS policies for pwa_metrics to include anon role in SELECT policy
-- The upsert operation requires SELECT access to check for conflicts

-- Drop and recreate SELECT policy to include anon role
DROP POLICY IF EXISTS "pwa_metrics_select_policy" ON public.pwa_metrics;

CREATE POLICY "pwa_metrics_select_policy"
ON public.pwa_metrics
FOR SELECT
TO anon, authenticated
USING (
  (user_id = auth.uid()) OR 
  (user_id IS NULL)
);

-- Also update DELETE policy to be consistent (only authenticated users who own the record can delete)
-- This is already correct, no changes needed for delete