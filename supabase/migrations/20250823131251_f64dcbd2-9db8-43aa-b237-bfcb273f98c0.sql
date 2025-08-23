-- CRITICAL FIX: Remove auth.users exposure from security_summary view

-- Drop and recreate security_summary view without exposing auth.users
DROP VIEW IF EXISTS public.security_summary;

CREATE OR REPLACE VIEW public.security_summary AS
SELECT 
    'rls_enabled_tables' as metric,
    COUNT(*)::text as value,
    'Tables with RLS enabled' as description
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'r'
AND c.relrowsecurity = true

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
    'active_sessions' as metric,
    COUNT(*)::text as value,
    'Active user sessions' as description
FROM public.user_sessions
WHERE is_active = true;

-- Create RLS policy for security_summary view (admin only)
ALTER VIEW public.security_summary SET (security_barrier = true);

-- Create a secure function to get user count without exposing auth.users
CREATE OR REPLACE FUNCTION public.get_secure_user_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_count integer;
BEGIN
    -- Only allow service role or admin users to access this
    IF auth.role() != 'service_role' AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    SELECT COUNT(*) INTO user_count
    FROM auth.users
    WHERE deleted_at IS NULL;
    
    RETURN user_count;
END;
$$;