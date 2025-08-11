-- Generic updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- View: parsed competencies based on `objectifs` canonical code
CREATE OR REPLACE VIEW public.v_competences_parsed AS
SELECT
  b.objectifs,
  b.intitule,
  b.description,
  b.item_parent,
  b.url_source,
  split_part(b.objectifs, '-', 2) AS item_id,
  NULLIF(split_part(b.objectifs, '-', 3), '')::int AS ordre_num,
  split_part(b.objectifs, '-', 4) AS rang_code
FROM public.backup_oic_competences b
WHERE b.objectifs IS NOT NULL AND b.objectifs <> '';

-- Table: Lyrics versions
CREATE TABLE IF NOT EXISTS public.df_lyrics_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL,
  version TEXT NOT NULL CHECK (version IN ('A','B','A+B')),
  texte TEXT NOT NULL,
  couverture_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  score_couverture INTEGER NOT NULL DEFAULT 0,
  hash_prompt TEXT,
  hash_texte TEXT,
  idempotence_key TEXT UNIQUE,
  valide BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_df_lyrics_versions_item_version ON public.df_lyrics_versions(item_id, version);
CREATE INDEX IF NOT EXISTS idx_df_lyrics_versions_valide ON public.df_lyrics_versions(valide);

ALTER TABLE public.df_lyrics_versions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_lyrics_versions' AND policyname='Authenticated can read lyrics') THEN
    CREATE POLICY "Authenticated can read lyrics"
    ON public.df_lyrics_versions
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_lyrics_versions' AND policyname='Authenticated can insert lyrics') THEN
    CREATE POLICY "Authenticated can insert lyrics"
    ON public.df_lyrics_versions
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_lyrics_versions' AND policyname='Authenticated can update lyrics') THEN
    CREATE POLICY "Authenticated can update lyrics"
    ON public.df_lyrics_versions
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_lyrics_versions' AND policyname='Authenticated can delete lyrics') THEN
    CREATE POLICY "Authenticated can delete lyrics"
    ON public.df_lyrics_versions
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_df_lyrics_versions_updated_at ON public.df_lyrics_versions;
CREATE TRIGGER trg_df_lyrics_versions_updated_at
BEFORE UPDATE ON public.df_lyrics_versions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: Audio tracks (Suno)
CREATE TABLE IF NOT EXISTS public.df_audio_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lyrics_version_id UUID NOT NULL REFERENCES public.df_lyrics_versions(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'suno',
  provider_track_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','generating','done','failed')),
  duration INTEGER,
  seed TEXT,
  genre TEXT,
  audio_url TEXT,
  error_log TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_df_audio_tracks_lyrics_version ON public.df_audio_tracks(lyrics_version_id);
CREATE INDEX IF NOT EXISTS idx_df_audio_tracks_status ON public.df_audio_tracks(status);

ALTER TABLE public.df_audio_tracks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_audio_tracks' AND policyname='Authenticated can read audio tracks') THEN
    CREATE POLICY "Authenticated can read audio tracks"
    ON public.df_audio_tracks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_audio_tracks' AND policyname='Authenticated can insert audio tracks') THEN
    CREATE POLICY "Authenticated can insert audio tracks"
    ON public.df_audio_tracks
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_audio_tracks' AND policyname='Authenticated can update audio tracks') THEN
    CREATE POLICY "Authenticated can update audio tracks"
    ON public.df_audio_tracks
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_audio_tracks' AND policyname='Authenticated can delete audio tracks') THEN
    CREATE POLICY "Authenticated can delete audio tracks"
    ON public.df_audio_tracks
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_df_audio_tracks_updated_at ON public.df_audio_tracks;
CREATE TRIGGER trg_df_audio_tracks_updated_at
BEFORE UPDATE ON public.df_audio_tracks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: Generation jobs
CREATE TABLE IF NOT EXISTS public.df_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL DEFAULT 'single' CHECK (job_type IN ('single','batch')),
  item_ids TEXT[],
  all_items BOOLEAN DEFAULT false,
  versions TEXT[] NOT NULL DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  progress INTEGER NOT NULL DEFAULT 0,
  error_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_df_generation_jobs_status ON public.df_generation_jobs(status);

ALTER TABLE public.df_generation_jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_generation_jobs' AND policyname='Authenticated can read jobs') THEN
    CREATE POLICY "Authenticated can read jobs"
    ON public.df_generation_jobs
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_generation_jobs' AND policyname='Authenticated can insert jobs') THEN
    CREATE POLICY "Authenticated can insert jobs"
    ON public.df_generation_jobs
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_generation_jobs' AND policyname='Authenticated can update jobs') THEN
    CREATE POLICY "Authenticated can update jobs"
    ON public.df_generation_jobs
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='df_generation_jobs' AND policyname='Authenticated can delete jobs') THEN
    CREATE POLICY "Authenticated can delete jobs"
    ON public.df_generation_jobs
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_df_generation_jobs_updated_at ON public.df_generation_jobs;
CREATE TRIGGER trg_df_generation_jobs_updated_at
BEFORE UPDATE ON public.df_generation_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();