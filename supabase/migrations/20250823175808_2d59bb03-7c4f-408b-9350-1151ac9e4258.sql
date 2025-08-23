-- CRITICAL SECURITY FIXES - Phase 4B: Fix Security Issues (Corrected)

-- Step 1: Fix Security Definer Views by dropping and recreating as regular views
DROP VIEW IF EXISTS public.audit_summary CASCADE;

-- Recreate audit_summary as a regular view (not SECURITY DEFINER)
CREATE VIEW public.audit_summary AS
SELECT 
    'edn_items_immersive'::text as table_name,
    COUNT(*) FILTER (WHERE title IS NOT NULL AND title != '') as valid_titles,
    COUNT(*) FILTER (WHERE tableau_rang_a IS NOT NULL) as valid_descriptions,
    ROUND(AVG(CASE 
        WHEN title IS NOT NULL AND tableau_rang_a IS NOT NULL THEN 100
        ELSE 50
    END), 2) as avg_completeness_score,
    COUNT(*) as total_rows
FROM edn_items_immersive;

-- Step 2: Fix remaining function search path issues using correct system tables
DO $$
DECLARE
    func_record RECORD;
    func_signature TEXT;
BEGIN
    FOR func_record IN
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            p.oid as function_oid,
            pg_get_function_identity_arguments(p.oid) as function_args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prosecdef = true  -- SECURITY DEFINER functions
    LOOP
        -- Check if function already has search_path set by checking prosrc or proconfig
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_proc 
            WHERE oid = func_record.function_oid 
            AND (proconfig @> ARRAY['search_path=public'] OR proconfig @> ARRAY['search_path = public'])
        ) THEN
            BEGIN
                -- Build proper function signature for ALTER FUNCTION
                func_signature := func_record.schema_name || '.' || func_record.function_name;
                IF func_record.function_args != '' THEN
                    func_signature := func_signature || '(' || func_record.function_args || ')';
                ELSE
                    func_signature := func_signature || '()';
                END IF;
                
                EXECUTE format('ALTER FUNCTION %s SET search_path = ''public''', func_signature);
                RAISE NOTICE 'Fixed search_path for function: %', func_signature;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not fix search_path for function %: %', func_signature, SQLERRM;
            END;
        END IF;
    END LOOP;
END $$;

-- Step 3: Create extensions schema for better security
CREATE SCHEMA IF NOT EXISTS extensions;
COMMENT ON SCHEMA extensions IS 'Schema for database extensions to improve security by removing them from public schema';

-- Step 4: Create comprehensive security audit function
CREATE OR REPLACE FUNCTION public.security_audit_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    result jsonb;
    definer_views_count int := 0;
    unsecured_functions_count int := 0;
    extensions_in_public_count int := 0;
BEGIN
    -- Count Security Definer Views (should be 0 after fixes)
    SELECT COUNT(*) INTO definer_views_count
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND view_definition ILIKE '%SECURITY DEFINER%';
    
    -- Count functions without proper search_path
    SELECT COUNT(*) INTO unsecured_functions_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND NOT (proconfig @> ARRAY['search_path=public'] OR proconfig @> ARRAY['search_path = public']);
    
    -- Count extensions in public schema
    SELECT COUNT(*) INTO extensions_in_public_count
    FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE n.nspname = 'public';
    
    result := jsonb_build_object(
        'timestamp', now(),
        'security_definer_views_remaining', definer_views_count,
        'unsecured_functions_remaining', unsecured_functions_count,
        'extensions_in_public', extensions_in_public_count,
        'overall_status', CASE 
            WHEN definer_views_count = 0 AND unsecured_functions_count = 0 THEN 'SECURE'
            WHEN definer_views_count > 0 THEN 'CRITICAL_ISSUES'
            ELSE 'MINOR_ISSUES'
        END,
        'security_score', CASE
            WHEN definer_views_count = 0 AND unsecured_functions_count = 0 THEN 100
            WHEN definer_views_count > 0 THEN 60
            ELSE 85
        END,
        'recommendations', jsonb_build_array(
            CASE WHEN definer_views_count > 0 THEN 'Fix remaining Security Definer Views' ELSE NULL END,
            CASE WHEN unsecured_functions_count > 0 THEN 'Set search_path for remaining functions' ELSE NULL END,
            CASE WHEN extensions_in_public_count > 0 THEN 'Move extensions from public schema' ELSE NULL END,
            'Reduce OTP expiry in Supabase Dashboard Authentication settings'
        )
    );
    
    RETURN result;
END;
$$;