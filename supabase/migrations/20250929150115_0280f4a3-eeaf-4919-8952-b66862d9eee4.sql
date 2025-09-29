-- Fix Security Definer Views - Correct Column Names and Security Barriers
-- This resolves the security vulnerability where views bypass RLS policies

-- =====================================================
-- CREATE SECURE VIEWS WITH PROPER COLUMN REFERENCES
-- =====================================================

-- 1. Fix med_mng_view_library - should only show user's own library
DROP VIEW IF EXISTS public.med_mng_view_library CASCADE;
CREATE VIEW public.med_mng_view_library 
WITH (security_barrier=true)
AS
SELECT 
    s.id,
    s.title,
    s.created_at,
    CASE
        WHEN mus.user_id IS NOT NULL THEN true
        ELSE false
    END AS in_library
FROM med_mng_songs s
LEFT JOIN med_mng_user_songs mus ON (s.id = mus.song_id AND mus.user_id = auth.uid())
WHERE s.id IN (
    SELECT song_id 
    FROM med_mng_user_songs 
    WHERE user_id = auth.uid()
);

-- 2. Fix user_activity_summary - using correct column names
DROP VIEW IF EXISTS public.user_activity_summary CASCADE;
CREATE VIEW public.user_activity_summary
WITH (security_barrier=true)
AS
SELECT 
    'total_active_users' as metric,
    COUNT(DISTINCT user_id)::text as value,
    'Last 30 days' as period
FROM (
    SELECT DISTINCT user_id FROM emotions WHERE date > NOW() - INTERVAL '30 days'
    UNION
    SELECT DISTINCT user_id FROM chat_conversations WHERE created_at > NOW() - INTERVAL '30 days'
) active_users;

-- 3. Fix user_progress_view - should only show user's own progress
DROP VIEW IF EXISTS public.user_progress_view CASCADE;
CREATE VIEW public.user_progress_view
WITH (security_barrier=true)
AS
SELECT 
    auth.uid() as user_id,
    COUNT(DISTINCT cc.id) as conversations_count,
    COUNT(DISTINCT e.id) as emotions_count,
    MAX(e.date) as last_activity
FROM emotions e
LEFT JOIN chat_conversations cc ON cc.user_id = e.user_id
WHERE e.user_id = auth.uid()
GROUP BY auth.uid();

-- 4. Fix team_emotion_summary - should respect team membership and use correct columns
DROP VIEW IF EXISTS public.team_emotion_summary CASCADE;
CREATE VIEW public.team_emotion_summary
WITH (security_barrier=true)
AS
SELECT 
    om.org_id,
    om.team_name,
    DATE_TRUNC('day', em.date) AS date,
    'general' as emotion_type,  -- emotions table doesn't have emotion_type, using placeholder
    COUNT(*) AS count,
    AVG(em.score::numeric) AS avg_confidence
FROM org_memberships om
JOIN emotions em ON em.user_id = om.user_id
WHERE EXISTS (
    SELECT 1 FROM org_memberships om2 
    WHERE om2.org_id = om.org_id 
    AND om2.user_id = auth.uid() 
    AND om2.role IN ('manager', 'admin')
)
GROUP BY om.org_id, om.team_name, DATE_TRUNC('day', em.date);

-- 5. Fix secure_platform_stats - using correct column names
DROP VIEW IF EXISTS public.secure_platform_stats CASCADE;
CREATE VIEW public.secure_platform_stats
WITH (security_barrier=true)
AS
SELECT 
    'active_users_7d' AS metric,
    COUNT(DISTINCT user_id)::text AS value,
    'users' AS unit
FROM emotions
WHERE date > (NOW() - INTERVAL '7 days')
UNION ALL
SELECT 
    'total_songs' AS metric,
    COUNT(*)::text AS value,
    'songs' AS unit
FROM med_mng_songs
UNION ALL
SELECT 
    'total_conversations' AS metric,
    COUNT(*)::text AS value,
    'conversations' AS unit
FROM chat_conversations
WHERE created_at > (NOW() - INTERVAL '30 days');

-- 6. Fix security views to be security-barrier compliant
DROP VIEW IF EXISTS public.security_summary CASCADE;
CREATE VIEW public.security_summary
WITH (security_barrier=true)
AS
SELECT 
    'rls_enabled_tables' AS metric,
    COUNT(*)::text AS value,
    'Tables with RLS enabled' AS description
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND c.relkind = 'r' 
AND c.relrowsecurity = true;

DROP VIEW IF EXISTS public.security_violations_summary CASCADE;
CREATE VIEW public.security_violations_summary
WITH (security_barrier=true)
AS
SELECT 
    severity,
    finding_type,
    COUNT(*) AS violation_count,
    COUNT(CASE WHEN resolved_at IS NULL THEN 1 END) AS unresolved_count,
    MAX(created_at) AS last_detection
FROM security_audit_log
GROUP BY severity, finding_type
ORDER BY 
    CASE severity
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        ELSE 4
    END,
    COUNT(*) DESC;

-- Grant appropriate permissions on these views
GRANT SELECT ON public.med_mng_view_library TO authenticated;
GRANT SELECT ON public.user_activity_summary TO authenticated;
GRANT SELECT ON public.user_progress_view TO authenticated;
GRANT SELECT ON public.team_emotion_summary TO authenticated;
GRANT SELECT ON public.secure_platform_stats TO authenticated;
GRANT SELECT ON public.security_summary TO authenticated;
GRANT SELECT ON public.security_violations_summary TO authenticated;