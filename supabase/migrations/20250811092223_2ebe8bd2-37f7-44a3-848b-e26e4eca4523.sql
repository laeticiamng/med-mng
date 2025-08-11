-- Lyrics backend: versioning + jobs, RLS and policies

-- 1) Table for versioned lyrics per EDN item and rang
CREATE TABLE IF NOT EXISTS public.lyrics_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text NOT NULL,
  rang text NOT NULL CHECK (rang IN ('A','B','AB')),
  content text NOT NULL,
  style_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'ready', -- queued | generating | ready | failed
  generated_by text,
  previous_version_id uuid NULL REFERENCES public.lyrics_texts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lyrics_texts ENABLE ROW LEVEL SECURITY;

-- Policies: public read; service role full manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lyrics_texts' AND policyname = 'Public read lyrics'
  ) THEN
    CREATE POLICY "Public read lyrics"
    ON public.lyrics_texts
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lyrics_texts' AND policyname = 'Service role manage lyrics'
  ) THEN
    CREATE POLICY "Service role manage lyrics"
    ON public.lyrics_texts
    FOR ALL
    USING ((auth.jwt() ->> 'role') = 'service_role')
    WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');
  END IF;
END $$;

-- Indexes and constraints
CREATE UNIQUE INDEX IF NOT EXISTS lyrics_texts_unique_version 
ON public.lyrics_texts(item_code, rang, version);

CREATE INDEX IF NOT EXISTS lyrics_texts_latest_idx 
ON public.lyrics_texts(item_code, rang, is_published, status);

-- Timestamps trigger (reuse shared function if present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_lyrics_texts_updated_at'
  ) THEN
    CREATE TRIGGER update_lyrics_texts_updated_at
    BEFORE UPDATE ON public.lyrics_texts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- View for latest published lyrics per (item_code, rang)
CREATE OR REPLACE VIEW public.lyrics_texts_latest AS
SELECT DISTINCT ON (item_code, rang)
  id, item_code, rang, content, style_meta, version, is_published, status, generated_by, created_at, updated_at
FROM public.lyrics_texts
WHERE is_published = true
ORDER BY item_code, rang, version DESC;

-- 2) Jobs table to orchestrate refined generation pipeline
CREATE TABLE IF NOT EXISTS public.lyrics_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text NOT NULL,
  rang text NOT NULL CHECK (rang IN ('A','B','AB')),
  priority integer NOT NULL DEFAULT 0,
  attempt_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'queued', -- queued | running | succeeded | failed
  requested_by uuid NULL,
  prompt text NULL,
  model text NOT NULL DEFAULT 'gpt-4.1-2025-04-14',
  error text NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lyrics_generation_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lyrics_generation_jobs' AND policyname = 'Service role manages lyrics jobs'
  ) THEN
    CREATE POLICY "Service role manages lyrics jobs"
    ON public.lyrics_generation_jobs
    FOR ALL
    USING ((auth.jwt() ->> 'role') = 'service_role')
    WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS lyrics_jobs_status_idx ON public.lyrics_generation_jobs(status);
CREATE INDEX IF NOT EXISTS lyrics_jobs_item_status_idx ON public.lyrics_generation_jobs(item_code, rang, status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_lyrics_generation_jobs_updated_at'
  ) THEN
    CREATE TRIGGER update_lyrics_generation_jobs_updated_at
    BEFORE UPDATE ON public.lyrics_generation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;