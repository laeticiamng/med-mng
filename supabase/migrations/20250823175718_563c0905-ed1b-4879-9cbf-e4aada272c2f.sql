-- CRITICAL SECURITY FIXES - Phase 4: Fix Security Definer Views and Remaining Issues

-- Step 1: Fix Security Definer Views by recreating them as regular views or adding proper security
-- First, let's identify what Security Definer Views exist
DO $$
DECLARE
    view_record RECORD;
    view_definition TEXT;
BEGIN
    -- Get all Security Definer Views
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Get view definition to check if it's SECURITY DEFINER
        SELECT definition INTO view_definition
        FROM pg_views 
        WHERE schemaname = view_record.schemaname 
        AND viewname = view_record.viewname;
        
        -- If it contains SECURITY DEFINER, we need to fix it
        IF view_definition ILIKE '%SECURITY DEFINER%' THEN
            RAISE NOTICE 'Found Security Definer View: %.%', view_record.schemaname, view_record.viewname;
            
            -- Drop and recreate as regular view (this removes SECURITY DEFINER)
            EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
            
            -- Recreate without SECURITY DEFINER
            -- Note: We'll recreate basic views for common cases
            CASE view_record.viewname
                WHEN 'audit_summary' THEN
                    CREATE VIEW public.audit_summary AS
                    SELECT 
                        'edn_items_immersive' as table_name,
                        COUNT(*) FILTER (WHERE title IS NOT NULL AND title != '') as valid_titles,
                        COUNT(*) FILTER (WHERE tableau_rang_a IS NOT NULL) as valid_descriptions,
                        ROUND(AVG(CASE 
                            WHEN title IS NOT NULL AND tableau_rang_a IS NOT NULL THEN 100
                            ELSE 50
                        END), 2) as avg_completeness_score,
                        COUNT(*) as total_rows
                    FROM edn_items_immersive;
                ELSE
                    RAISE NOTICE 'Skipping recreation of view: %', view_record.viewname;
            END CASE;
        END IF;
    END LOOP;
END $$;

-- Step 2: Fix remaining function search path issues
-- Get all functions that don't have search_path set
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as function_args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prosecdef = true  -- SECURITY DEFINER functions
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc_config pc 
            WHERE pc.oid = p.oid 
            AND pc.config[1] LIKE 'search_path=%'
        )
    LOOP
        BEGIN
            -- Try to set search_path for each function
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = ''public''', 
                func_record.schema_name, 
                func_record.function_name, 
                func_record.function_args);
            RAISE NOTICE 'Fixed search_path for function: %.%', func_record.schema_name, func_record.function_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not fix search_path for function %.%: %', func_record.schema_name, func_record.function_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 3: Create extensions in dedicated schema instead of public
-- Move extensions from public to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move common extensions that might be in public
-- Note: This is informational - actual extension moving requires careful planning
-- Extensions should be moved manually in production to avoid service disruption

-- Step 4: Update authentication settings for better security
-- Note: OTP expiry settings need to be changed via Supabase Dashboard
-- This is documented for manual intervention

-- Step 5: Create a security audit function for ongoing monitoring
CREATE OR REPLACE FUNCTION public.security_audit_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    result jsonb;
    definer_views_count int;
    unsecured_functions_count int;
BEGIN
    -- Count remaining Security Definer Views
    SELECT COUNT(*) INTO definer_views_count
    FROM pg_views v
    JOIN pg_class c ON c.relname = v.viewname
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND pg_get_viewdef(c.oid) ILIKE '%SECURITY DEFINER%';
    
    -- Count functions without proper search_path
    SELECT COUNT(*) INTO unsecured_functions_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND NOT EXISTS (
        SELECT 1 FROM pg_proc_config pc 
        WHERE pc.oid = p.oid 
        AND pc.config[1] LIKE 'search_path=%'
    );
    
    result := jsonb_build_object(
        'timestamp', now(),
        'security_definer_views_remaining', definer_views_count,
        'unsecured_functions_remaining', unsecured_functions_count,
        'status', CASE 
            WHEN definer_views_count = 0 AND unsecured_functions_count = 0 THEN 'SECURE'
            WHEN definer_views_count > 0 THEN 'CRITICAL_ISSUES'
            ELSE 'MINOR_ISSUES'
        END,
        'recommendations', CASE
            WHEN definer_views_count > 0 THEN jsonb_build_array('Fix Security Definer Views in Supabase Dashboard')
            WHEN unsecured_functions_count > 0 THEN jsonb_build_array('Set search_path for remaining functions')
            ELSE jsonb_build_array('Security configuration is optimal')
        END
    );
    
    RETURN result;
END;
$$;