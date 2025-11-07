-- Create security monitoring tables

-- Table for security corrections history
CREATE TABLE IF NOT EXISTS public.security_corrections_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correction_type TEXT NOT NULL, -- 'function_search_path', 'security_definer_view', 'rls_policy', etc.
  table_or_function_name TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  correction_applied TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  before_state JSONB,
  after_state JSONB,
  applied_by UUID REFERENCES auth.users(id),
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  migration_file TEXT,
  notes TEXT
);

-- Table for security alerts
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'new_vulnerability', 'rls_missing', 'function_unsafe', etc.
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_resource TEXT, -- table/function name
  recommendation TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB
);

-- Table for security metrics snapshots
CREATE TABLE IF NOT EXISTS public.security_metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_tables INTEGER NOT NULL,
  tables_with_rls INTEGER NOT NULL,
  total_policies INTEGER NOT NULL,
  total_functions INTEGER NOT NULL,
  functions_with_search_path INTEGER NOT NULL,
  security_score NUMERIC(5,2) NOT NULL,
  linter_issues JSONB, -- Store full linter output
  critical_issues INTEGER NOT NULL DEFAULT 0,
  high_issues INTEGER NOT NULL DEFAULT 0,
  medium_issues INTEGER NOT NULL DEFAULT 0,
  low_issues INTEGER NOT NULL DEFAULT 0,
  info_issues INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.security_corrections_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_metrics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated users can read, service role can write
CREATE POLICY "Authenticated users can view security corrections"
ON public.security_corrections_history
FOR SELECT
USING (true);

CREATE POLICY "Service role can insert security corrections"
ON public.security_corrections_history
FOR INSERT
WITH CHECK (false); -- Only service role can insert

CREATE POLICY "Authenticated users can view security alerts"
ON public.security_alerts
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can update alert status"
ON public.security_alerts
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage security alerts"
ON public.security_alerts
FOR ALL
USING (false)
WITH CHECK (false);

CREATE POLICY "Authenticated users can view security metrics"
ON public.security_metrics_snapshots
FOR SELECT
USING (true);

CREATE POLICY "Service role can insert security metrics"
ON public.security_metrics_snapshots
FOR INSERT
WITH CHECK (false);

-- Indexes for performance
CREATE INDEX idx_security_corrections_date ON public.security_corrections_history(applied_at DESC);
CREATE INDEX idx_security_corrections_type ON public.security_corrections_history(correction_type);
CREATE INDEX idx_security_alerts_status ON public.security_alerts(status);
CREATE INDEX idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX idx_security_alerts_created ON public.security_alerts(created_at DESC);
CREATE INDEX idx_security_metrics_date ON public.security_metrics_snapshots(recorded_at DESC);

-- Grants
GRANT SELECT ON public.security_corrections_history TO authenticated;
GRANT SELECT ON public.security_alerts TO authenticated;
GRANT SELECT, UPDATE ON public.security_alerts TO authenticated;
GRANT SELECT ON public.security_metrics_snapshots TO authenticated;
GRANT ALL ON public.security_corrections_history TO service_role;
GRANT ALL ON public.security_alerts TO service_role;
GRANT ALL ON public.security_metrics_snapshots TO service_role;

-- Comments
COMMENT ON TABLE public.security_corrections_history IS 'Historical record of all security corrections applied to the database';
COMMENT ON TABLE public.security_alerts IS 'Active security alerts requiring attention';
COMMENT ON TABLE public.security_metrics_snapshots IS 'Point-in-time snapshots of security metrics for trending';

-- Insert initial corrections history (documentation of what we've done)
INSERT INTO public.security_corrections_history (
  correction_type,
  table_or_function_name,
  issue_description,
  correction_applied,
  severity,
  notes,
  applied_at
) VALUES
  ('security_definer_view', 'med_mng_view_library', 'View using SECURITY DEFINER allowing privilege escalation', 'Converted to SECURITY INVOKER', 'critical', 'Migration 2025-11-07', now() - interval '2 hours'),
  ('security_definer_view', 'profiles_public', 'View using SECURITY DEFINER allowing privilege escalation', 'Converted to SECURITY INVOKER', 'critical', 'Migration 2025-11-07', now() - interval '2 hours'),
  ('function_search_path', 'calculate_risk_score', 'Function without SET search_path vulnerable to injection', 'Added SET search_path = public', 'medium', 'Migration 2025-11-07', now() - interval '1 hour'),
  ('function_search_path', 'get_violation_stats', 'Function without SET search_path vulnerable to injection', 'Added SET search_path = public', 'medium', 'Migration 2025-11-07', now() - interval '1 hour'),
  ('rls_policy', 'dsar_approvals', 'Table with RLS enabled but no policies defined', 'Added 3 RLS policies for approver isolation', 'info', 'Migration 2025-11-07', now() - interval '30 minutes');
