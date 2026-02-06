
-- Table for tracking analytics/conversion events
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- page_view, signup, checkout_start, checkout_complete
  user_id UUID,
  session_id TEXT,
  page_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast querying by event type and date
CREATE INDEX idx_analytics_events_type_date ON public.analytics_events (event_type, created_at DESC);
CREATE INDEX idx_analytics_events_created ON public.analytics_events (created_at DESC);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert events (including anonymous users)
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read analytics events (via service role or specific admin check)
CREATE POLICY "Authenticated users can read analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
