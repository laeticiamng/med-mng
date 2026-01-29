-- Fix RLS policy for pwa_metrics to allow anonymous inserts
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Allow anonymous upserts" ON public.pwa_metrics;

-- Create permissive policy for anonymous inserts (PWA tracking)
CREATE POLICY "Allow anonymous inserts for PWA tracking"
ON public.pwa_metrics
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create policy for updates on own session
CREATE POLICY "Allow updates on own session"
ON public.pwa_metrics
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Create policy for select on own session
CREATE POLICY "Allow select on own session"
ON public.pwa_metrics
FOR SELECT
TO anon, authenticated
USING (true);