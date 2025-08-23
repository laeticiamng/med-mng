-- Critical Security Fix: Address remaining database security issues (Fixed)

-- 1. SECURITY: Create security audit log table with proper policies
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    event_type text NOT NULL,
    event_details jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access security audit logs
DROP POLICY IF EXISTS "Only service role can manage security audit" ON public.security_audit_log;
CREATE POLICY "Only service role can manage security audit"
ON public.security_audit_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. SECURITY: Function to log security events with proper search path
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type text,
    p_event_details jsonb DEFAULT '{}',
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    log_id uuid;
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        event_type,
        event_details,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        p_event_type,
        p_event_details,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- 3. SECURITY: Ensure all user-related tables have proper user isolation (Fixed variable naming)
DO $$
DECLARE
    tbl_name text;
    column_exists boolean;
BEGIN
    -- List of tables that should have user-based RLS
    FOR tbl_name IN 
        VALUES ('user_generated_music'), ('user_quotas'), ('badges'), ('buddies')
    LOOP
        -- Check if table exists and has user_id column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = tbl_name AND column_name = 'user_id'
        ) INTO column_exists;
        
        IF column_exists THEN
            -- Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            
            -- Ensure service role has full access
            EXECUTE format('DROP POLICY IF EXISTS "Service role can manage all %I" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('
                CREATE POLICY "Service role can manage all %I"
                ON public.%I FOR ALL
                TO service_role
                USING (true)
                WITH CHECK (true)
            ', tbl_name, tbl_name);
        END IF;
    END LOOP;
END $$;