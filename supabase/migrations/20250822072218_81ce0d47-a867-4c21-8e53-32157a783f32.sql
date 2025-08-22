-- Enable RLS only on actual tables that need it
-- This addresses the security warning about RLS being disabled

-- Enable RLS on the backup table (this is an actual table)
ALTER TABLE public.backup_edn_items_immersive_final ENABLE ROW LEVEL SECURITY;

-- Create policy for backup table (read-only access for service role)
CREATE POLICY "Service role can read backup data"
ON public.backup_edn_items_immersive_final
FOR SELECT
USING (auth.role() = 'service_role');

-- Fix function search_path issues
-- Update all SECURITY DEFINER functions to have proper search_path
DO $$
DECLARE
    func_record RECORD;
    func_signature TEXT;
    update_count INTEGER := 0;
BEGIN
    -- Get functions that need search_path updates
    FOR func_record IN 
        SELECT 
            p.proname,
            p.oid,
            n.nspname as schema_name
        FROM pg_catalog.pg_proc p
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.prosecdef = true  -- SECURITY DEFINER functions
        AND NOT EXISTS (
            SELECT 1 FROM unnest(p.proconfig) AS config 
            WHERE config LIKE 'search_path=%'
        )
    LOOP
        BEGIN
            -- Set search_path for this function
            EXECUTE format('ALTER FUNCTION %I.%I SET search_path = %L', 
                          func_record.schema_name, 
                          func_record.proname,
                          func_record.schema_name);
            
            update_count := update_count + 1;
            RAISE NOTICE 'Updated search_path for function: %.%', func_record.schema_name, func_record.proname;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to update search_path for function %.%: %', func_record.schema_name, func_record.proname, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Updated search_path for % functions', update_count;
END $$;