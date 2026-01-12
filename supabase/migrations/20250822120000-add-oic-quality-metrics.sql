CREATE TABLE IF NOT EXISTS public.oic_quality_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  batch_number INTEGER NOT NULL,
  total_pages INTEGER NOT NULL,
  parsed_items INTEGER NOT NULL,
  saved_items INTEGER NOT NULL,
  critical_anomalies INTEGER NOT NULL,
  warning_anomalies INTEGER NOT NULL,
  parse_failures INTEGER NOT NULL,
  quality_score NUMERIC(5,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oic_quality_metrics_session ON public.oic_quality_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_oic_quality_metrics_created_at ON public.oic_quality_metrics(created_at DESC);

ALTER TABLE public.oic_quality_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages oic_quality_metrics" ON public.oic_quality_metrics;
CREATE POLICY "Service role manages oic_quality_metrics"
ON public.oic_quality_metrics FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
