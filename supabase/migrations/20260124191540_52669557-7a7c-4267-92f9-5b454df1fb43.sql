-- Fix RLS policies for pwa_metrics table to allow anonymous users to insert/update metrics
-- Drop existing INSERT and UPDATE policies if they exist
DROP POLICY IF EXISTS "Allow insert for anonymous users" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Allow update for anonymous users" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Anyone can insert pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Anyone can update pwa_metrics" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_insert_anon" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_update_anon" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_insert_auth" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_update_auth" ON public.pwa_metrics;

-- Create simple permissive INSERT policy for all roles (anon + authenticated)
CREATE POLICY "pwa_metrics_insert_policy" 
ON public.pwa_metrics
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create simple permissive UPDATE policy for all roles (anon + authenticated)
CREATE POLICY "pwa_metrics_update_policy" 
ON public.pwa_metrics
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);