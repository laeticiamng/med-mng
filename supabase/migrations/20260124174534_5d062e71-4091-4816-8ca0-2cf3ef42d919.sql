-- Fix pwa_metrics: Add missing INSERT policy for anonymous access
-- This table tracks anonymous PWA metrics for analytics

CREATE POLICY "pwa_metrics_insert_anon" ON pwa_metrics
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Also add UPDATE for session updates
CREATE POLICY "pwa_metrics_update_own" ON pwa_metrics
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);