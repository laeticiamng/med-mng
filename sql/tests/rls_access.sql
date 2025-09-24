\set ON_ERROR_STOP on

-- Ensure cryptographic functions are available for uuid generation.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Provide a lightweight auth schema compatible with policy calls in tests.
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.mock_user_id', true), '')::uuid;
$$;

-- Bootstrap the Supabase runtime roles used by the security policies.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role;
  END IF;
END;
$$;

-- service_role must bypass RLS in Supabase projects.
-- ALTER ROLE service_role WITH BYPASSRLS; -- Disabled for test security. Grant only if strictly required for a specific test, and revoke immediately after.

-- Build the schema under test and enforce grants/policies.
\i sql/001_types_enums.sql

DROP TABLE IF EXISTS public.lyrics_segments CASCADE;
DROP TABLE IF EXISTS public.generated_music_tracks CASCADE;
DROP TABLE IF EXISTS public.item_competences CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;

CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.item_competences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  rang text NOT NULL,
  label text NOT NULL,
  idx int NOT NULL DEFAULT 0,
  CONSTRAINT item_competences_rang_check CHECK (rang IN ('A', 'B'))
);

CREATE TABLE public.generated_music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  mode public.music_mode NOT NULL,
  style text NOT NULL,
  duration_ms public.ms,
  status text NOT NULL DEFAULT 'pending',
  suno_job_id text,
  openai_prompt_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT generated_music_tracks_status_check CHECK (status IN ('pending', 'processing', 'ready', 'failed'))
);

CREATE TABLE public.lyrics_segments (
  id bigserial PRIMARY KEY,
  track_id uuid NOT NULL REFERENCES public.generated_music_tracks(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  idx int NOT NULL,
  start_ms public.ms NOT NULL,
  end_ms public.ms NOT NULL,
  text text NOT NULL,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lyrics_segments_end_after_start CHECK (end_ms > start_ms)
);

-- Grant minimal access so that policies, not privileges, gate visibility in the tests.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
\i sql/005_rls_enable.sql
\i sql/005_grants.sql
\i sql/005_rls_policies_catalog.sql
\i sql/005_rls_policies_tracks.sql
\i sql/005_rls_policies_segments.sql

-- Seed a deterministic dataset.
INSERT INTO public.items (id, slug, title)
VALUES ('00000000-0000-0000-0000-000000000001', 'alpha', 'Alpha Item')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.generated_music_tracks (id, owner_id, item_id, mode, style, status)
VALUES (
  '10000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'A',
  'test-style',
  'ready'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lyrics_segments (id, track_id, item_id, idx, start_ms, end_ms, text, role)
VALUES (
  1,
  '10000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  0,
  0,
  1000,
  'Test line',
  'lead'
)
ON CONFLICT (id) DO NOTHING;

-- Validate strict RLS and the presence of policies on all sensitive tables.
DO $$
DECLARE
  missing_rls text[];
  missing_policies text[];
BEGIN
  SELECT array_agg(tbl)
  INTO missing_rls
  FROM (
    VALUES ('items'),
           ('item_competences'),
           ('generated_music_tracks'),
           ('lyrics_segments')
  ) AS target(tbl)
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_class c
    WHERE c.oid = format('public.%s', target.tbl)::regclass
      AND c.relrowsecurity
      AND c.relforcerowsecurity
  );

  IF missing_rls IS NOT NULL THEN
    RAISE EXCEPTION 'Missing strict RLS enforcement for tables: %', missing_rls;
  END IF;

  SELECT array_agg(tbl)
  INTO missing_policies
  FROM (
    VALUES ('items'),
           ('item_competences'),
           ('generated_music_tracks'),
           ('lyrics_segments')
  ) AS target(tbl)
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename = target.tbl
  );

  IF missing_policies IS NOT NULL THEN
    RAISE EXCEPTION 'Missing RLS policies for tables: %', missing_policies;
  END IF;
END;
$$;

-- Anonymous users must never see data from sensitive tables.
RESET ROLE;
RESET app.mock_user_id;
SET ROLE anon;
RESET app.mock_user_id;
SELECT COUNT(*) AS anon_items
FROM public.items;
\gset
RESET ROLE;
\if :anon_items
  \echo 'Anonymous role unexpectedly sees catalog items'
  \quit 1
\endif

SET ROLE anon;
RESET app.mock_user_id;
SELECT COUNT(*) AS anon_tracks
FROM public.generated_music_tracks;
\gset
RESET ROLE;
\if :anon_tracks
  \echo 'Anonymous role unexpectedly sees generated tracks'
  \quit 1
\endif

SET ROLE anon;
RESET app.mock_user_id;
SELECT COUNT(*) AS anon_segments
FROM public.lyrics_segments;
\gset
RESET ROLE;
\if :anon_segments
  \echo 'Anonymous role unexpectedly sees lyrics segments'
  \quit 1
\endif

-- Service role must bypass RLS and access every row.
SET ROLE service_role;
SELECT COUNT(*) AS svc_items FROM public.items;
\gset
RESET ROLE;
\if :svc_items
\else
  \echo 'service_role should be able to read catalog items'
  \quit 1
\endif

SET ROLE service_role;
SELECT COUNT(*) AS svc_tracks FROM public.generated_music_tracks;
\gset
RESET ROLE;
\if :svc_tracks
\else
  \echo 'service_role should be able to read generated tracks'
  \quit 1
\endif

SET ROLE service_role;
SELECT COUNT(*) AS svc_segments FROM public.lyrics_segments;
\gset
RESET ROLE;
\if :svc_segments
\else
  \echo 'service_role should be able to read lyrics segments'
  \quit 1
\endif

-- Authenticated user can only access their own rows.
SET ROLE authenticated;
SET app.mock_user_id = '20000000-0000-0000-0000-000000000000';
SELECT COUNT(*) AS self_track_count FROM public.generated_music_tracks;
\gset
RESET ROLE;
RESET app.mock_user_id;
\if :self_track_count
\else
  \echo 'Authenticated owner should see their tracks'
  \quit 1
\endif

SET ROLE authenticated;
SET app.mock_user_id = '30000000-0000-0000-0000-000000000000';
SELECT COUNT(*) AS outsider_track_count FROM public.generated_music_tracks;
\gset
RESET ROLE;
RESET app.mock_user_id;
\if :outsider_track_count
  \echo 'Authenticated users must not see tracks owned by others'
  \quit 1
\endif

\echo '✅ RLS access controls validated successfully.'
