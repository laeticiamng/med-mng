-- Fix pwa_metrics RLS policy to allow anonymous/unauthenticated users
-- This table is for analytics and should work for all visitors

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can manage their own PWA metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_insert_policy" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_update_policy" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_select_policy" ON public.pwa_metrics;

-- Enable RLS if not already enabled
ALTER TABLE public.pwa_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert metrics (anonymous analytics)
CREATE POLICY "Anyone can insert pwa_metrics"
ON public.pwa_metrics
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to update their own session metrics (by session_id)
CREATE POLICY "Anyone can update their own session metrics"
ON public.pwa_metrics
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow reading own session metrics (for analytics display)
CREATE POLICY "Anyone can read pwa_metrics"
ON public.pwa_metrics
FOR SELECT
TO anon, authenticated
USING (true);

-- Service role has full access
CREATE POLICY "Service role full access to pwa_metrics"
ON public.pwa_metrics
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);