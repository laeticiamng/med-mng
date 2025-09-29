-- Fix the final 4 remaining Security Definer Views
-- Complete the security fix by replacing all remaining postgres-owned views

-- =====================================================
-- FIX FINAL REMAINING SECURITY DEFINER VIEWS
-- =====================================================

-- 1. Replace lyrics_texts_latest view with secure function
DROP VIEW IF EXISTS public.lyrics_texts_latest CASCADE;

CREATE OR REPLACE FUNCTION public.get_latest_lyrics_texts()
RETURNS TABLE (
  id uuid,
  item_code text,
  rang text,
  content text,
  style_meta jsonb,
  version integer,
  is_published boolean,
  status text,
  generated_by text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (item_code, rang)
    id,
    item_code,
    rang,
    content,
    style_meta,
    version,
    is_published,
    status,
    generated_by,
    created_at,
    updated_at
  FROM lyrics_texts
  WHERE is_published = true
  ORDER BY item_code, rang, version DESC;
$$;

-- 2. Replace oic_completion_dashboard view with secure function  
DROP VIEW IF EXISTS public.oic_completion_dashboard CASCADE;

CREATE OR REPLACE FUNCTION public.get_oic_completion_dashboard()
RETURNS TABLE (
  total bigint,
  nb_updated bigint,
  nb_empty bigint,
  nb_error bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE completion_status = 'updated') AS nb_updated,
    COUNT(*) FILTER (WHERE completion_status = 'skipped_empty') AS nb_empty,
    COUNT(*) FILTER (WHERE completion_status = 'skipped_error') AS nb_error
  FROM backup_oic_competences;
$$;

-- 3. Fix the recreated secure_platform_stats view
DROP VIEW IF EXISTS public.secure_platform_stats CASCADE;

CREATE OR REPLACE FUNCTION public.get_secure_platform_stats()
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

-- 4. Replace security_summary view with secure function
DROP VIEW IF EXISTS public.security_summary CASCADE;

CREATE OR REPLACE FUNCTION public.get_security_summary()
RETURNS TABLE (
  metric text,
  value text,
  description text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'rls_enabled_tables'::text AS metric,
         COUNT(*)::text AS value,
         'Tables with RLS enabled'::text AS description
  FROM pg_class c
  JOIN pg_namespace n ON (n.oid = c.relnamespace)
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = true;
$$;

-- 5. Replace v_competences_parsed view with secure function
DROP VIEW IF EXISTS public.v_competences_parsed CASCADE;

CREATE OR REPLACE FUNCTION public.get_competences_parsed()
RETURNS TABLE (
  objectif_id text,
  intitule text,
  description text,
  url_source text,
  rang text,
  item_parent text,
  item_id text,
  ordre_num integer,
  rang_code text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    objectif_id,
    intitule,
    description,
    url_source,
    rang,
    item_parent,
    split_part(objectif_id, '-', 2) AS item_id,
    (split_part(objectif_id, '-', 3))::integer AS ordre_num,
    split_part(objectif_id, '-', 4) AS rang_code
  FROM backup_oic_competences;
$$;

-- Grant appropriate permissions on all new functions
GRANT EXECUTE ON FUNCTION public.get_latest_lyrics_texts() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_oic_completion_dashboard() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_secure_platform_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_security_summary() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_competences_parsed() TO authenticated, anon;