\echo '🔐 Setting up medical RLS regression test schema'

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY
);

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.uid', true), '')::uuid;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;

  GRANT anon TO postgres;
  GRANT authenticated TO postgres;
  GRANT service_role TO postgres;
END;
$$;

-- Reset tables to a known state for the test run
DROP TABLE IF EXISTS public.medical_learning_analytics CASCADE;
DROP TABLE IF EXISTS public.unified_music_generation CASCADE;
DROP TABLE IF EXISTS public.generation_quotas CASCADE;
DROP TABLE IF EXISTS public.learning_analytics CASCADE;
DROP TABLE IF EXISTS public.study_sessions CASCADE;
DROP TABLE IF EXISTS public.medical_playlists CASCADE;
DROP TABLE IF EXISTS public.medical_libraries CASCADE;
DROP TABLE IF EXISTS public.medical_tracks CASCADE;
DROP TABLE IF EXISTS public.medical_users CASCADE;

CREATE TABLE public.medical_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  subscription_tier text DEFAULT 'free'
);

CREATE TABLE public.medical_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  item_code text NOT NULL,
  rang text NOT NULL CHECK (rang IN ('A', 'B', 'AB')),
  generation_status text DEFAULT 'completed'
);

CREATE TABLE public.medical_libraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id uuid REFERENCES public.medical_tracks(id) ON DELETE CASCADE
);

CREATE TABLE public.medical_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_public boolean DEFAULT false,
  track_ids uuid[] DEFAULT '{}'
);

CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id uuid REFERENCES public.medical_tracks(id) ON DELETE SET NULL,
  session_type text DEFAULT 'listening',
  duration_seconds integer NOT NULL
);

CREATE TABLE public.learning_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date DEFAULT current_date,
  tracks_generated integer DEFAULT 0
);

CREATE TABLE public.generation_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quota_type text NOT NULL,
  total_quota integer NOT NULL,
  used_quota integer DEFAULT 0,
  reset_at timestamptz NOT NULL
);

CREATE TABLE public.unified_music_generation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_code text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'pending'
);

CREATE TABLE public.medical_learning_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_code text NOT NULL,
  action_type text NOT NULL
);

\ir ../../supabase/policies/medical_tables.sql

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'medical_users',
    'medical_tracks',
    'medical_libraries',
    'medical_playlists',
    'study_sessions',
    'learning_analytics',
    'generation_quotas',
    'unified_music_generation',
    'medical_learning_analytics'
  ])
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = tbl
        AND rowsecurity
    ) THEN
      RAISE EXCEPTION 'RLS is not enabled on table %', tbl;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = tbl
    ) THEN
      RAISE EXCEPTION 'No policies found for table %', tbl;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = tbl
        AND 'anon' = ANY(roles)
    ) THEN
      RAISE EXCEPTION 'Anonymous role should not have policies on table %', tbl;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = tbl
        AND 'service_role' = ANY(roles)
    ) THEN
      RAISE EXCEPTION 'service_role policy missing on table %', tbl;
    END IF;
  END LOOP;
END;
$$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON
  public.medical_users,
  public.medical_tracks,
  public.medical_libraries,
  public.medical_playlists,
  public.study_sessions,
  public.learning_analytics,
  public.generation_quotas,
  public.unified_music_generation,
  public.medical_learning_analytics
TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.medical_users,
  public.medical_tracks,
  public.medical_libraries,
  public.medical_playlists,
  public.study_sessions,
  public.learning_analytics,
  public.generation_quotas,
  public.unified_music_generation,
  public.medical_learning_analytics
TO authenticated, service_role;

INSERT INTO auth.users (id)
VALUES
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

BEGIN;

SET ROLE service_role;

INSERT INTO public.medical_users (user_id, display_name, subscription_tier)
VALUES ('11111111-1111-1111-1111-111111111111', 'Dr. Secure', 'premium');

INSERT INTO public.medical_tracks (user_id, title, item_code, rang)
VALUES ('11111111-1111-1111-1111-111111111111', 'Track Secure', 'ITEM-SEC-001', 'A')
RETURNING id \gset track_

INSERT INTO public.medical_libraries (user_id, track_id)
VALUES ('11111111-1111-1111-1111-111111111111', :'track_id');

INSERT INTO public.medical_playlists (user_id, name, is_public, track_ids)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Playlist Secure',
  true,
  ARRAY[ :'track_id'::uuid ]
);

INSERT INTO public.study_sessions (user_id, track_id, session_type, duration_seconds)
VALUES ('11111111-1111-1111-1111-111111111111', :'track_id', 'study', 900);

INSERT INTO public.learning_analytics (user_id, tracks_generated)
VALUES ('11111111-1111-1111-1111-111111111111', 1);

INSERT INTO public.generation_quotas (user_id, quota_type, total_quota, reset_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'monthly', 50, now() + interval '30 days');

INSERT INTO public.unified_music_generation (user_id, item_code, type, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'ITEM-SEC-001', 'rang_a', 'processing');

INSERT INTO public.medical_learning_analytics (user_id, item_code, action_type)
VALUES ('11111111-1111-1111-1111-111111111111', 'ITEM-SEC-001', 'music_generation_request');

RESET ROLE;

SET ROLE service_role;
DO $$
DECLARE
  tbl text;
  row_count integer;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'medical_users',
    'medical_tracks',
    'medical_libraries',
    'medical_playlists',
    'study_sessions',
    'learning_analytics',
    'generation_quotas',
    'unified_music_generation',
    'medical_learning_analytics'
  ])
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I', tbl) INTO row_count;
    IF row_count = 0 THEN
      RAISE EXCEPTION 'service_role should see data in table %', tbl;
    END IF;
  END LOOP;
END;
$$;
RESET ROLE;

SET ROLE anon;
DO $$
DECLARE
  tbl text;
  row_count integer;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'medical_users',
    'medical_tracks',
    'medical_libraries',
    'medical_playlists',
    'study_sessions',
    'learning_analytics',
    'generation_quotas',
    'unified_music_generation',
    'medical_learning_analytics'
  ])
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I', tbl) INTO row_count;
    IF row_count > 0 THEN
      RAISE EXCEPTION 'anon should not read table % (rows=%)', tbl, row_count;
    END IF;
  END LOOP;
END;
$$;
RESET ROLE;

ROLLBACK;
