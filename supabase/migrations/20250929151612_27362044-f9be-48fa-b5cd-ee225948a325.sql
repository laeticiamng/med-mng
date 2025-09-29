-- Fix remaining Security Definer Views
-- Recreate all postgres-owned views to enforce proper RLS

-- =====================================================
-- FIX REMAINING SECURITY DEFINER VIEWS (Part 2)
-- =====================================================

-- 1. Fix med_mng_view_library view - user-scoped music library
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
LEFT JOIN med_mng_user_songs mus ON (
    s.id = mus.song_id 
    AND mus.user_id = auth.uid()
)
WHERE s.id IN (
    SELECT song_id 
    FROM med_mng_user_songs 
    WHERE user_id = auth.uid()
);

-- 2. Fix secure_platform_stats view - public statistics
DROP VIEW IF EXISTS public.secure_platform_stats CASCADE;
CREATE VIEW public.secure_platform_stats
WITH (security_barrier=true)
AS
SELECT 'active_users_7d' AS metric,
       COUNT(DISTINCT emotions.user_id)::text AS value,
       'users' AS unit
FROM emotions
WHERE emotions.date > (now() - INTERVAL '7 days')
UNION ALL
SELECT 'total_songs' AS metric,
       COUNT(*)::text AS value,
       'songs' AS unit
FROM med_mng_songs
UNION ALL
SELECT 'total_conversations' AS metric,
       COUNT(*)::text AS value,
       'conversations' AS unit
FROM chat_conversations
WHERE chat_conversations.created_at > (now() - INTERVAL '30 days');

-- 3. Fix security_summary view - public security metrics
DROP VIEW IF EXISTS public.security_summary CASCADE;
CREATE VIEW public.security_summary
WITH (security_barrier=true)
AS
SELECT 'rls_enabled_tables' AS metric,
       COUNT(*)::text AS value,
       'Tables with RLS enabled' AS description
FROM pg_class c
JOIN pg_namespace n ON (n.oid = c.relnamespace)
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true;

-- 4. Fix security_violations_summary view - admin only
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
WHERE EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
)
GROUP BY severity, finding_type
ORDER BY 
    CASE severity
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        ELSE 4
    END,
    COUNT(*) DESC;

-- 5. Fix team_emotion_summary view - manager/admin only with org context
DROP VIEW IF EXISTS public.team_emotion_summary CASCADE;
CREATE VIEW public.team_emotion_summary
WITH (security_barrier=true)
AS
SELECT 
    om.org_id,
    om.team_name,
    date_trunc('day', em.date) AS date,
    'general' AS emotion_type,
    COUNT(*) AS count,
    AVG(em.score::numeric) AS avg_confidence
FROM org_memberships om
JOIN emotions em ON (em.user_id = om.user_id)
WHERE EXISTS (
    SELECT 1 FROM org_memberships om2
    WHERE om2.org_id = om.org_id
      AND om2.user_id = auth.uid()
      AND om2.role IN ('manager', 'admin')
)
GROUP BY om.org_id, om.team_name, date_trunc('day', em.date)
ORDER BY date DESC;

-- 6. Fix user_activity_summary view - user-scoped
DROP VIEW IF EXISTS public.user_activity_summary CASCADE;
CREATE VIEW public.user_activity_summary
WITH (security_barrier=true)
AS
SELECT 
    auth.uid() AS user_id,
    COUNT(DISTINCT em.id) AS total_emotions,
    COUNT(DISTINCT cc.id) AS total_conversations,
    COUNT(DISTINCT muf.song_id) AS total_favorite_songs,
    MAX(em.date) AS last_emotion_date,
    MAX(cc.updated_at) AS last_conversation_date
FROM emotions em
FULL OUTER JOIN chat_conversations cc ON (cc.user_id = auth.uid())
FULL OUTER JOIN med_mng_user_favorites muf ON (muf.user_id = auth.uid())
WHERE em.user_id = auth.uid() OR em.user_id IS NULL
GROUP BY auth.uid();

-- 7. Fix user_progress_view - user-scoped learning progress
DROP VIEW IF EXISTS public.user_progress_view CASCADE;
CREATE VIEW public.user_progress_view
WITH (security_barrier=true)
AS
SELECT 
    auth.uid() AS user_id,
    COUNT(DISTINCT badges.id) AS total_badges,
    COUNT(DISTINCT challenges.id) AS total_challenges,
    COUNT(DISTINCT challenges.id) FILTER (WHERE challenges.completed = true) AS completed_challenges,
    AVG(CASE WHEN challenges.completed THEN challenges.points ELSE 0 END) AS avg_points
FROM badges
FULL OUTER JOIN challenges ON (challenges.user_id = auth.uid())
WHERE badges.user_id = auth.uid() OR badges.user_id IS NULL
GROUP BY auth.uid();

-- Grant appropriate permissions on all new views
GRANT SELECT ON public.med_mng_view_library TO authenticated;
GRANT SELECT ON public.secure_platform_stats TO authenticated, anon;
GRANT SELECT ON public.security_summary TO authenticated, anon;
GRANT SELECT ON public.security_violations_summary TO authenticated;
GRANT SELECT ON public.team_emotion_summary TO authenticated;
GRANT SELECT ON public.user_activity_summary TO authenticated;
GRANT SELECT ON public.user_progress_view TO authenticated;