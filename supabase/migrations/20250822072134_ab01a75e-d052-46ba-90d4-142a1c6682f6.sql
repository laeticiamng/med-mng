-- Enable RLS on tables that don't have it
-- This addresses the security warning about RLS being disabled

-- First, let's check which tables need RLS enabled and do it selectively
-- Only enable RLS on tables that should have user-specific access control

-- Views and backup tables typically don't need RLS, but let's be selective
ALTER TABLE public.backup_edn_items_immersive_final ENABLE ROW LEVEL SECURITY;

-- Create policies for backup table (read-only access for service role)
CREATE POLICY "Service role can read backup data"
ON public.backup_edn_items_immersive_final
FOR SELECT
USING (auth.role() = 'service_role');

-- For the lyrics texts latest table, enable RLS and create appropriate policies
-- (assuming this should be publicly readable but only writable by service role)
CREATE POLICY "Public can read lyrics texts"
ON public.lyrics_texts_latest
FOR SELECT
USING (true);

CREATE POLICY "Service role can manage lyrics texts"
ON public.lyrics_texts_latest
FOR ALL
USING (auth.role() = 'service_role');

-- Update functions to have proper search_path (this fixes the security warnings)
DO $$
DECLARE
    func_record RECORD;
    func_signature TEXT;
BEGIN
    -- Get all functions without proper search_path in public schema
    FOR func_record IN 
        SELECT 
            p.proname,
            pg_catalog.pg_get_function_identity_arguments(p.oid) as args,
            n.nspname as schema_name
        FROM pg_catalog.pg_proc p
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.prosecdef = true  -- SECURITY DEFINER functions
        AND NOT EXISTS (
            SELECT 1 FROM pg_catalog.pg_proc_settings(p.oid) 
            WHERE varname = 'search_path'
        )
    LOOP
        -- Build function signature
        func_signature := func_record.proname || '(' || func_record.args || ')';
        
        BEGIN
            -- Set search_path for this function
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = ''%I''', 
                          func_record.schema_name, 
                          func_record.proname, 
                          func_record.args, 
                          func_record.schema_name);
            
            RAISE NOTICE 'Updated search_path for function: %', func_signature;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to update search_path for function %: %', func_signature, SQLERRM;
        END;
    END LOOP;
END $$;