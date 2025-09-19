CREATE TABLE IF NOT EXISTS public.generated_music_tracks (
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
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS id uuid;

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS owner_id uuid;

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS item_id uuid;

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS mode public.music_mode;

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS style text;

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS duration_ms public.ms;

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS suno_job_id text;

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS openai_prompt_hash text;

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN item_id SET NOT NULL;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN mode SET NOT NULL;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN style SET NOT NULL;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN metadata SET NOT NULL;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE public.generated_music_tracks
    ADD CONSTRAINT generated_music_tracks_pkey PRIMARY KEY (id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.generated_music_tracks
    ADD CONSTRAINT generated_music_tracks_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.generated_music_tracks
    ADD CONSTRAINT generated_music_tracks_status_check CHECK (status IN ('pending', 'processing', 'ready', 'failed'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS idx_gmt_owner
  ON public.generated_music_tracks(owner_id);

CREATE INDEX IF NOT EXISTS idx_gmt_item
  ON public.generated_music_tracks(item_id);

CREATE INDEX IF NOT EXISTS idx_gmt_status
  ON public.generated_music_tracks(status);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gmt_updated ON public.generated_music_tracks;
CREATE TRIGGER trg_gmt_updated
BEFORE UPDATE ON public.generated_music_tracks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
