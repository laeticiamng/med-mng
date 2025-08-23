-- Critical Security Fix: Comprehensive RLS Policies for Medical and Personal Data
-- Fix syntax by properly dropping and recreating policies

-- 1. CRITICAL: Secure Medical Data Tables
-- Drop existing policies first, then recreate
DO $$
BEGIN
    -- Drop existing biovida_analyses policies if they exist
    DROP POLICY IF EXISTS "Users can only access their own biovida analyses" ON public.biovida_analyses;
    DROP POLICY IF EXISTS "Service role can manage all biovida analyses" ON public.biovida_analyses;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Continue if policies don't exist
END $$;

-- Create secure policies for biovida_analyses
CREATE POLICY "Users can only access their own biovida analyses"
ON public.biovida_analyses FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = biovida_analyses.email))
WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE email = biovida_analyses.email));

CREATE POLICY "Service role can manage all biovida analyses"
ON public.biovida_analyses FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. CRITICAL: Create and Secure Profile Data
-- Ensure profiles table exists and is properly secured
DO $$
BEGIN
    -- Check if profiles table exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
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

-- Drop and recreate profile policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
ON public.profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. CRITICAL: Enhance Emotions table security
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enhanced users can only access own emotions" ON public.emotions;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE POLICY "Enhanced users can only access own emotions"
ON public.emotions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add service role access to emotions
DO $$
BEGIN
    DROP POLICY IF EXISTS "Service role can manage all emotions" ON public.emotions;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE POLICY "Service role can manage all emotions"
ON public.emotions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. CRITICAL: Secure Chat tables with service role access
DO $$
BEGIN
    DROP POLICY IF EXISTS "Service role can manage all chat conversations" ON public.chat_conversations;
    DROP POLICY IF EXISTS "Service role can manage all chat messages" ON public.chat_messages;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE POLICY "Service role can manage all chat conversations"
ON public.chat_conversations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage all chat messages"
ON public.chat_messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. SECURITY: Create Security Audit Log
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

-- Secure audit log - only service role can access
DO $$
BEGIN
    DROP POLICY IF EXISTS "Only service role can manage security audit" ON public.security_audit_log;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE POLICY "Only service role can manage security audit"
ON public.security_audit_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. SECURITY: Function to log security events
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