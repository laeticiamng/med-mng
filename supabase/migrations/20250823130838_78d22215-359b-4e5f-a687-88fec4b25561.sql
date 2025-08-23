-- Critical Security Fix: Comprehensive RLS Policies for Medical and Personal Data

-- 1. CRITICAL: Secure Medical Data Tables
-- Ensure biovida_analyses table has proper user isolation
CREATE POLICY IF NOT EXISTS "Users can only access their own biovida analyses"
ON public.biovida_analyses FOR ALL
TO authenticated
USING (auth.uid()::text = email OR auth.uid() IN (
    SELECT id FROM auth.users WHERE email = biovida_analyses.email
))
WITH CHECK (auth.uid()::text = email OR auth.uid() IN (
    SELECT id FROM auth.users WHERE email = biovida_analyses.email
));

-- Service role access for medical data
CREATE POLICY IF NOT EXISTS "Service role can manage all biovida analyses"
ON public.biovida_analyses FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. CRITICAL: Secure Profile Data
-- Ensure profiles table exists and is properly secured
DO $$
BEGIN
    -- Check if profiles table exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email text,
            full_name text,
            role text DEFAULT 'user',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- User profile access policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Service role access for profiles
CREATE POLICY IF NOT EXISTS "Service role can manage all profiles"
ON public.profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. CRITICAL: Secure User-Generated Content Tables
-- Ensure proper isolation for user-specific data

-- Emotions table (already has some policies, but ensure they're comprehensive)
DROP POLICY IF EXISTS "Enhanced users can only access own emotions" ON public.emotions;
CREATE POLICY "Enhanced users can only access own emotions"
ON public.emotions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Chat conversations (already has policies, but ensure service role access)
CREATE POLICY IF NOT EXISTS "Service role can manage all chat conversations"
ON public.chat_conversations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Chat messages (ensure service role access)
CREATE POLICY IF NOT EXISTS "Service role can manage all chat messages"
ON public.chat_messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. CRITICAL: Secure User Activity and Logging Tables
-- Ensure user_activity_logs exists and is secured
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activity_logs') THEN
        -- Ensure RLS is enabled
        ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
        
        -- User access to own logs only
        DROP POLICY IF EXISTS "Users can view own activity logs" ON public.user_activity_logs;
        CREATE POLICY "Users can view own activity logs"
        ON public.user_activity_logs FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
        
        -- Service role access
        CREATE POLICY IF NOT EXISTS "Service role can manage all activity logs"
        ON public.user_activity_logs FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 5. CRITICAL: Secure Medical Training Data Tables
-- Ensure med_mng_* tables have proper user isolation
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
        
        -- User access policy
        EXECUTE format('
            CREATE POLICY IF NOT EXISTS "Users can access own %I records"
            ON public.%I FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id)
        ', table_name, table_name);
        
        -- Service role policy
        EXECUTE format('
            CREATE POLICY IF NOT EXISTS "Service role can manage all %I records"
            ON public.%I FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true)
        ', table_name, table_name);
    END LOOP;
END $$;

-- 6. SECURITY: Audit Log for Security Events
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

-- Only service role and admins can access security audit logs
CREATE POLICY IF NOT EXISTS "Only service role can manage security audit"
ON public.security_audit_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. SECURITY: Function to log security events
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