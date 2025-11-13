-- Create table for user sitemap data (favorites, tags, statistics)
CREATE TABLE IF NOT EXISTS public.user_sitemap_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  favorites TEXT[] DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  visit_stats JSONB DEFAULT '{}',
  navigation_paths JSONB DEFAULT '[]',
  alert_thresholds JSONB DEFAULT '{"bounceRate": 70, "avgTimeSeconds": 300}',
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sitemap_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own sitemap data"
  ON public.user_sitemap_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sitemap data"
  ON public.user_sitemap_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sitemap data"
  ON public.user_sitemap_data
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sitemap data"
  ON public.user_sitemap_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_sitemap_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_sitemap_data_updated_at
  BEFORE UPDATE ON public.user_sitemap_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_sitemap_data_updated_at();

-- Create index for faster queries
CREATE INDEX idx_user_sitemap_data_user_id ON public.user_sitemap_data(user_id);

-- Create table for user metric alerts
CREATE TABLE IF NOT EXISTS public.user_metric_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('bounce_rate', 'avg_time', 'custom')),
  metric_name TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for alerts
ALTER TABLE public.user_metric_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for alert access
CREATE POLICY "Users can view their own alerts"
  ON public.user_metric_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON public.user_metric_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.user_metric_alerts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON public.user_metric_alerts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster alert queries
CREATE INDEX idx_user_metric_alerts_user_id ON public.user_metric_alerts(user_id);
CREATE INDEX idx_user_metric_alerts_acknowledged ON public.user_metric_alerts(user_id, acknowledged);

-- Enable realtime for alerts
ALTER TABLE public.user_metric_alerts REPLICA IDENTITY FULL;