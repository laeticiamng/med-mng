CREATE TABLE IF NOT EXISTS public.lyrics_segments (
  id bigserial PRIMARY KEY,
  track_id uuid NOT NULL REFERENCES public.generated_music_tracks(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  idx int NOT NULL,
  start_ms public.ms NOT NULL,
  end_ms public.ms NOT NULL,
  text text NOT NULL,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_ms > start_ms)
);

ALTER TABLE public.lyrics_segments
  ADD COLUMN IF NOT EXISTS track_id uuid;

ALTER TABLE public.lyrics_segments
  ADD COLUMN IF NOT EXISTS item_id uuid;

ALTER TABLE public.lyrics_segments
  ADD COLUMN IF NOT EXISTS idx int;

ALTER TABLE public.lyrics_segments
  ADD COLUMN IF NOT EXISTS start_ms public.ms;

ALTER TABLE public.lyrics_segments
  ADD COLUMN IF NOT EXISTS end_ms public.ms;

ALTER TABLE public.lyrics_segments
  ADD COLUMN IF NOT EXISTS text text;

ALTER TABLE public.lyrics_segments
  ADD COLUMN IF NOT EXISTS role text;

ALTER TABLE public.lyrics_segments
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.lyrics_segments
  ALTER COLUMN track_id SET NOT NULL;

ALTER TABLE public.lyrics_segments
  ALTER COLUMN item_id SET NOT NULL;

ALTER TABLE public.lyrics_segments
  ALTER COLUMN idx SET NOT NULL;

ALTER TABLE public.lyrics_segments
  ALTER COLUMN start_ms SET NOT NULL;

ALTER TABLE public.lyrics_segments
  ALTER COLUMN end_ms SET NOT NULL;

ALTER TABLE public.lyrics_segments
  ALTER COLUMN text SET NOT NULL;

ALTER TABLE public.lyrics_segments
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.lyrics_segments
  ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE public.lyrics_segments
    ADD CONSTRAINT lyrics_segments_pkey PRIMARY KEY (id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.lyrics_segments
    ADD CONSTRAINT lyrics_segments_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.generated_music_tracks(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.lyrics_segments
    ADD CONSTRAINT lyrics_segments_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.lyrics_segments
    ADD CONSTRAINT lyrics_segments_end_after_start CHECK (end_ms > start_ms);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_lyrics_segments_track_idx
  ON public.lyrics_segments(track_id, idx);

CREATE INDEX IF NOT EXISTS idx_lyrics_segments_track_start
  ON public.lyrics_segments(track_id, start_ms);
