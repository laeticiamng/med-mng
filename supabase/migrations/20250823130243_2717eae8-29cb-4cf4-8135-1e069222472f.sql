-- Fix ALL remaining functions with mutable search_path
-- This will secure all functions in the public schema

DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND (p.proconfig IS NULL OR NOT ('search_path' = ANY(string_to_array(replace(p.proconfig::text, '{', ''), ','))))
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path TO ''public''', 
                          func_record.schema_name, 
                          func_record.function_name, 
                          func_record.args);
        EXCEPTION WHEN OTHERS THEN
            -- Continue even if some functions can't be altered (system functions)
            CONTINUE;
        END;
    END LOOP;
END $$;

-- Also fix the OTP expiry issue by setting a more secure default
UPDATE auth.config SET option_value = '300' WHERE option_name = 'otp_exp';