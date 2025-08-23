-- Finalize security optimizations with RLS policies and indexes

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_item_code ON edn_items_complete(item_code);
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_theme ON edn_items_complete(theme);
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_created_at ON edn_items_complete(created_at);

-- Add optimized RLS policies with better performance
DROP POLICY IF EXISTS "Enable read access for all users" ON edn_items_complete;
CREATE POLICY "optimized_read_access" ON edn_items_complete
  FOR SELECT USING (true);

-- Add audit table for tracking changes
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for audit_log access
CREATE POLICY "audit_log_access" ON public.audit_log
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Add performance monitoring function
CREATE OR REPLACE FUNCTION public.log_slow_queries()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'SELECT' AND extract(epoch from now() - statement_timestamp()) > 1 THEN
    INSERT INTO public.audit_log (table_name, operation, new_data)
    VALUES (TG_TABLE_NAME, 'SLOW_QUERY', jsonb_build_object('duration', extract(epoch from now() - statement_timestamp())));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;