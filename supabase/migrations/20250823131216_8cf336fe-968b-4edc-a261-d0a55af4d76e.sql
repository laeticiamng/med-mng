-- Critical Security Fix: Address remaining database security issues

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

-- 2. SECURITY: Secure remaining medical training tables
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_name LIKE 'med_mng_%'
        AND EXISTS (
            SELECT 1 FROM information_schema.columns c 
            WHERE c.table_name = t.table_name 
            AND c.column_name = 'user_id'
        )
    LOOP
        -- Enable RLS on table
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        
        -- Drop existing policies and create new ones
        EXECUTE format('DROP POLICY IF EXISTS "Users can access own %I records" ON public.%I', table_name, table_name);
        EXECUTE format('
            CREATE POLICY "Users can access own %I records"
            ON public.%I FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id)
        ', table_name, table_name);
        
        -- Service role policy
        EXECUTE format('DROP POLICY IF EXISTS "Service role can manage all %I records" ON public.%I', table_name, table_name);
        EXECUTE format('
            CREATE POLICY "Service role can manage all %I records"
            ON public.%I FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true)
        ', table_name, table_name);
    END LOOP;
END $$;

-- 3. SECURITY: Function to log security events with proper search path
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

-- 4. SECURITY: Ensure all user-related tables have proper user isolation
DO $$
DECLARE
    table_name text;
    column_exists boolean;
BEGIN
    -- List of tables that should have user-based RLS
    FOR table_name IN 
        VALUES ('user_generated_music'), ('user_quotas'), ('badges'), ('buddies')
    LOOP
        -- Check if table exists and has user_id column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = table_name AND column_name = 'user_id'
        ) INTO column_exists;
        
        IF column_exists THEN
            -- Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
            
            -- Ensure service role has full access
            EXECUTE format('DROP POLICY IF EXISTS "Service role can manage all %I" ON public.%I', table_name, table_name);
            EXECUTE format('
                CREATE POLICY "Service role can manage all %I"
                ON public.%I FOR ALL
                TO service_role
                USING (true)
                WITH CHECK (true)
            ', table_name, table_name);
        END IF;
    END LOOP;
END $$;