-- Fix Security Definer Views: Convert to Security Invoker
-- This migration addresses the 2 critical Security Definer View issues detected by the linter

-- 1. Fix med_mng_view_library view
DROP VIEW IF EXISTS public.med_mng_view_library;

CREATE OR REPLACE VIEW public.med_mng_view_library
WITH (security_invoker = true)
AS
SELECT 
  s.id,
  s.title,
  s.suno_audio_id,
  s.meta,
  s.created_at,
  us.created_at AS added_to_library_at,
  us.user_id,
  EXISTS (
    SELECT 1
    FROM med_mng_song_likes sl
    WHERE sl.song_id = s.id AND sl.user_id = us.user_id
  ) AS is_liked
FROM med_mng_songs s
JOIN med_mng_user_songs us ON s.id = us.song_id
ORDER BY us.created_at DESC;

-- 2. Fix profiles_public view
DROP VIEW IF EXISTS public.profiles_public;

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT 
  profiles.id,
  CASE
    WHEN profiles.id = auth.uid() THEN profiles.email
    ELSE NULL::text
  END AS email,
  CASE
    WHEN profiles.id = auth.uid() THEN profiles.phone
    ELSE NULL::text
  END AS phone,
  profiles.name,
  profiles.avatar_url,
  profiles.bio,
  profiles.location,
  profiles.website,
  profiles.created_at
FROM profiles;

-- Add comments for documentation
COMMENT ON VIEW public.med_mng_view_library IS 'User library view with security_invoker to prevent privilege escalation';
COMMENT ON VIEW public.profiles_public IS 'Public profiles view with security_invoker and privacy controls';