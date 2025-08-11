-- Patch existing med_mng_songs to include missing columns
ALTER TABLE public.med_mng_songs
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS lyrics jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta jsonb DEFAULT '{}'::jsonb;

-- Ensure indexes
CREATE INDEX IF NOT EXISTS idx_med_mng_songs_created_by ON public.med_mng_songs(created_by);
CREATE INDEX IF NOT EXISTS idx_med_mng_songs_suno_audio_id ON public.med_mng_songs(suno_audio_id);

-- Enable RLS
ALTER TABLE public.med_mng_songs ENABLE ROW LEVEL SECURITY;

-- Recreate policies idempotently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'med_mng_songs' AND policyname = 'Public can view songs'
  ) THEN
    CREATE POLICY "Public can view songs"
    ON public.med_mng_songs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'med_mng_songs' AND policyname = 'Authenticated can insert songs'
  ) THEN
    CREATE POLICY "Authenticated can insert songs"
    ON public.med_mng_songs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'med_mng_songs' AND policyname = 'Owners can update songs'
  ) THEN
    CREATE POLICY "Owners can update songs"
    ON public.med_mng_songs FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'med_mng_songs' AND policyname = 'Owners can delete songs'
  ) THEN
    CREATE POLICY "Owners can delete songs"
    ON public.med_mng_songs FOR DELETE USING (created_by = auth.uid());
  END IF;
END $$;

-- Ensure trigger exists to maintain updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_med_mng_songs_updated_at'
  ) THEN
    CREATE TRIGGER trg_med_mng_songs_updated_at
    BEFORE UPDATE ON public.med_mng_songs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;