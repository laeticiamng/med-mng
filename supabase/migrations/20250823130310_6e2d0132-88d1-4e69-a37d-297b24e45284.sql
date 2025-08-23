-- Fix ALL remaining functions with mutable search_path (retry without auth config)
-- This will secure all functions in the public schema

DO $$
DECLARE
    func_record RECORD;
    func_count INTEGER := 0;
BEGIN
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND (p.proconfig IS NULL OR NOT (p.proconfig::text LIKE '%search_path%'))
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path TO ''public''', 
                          func_record.schema_name, 
                          func_record.function_name, 
                          func_record.args);
            func_count := func_count + 1;
        EXCEPTION WHEN OTHERS THEN
            -- Continue even if some functions can't be altered (system functions)
            CONTINUE;
        END;
    END LOOP;
    
    RAISE NOTICE 'Updated search_path for % functions', func_count;
END $$;