-- SECURITY DEFINER VIEW FIX - Replace views with secure functions
-- This addresses the critical security issue where postgres-owned views bypass RLS

-- =====================================================
-- REPLACE SECURITY DEFINER VIEWS WITH SECURE FUNCTIONS
-- =====================================================

-- 1. Replace audit_summary view with secure function
DROP VIEW IF EXISTS public.audit_summary CASCADE;

CREATE OR REPLACE FUNCTION public.get_audit_summary()
RETURNS TABLE (
  table_name text,
  valid_titles bigint,
  valid_descriptions bigint,
  avg_completeness_score numeric,
  total_rows bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    'edn_items_immersive'::text AS table_name,
    COUNT(*) FILTER (WHERE title IS NOT NULL AND title <> '') AS valid_titles,
    COUNT(*) FILTER (WHERE tableau_rang_a IS NOT NULL) AS valid_descriptions,
    ROUND(AVG(
      CASE
        WHEN title IS NOT NULL AND tableau_rang_a IS NOT NULL THEN 100
        ELSE 50
      END), 2) AS avg_completeness_score,
    COUNT(*) AS total_rows
  FROM edn_items_immersive;
$$;

-- 2. Replace med_mng_view_library with secure function
DROP VIEW IF EXISTS public.med_mng_view_library CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_music_library()
RETURNS TABLE (
  id uuid,
  title text,
  created_at timestamp with time zone,
  in_library boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
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
$$;

-- 3. Replace secure_platform_stats with secure function
DROP VIEW IF EXISTS public.secure_platform_stats CASCADE;

CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE (
  metric text,
  value text,
  unit text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'active_users_7d'::text AS metric,
         COUNT(DISTINCT emotions.user_id)::text AS value,
         'users'::text AS unit
  FROM emotions
  WHERE emotions.date > (now() - INTERVAL '7 days')
  UNION ALL
  SELECT 'total_songs'::text AS metric,
         COUNT(*)::text AS value,
         'songs'::text AS unit
  FROM med_mng_songs
  UNION ALL
  SELECT 'total_conversations'::text AS metric,
         COUNT(*)::text AS value,
         'conversations'::text AS unit
  FROM chat_conversations
  WHERE chat_conversations.created_at > (now() - INTERVAL '30 days');
$$;

-- 4. Replace security_violations_summary with secure function (admin only)
DROP VIEW IF EXISTS public.security_violations_summary CASCADE;

CREATE OR REPLACE FUNCTION public.get_security_violations_summary()
RETURNS TABLE (
  severity text,
  finding_type text,
  violation_count bigint,
  unresolved_count bigint,
  last_detection timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT 
    sal.severity,
    sal.finding_type,
    COUNT(*) AS violation_count,
    COUNT(CASE WHEN sal.resolved_at IS NULL THEN 1 END) AS unresolved_count,
    MAX(sal.created_at) AS last_detection
  FROM security_audit_log sal
  WHERE EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
  GROUP BY sal.severity, sal.finding_type
  ORDER BY 
    CASE sal.severity
      WHEN 'CRITICAL' THEN 1
      WHEN 'HIGH' THEN 2
      WHEN 'MEDIUM' THEN 3
      ELSE 4
    END,
    COUNT(*) DESC;
$$;

-- 5. Replace team_emotion_summary with secure function (manager/admin only)
DROP VIEW IF EXISTS public.team_emotion_summary CASCADE;

CREATE OR REPLACE FUNCTION public.get_team_emotion_summary()
RETURNS TABLE (
  org_id uuid,
  team_name text,
  date date,
  emotion_type text,
  count bigint,
  avg_confidence numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT 
    om.org_id,
    om.team_name,
    date_trunc('day', em.date)::date AS date,
    'general'::text AS emotion_type,
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
  ORDER BY date_trunc('day', em.date) DESC;
$$;

-- 6. Replace remaining problematic views with secure functions
DROP VIEW IF EXISTS public.user_activity_summary CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_activity_summary()
RETURNS TABLE (
  user_id uuid,
  total_emotions bigint,
  total_conversations bigint,
  total_favorite_songs bigint,
  last_emotion_date timestamp with time zone,
  last_conversation_date timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
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
$$;

-- 7. Replace user_progress_view with secure function
DROP VIEW IF EXISTS public.user_progress_view CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_progress()
RETURNS TABLE (
  user_id uuid,
  total_badges bigint,
  total_challenges bigint,
  completed_challenges bigint,
  avg_points numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
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
$$;

-- Grant appropriate permissions on all functions
GRANT EXECUTE ON FUNCTION public.get_audit_summary() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_music_library() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_security_violations_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_emotion_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activity_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_progress() TO authenticated;