-- Final Security Configuration and Audit Logging

-- 1. SECURITY: Add comprehensive security audit logging function
CREATE OR REPLACE FUNCTION public.log_security_audit(
    p_event_type text,
    p_severity text DEFAULT 'INFO',
    p_details jsonb DEFAULT '{}',
    p_resource_type text DEFAULT NULL,
    p_resource_id text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    audit_id uuid;
    current_user_id uuid;
BEGIN
    -- Get current user safely
    current_user_id := auth.uid();
    
    -- Insert security audit record
    INSERT INTO public.security_audit_log (
        user_id,
        event_type,
        event_details,
        ip_address,
        created_at
    ) VALUES (
        current_user_id,
        p_event_type,
        jsonb_build_object(
            'severity', p_severity,
            'details', p_details,
            'resource_type', p_resource_type,
            'resource_id', p_resource_id,
            'timestamp', now()
        ),
        inet_client_addr(),
        now()
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$;

-- 2. SECURITY: Create security monitoring triggers for critical tables
-- Trigger for profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        PERFORM public.log_security_audit(
            'PROFILE_UPDATE',
            'MEDIUM',
            jsonb_build_object(
                'old_data', to_jsonb(OLD),
                'new_data', to_jsonb(NEW),
                'changed_fields', (
                    SELECT jsonb_object_agg(key, value)
                    FROM jsonb_each(to_jsonb(NEW))
                    WHERE value != COALESCE(to_jsonb(OLD)->key, 'null'::jsonb)
                )
            ),
            'profiles',
            NEW.id::text
        );
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM public.log_security_audit(
            'PROFILE_CREATE',
            'INFO',
            jsonb_build_object('profile_data', to_jsonb(NEW)),
            'profiles',
            NEW.id::text
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.log_security_audit(
            'PROFILE_DELETE',
            'HIGH',
            jsonb_build_object('deleted_data', to_jsonb(OLD)),
            'profiles',
            OLD.id::text
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply the trigger to profiles table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
        CREATE TRIGGER audit_profile_changes_trigger
            AFTER INSERT OR UPDATE OR DELETE ON public.profiles
            FOR EACH ROW EXECUTE FUNCTION public.audit_profile_changes();
    END IF;
END $$;

-- 3. SECURITY: Medical data access logging
CREATE OR REPLACE FUNCTION public.audit_medical_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Log access to sensitive medical data
    IF TG_OP = 'SELECT' THEN
        PERFORM public.log_security_audit(
            'MEDICAL_DATA_ACCESS',
            'MEDIUM',
            jsonb_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'record_id', NEW.id::text
            ),
            TG_TABLE_NAME,
            NEW.id::text
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Apply to medical data table
DROP TRIGGER IF EXISTS audit_biovida_access_trigger ON public.biovida_analyses;
CREATE TRIGGER audit_biovida_access_trigger
    AFTER INSERT OR UPDATE ON public.biovida_analyses
    FOR EACH ROW EXECUTE FUNCTION public.audit_medical_access();

-- 4. SECURITY: Create security summary view for administrators
CREATE OR REPLACE VIEW public.security_summary AS
SELECT 
    'total_users' as metric,
    COUNT(*)::text as value,
    'Total registered users' as description
FROM auth.users
WHERE deleted_at IS NULL

UNION ALL

SELECT 
    'recent_security_events' as metric,
    COUNT(*)::text as value,
    'Security events in last 24h' as description
FROM public.security_audit_log
WHERE created_at > now() - INTERVAL '24 hours'

UNION ALL

SELECT 
    'medical_records' as metric,
    COUNT(*)::text as value,
    'Total medical analysis records' as description
FROM public.biovida_analyses

UNION ALL

SELECT 
    'rls_enabled_tables' as metric,
    COUNT(*)::text as value,
    'Tables with RLS enabled' as description
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'r'
AND c.relrowsecurity = true;

-- 5. SECURITY: Enhanced user session monitoring
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    session_start timestamp with time zone DEFAULT now(),
    session_end timestamp with time zone,
    ip_address inet,
    user_agent text,
    is_active boolean DEFAULT true,
    security_flags jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role can manage all sessions
CREATE POLICY "Service role can manage all sessions"
ON public.user_sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. SECURITY: Function to create new user session
CREATE OR REPLACE FUNCTION public.create_user_session(
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    session_id uuid;
BEGIN
    INSERT INTO public.user_sessions (
        user_id,
        ip_address,
        user_agent,
        security_flags
    ) VALUES (
        auth.uid(),
        COALESCE(p_ip_address, inet_client_addr()),
        p_user_agent,
        jsonb_build_object(
            'created_at', now(),
            'session_type', 'web'
        )
    ) RETURNING id INTO session_id;
    
    -- Log session creation
    PERFORM public.log_security_audit(
        'SESSION_CREATE',
        'INFO',
        jsonb_build_object(
            'session_id', session_id,
            'ip_address', COALESCE(p_ip_address, inet_client_addr()),
            'user_agent', p_user_agent
        ),
        'user_sessions',
        session_id::text
    );
    
    RETURN session_id;
END;
$$;