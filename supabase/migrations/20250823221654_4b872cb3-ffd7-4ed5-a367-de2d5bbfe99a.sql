-- Correction des indexes avec les vraies colonnes
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_item_code ON edn_items_complete(item_code);
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_title ON edn_items_complete(title);
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_created_at ON edn_items_complete(created_at);

-- Optimisation des RLS policies
DROP POLICY IF EXISTS "optimized_read_access" ON edn_items_complete;
CREATE POLICY "public_read_access" ON edn_items_complete
  FOR SELECT USING (true);

-- Audit table pour tracking des performances
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  url TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);