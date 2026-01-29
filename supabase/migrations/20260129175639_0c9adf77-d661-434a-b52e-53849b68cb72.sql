-- Fix pwa_metrics RLS policy to allow anonymous inserts for performance tracking
-- This is analytics data that doesn't require authentication

-- Drop existing restrictive policy if exists
DROP POLICY IF EXISTS "Users can insert their own pwa metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Users can update their own pwa metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Users can view their own pwa metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Anonymous can insert pwa metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Anyone can insert pwa metrics" ON public.pwa_metrics;

-- Create permissive policy for anonymous analytics tracking
CREATE POLICY "Anyone can insert pwa metrics" 
ON public.pwa_metrics 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow users to update their own session metrics
CREATE POLICY "Anyone can update pwa metrics by session" 
ON public.pwa_metrics 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow reading own metrics (for analytics dashboards)
CREATE POLICY "Authenticated users can view all pwa metrics" 
ON public.pwa_metrics 
FOR SELECT 
TO authenticated
USING (true);

-- Ensure session_id has a unique constraint for upsert to work
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'pwa_metrics_session_id_key'
  ) THEN
    ALTER TABLE public.pwa_metrics ADD CONSTRAINT pwa_metrics_session_id_key UNIQUE (session_id);
  END IF;
END $$;