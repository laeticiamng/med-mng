-- Align item and music generation data contracts

-- 1. Canonical view for items and competencies
DROP VIEW IF EXISTS public.item_with_competences CASCADE;
CREATE VIEW public.item_with_competences AS
SELECT
  i.id AS item_id,
  i.item_code,
  i.slug,
  i.title,
  c.objectif_id AS competence_id,
  c.rang AS competence_rang,
  c.intitule AS competence_title,
  c.description AS competence_description,
  c.rubrique AS competence_rubrique
FROM public.edn_items_immersive i
LEFT JOIN public.oic_competences c
  ON c.item_parent = RIGHT(i.item_code, 3);

COMMENT ON VIEW public.item_with_competences IS 'Canonical mapping between EDN items and OIC competencies (rang A/B).';

-- 2. Extend generated_music_tracks with item linkage and orchestration metadata
ALTER TABLE public.generated_music_tracks
  ADD COLUMN IF NOT EXISTS item_id uuid,
  ADD COLUMN IF NOT EXISTS mode text,
  ADD COLUMN IF NOT EXISTS style text,
  ADD COLUMN IF NOT EXISTS suno_job_id text,
  ADD COLUMN IF NOT EXISTS openai_prompt_hash text,
  ADD COLUMN IF NOT EXISTS status text GENERATED ALWAYS AS (generation_status) STORED;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

-- Backfill new columns from existing metadata when possible
WITH fallback_item AS (
  SELECT id FROM public.edn_items_immersive ORDER BY created_at LIMIT 1
)
UPDATE public.generated_music_tracks g
SET
  item_id = COALESCE(
    g.item_id,
    CASE
      WHEN g.metadata ? 'item_id' AND (g.metadata->>'item_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN (g.metadata->>'item_id')::uuid
    END,
    (
      SELECT ei.id
      FROM public.edn_items_immersive ei
      WHERE ei.item_code = COALESCE(g.metadata->>'item_code', g.metadata->>'item')
      LIMIT 1
    ),
    (SELECT id FROM fallback_item)
  ),
  mode = COALESCE(g.mode, NULLIF(g.metadata->>'mode', ''), 'A'),
  style = COALESCE(g.style, NULLIF(g.metadata->>'style', ''), 'default'),
  suno_job_id = COALESCE(g.suno_job_id, g.metadata->>'suno_job_id'),
  openai_prompt_hash = COALESCE(g.openai_prompt_hash, g.metadata->>'openai_prompt_hash');

-- Ensure required columns are set
UPDATE public.generated_music_tracks
SET mode = 'A'
WHERE mode IS NULL;

UPDATE public.generated_music_tracks
SET style = 'default'
WHERE style IS NULL;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN mode SET DEFAULT 'A',
  ALTER COLUMN style SET DEFAULT 'default',
  ALTER COLUMN mode SET NOT NULL,
  ALTER COLUMN style SET NOT NULL,
  ALTER COLUMN metadata SET NOT NULL;

ALTER TABLE public.generated_music_tracks
  ADD CONSTRAINT generated_music_tracks_mode_check CHECK (mode IN ('A', 'B', 'AB'));

ALTER TABLE public.generated_music_tracks
  ADD CONSTRAINT generated_music_tracks_item_id_fkey
  FOREIGN KEY (item_id) REFERENCES public.edn_items_immersive(id) ON DELETE CASCADE;

ALTER TABLE public.generated_music_tracks
  ALTER COLUMN item_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_item ON public.generated_music_tracks(item_id);
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_mode ON public.generated_music_tracks(mode);
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_suno_job ON public.generated_music_tracks(suno_job_id);
CREATE INDEX IF NOT EXISTS idx_generated_music_tracks_prompt_hash ON public.generated_music_tracks(openai_prompt_hash);

-- Harden RLS policies (owner-only access)
ALTER TABLE public.generated_music_tracks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own music tracks" ON public.generated_music_tracks;
  DROP POLICY IF EXISTS "Users can create their own music tracks" ON public.generated_music_tracks;
  DROP POLICY IF EXISTS "Users can update their own music tracks" ON public.generated_music_tracks;
  DROP POLICY IF EXISTS "Users can delete their own music tracks" ON public.generated_music_tracks;
  DROP POLICY IF EXISTS "dev_read_all_tracks" ON public.generated_music_tracks;
  DROP POLICY IF EXISTS "dev_insert_tracks" ON public.generated_music_tracks;
  DROP POLICY IF EXISTS "dev_update_tracks" ON public.generated_music_tracks;
  DROP POLICY IF EXISTS "dev_delete_tracks" ON public.generated_music_tracks;
END $$;

CREATE POLICY "Users select their generated music tracks"
  ON public.generated_music_tracks
  FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );

CREATE POLICY "Users insert their generated music tracks"
  ON public.generated_music_tracks
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );

CREATE POLICY "Users update their generated music tracks"
  ON public.generated_music_tracks
  FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );

CREATE POLICY "Users delete their generated music tracks"
  ON public.generated_music_tracks
  FOR DELETE
  USING (
    auth.role() = 'service_role'
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );

-- 3. Lyrics segments table aligned with generated tracks
ALTER TABLE public.lyrics_segments
  DROP CONSTRAINT IF EXISTS lyrics_segments_track_id_fkey;

ALTER TABLE public.lyrics_segments
  ADD COLUMN IF NOT EXISTS item_id uuid;

UPDATE public.lyrics_segments ls
SET item_id = COALESCE(
  ls.item_id,
  g.item_id
)
FROM public.generated_music_tracks g
WHERE ls.track_id = g.id;

ALTER TABLE public.lyrics_segments
  ALTER COLUMN item_id SET NOT NULL;

ALTER TABLE public.lyrics_segments
  ADD CONSTRAINT lyrics_segments_track_id_fkey
    FOREIGN KEY (track_id) REFERENCES public.generated_music_tracks(id) ON DELETE CASCADE;

ALTER TABLE public.lyrics_segments
  ADD CONSTRAINT lyrics_segments_item_id_fkey
    FOREIGN KEY (item_id) REFERENCES public.edn_items_immersive(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_lyrics_segments_track_idx ON public.lyrics_segments(track_id, idx);
CREATE INDEX IF NOT EXISTS idx_lyrics_segments_track_start ON public.lyrics_segments(track_id, start_ms);
CREATE INDEX IF NOT EXISTS idx_lyrics_segments_item ON public.lyrics_segments(item_id);

ALTER TABLE public.lyrics_segments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage their lyrics segments" ON public.lyrics_segments;

CREATE POLICY "Owners manage their lyrics segments"
  ON public.lyrics_segments
  USING (
    EXISTS (
      SELECT 1
      FROM public.generated_music_tracks g
      WHERE g.id = track_id
        AND (
          auth.role() = 'service_role'
          OR (auth.uid() IS NOT NULL AND auth.uid() = g.user_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.generated_music_tracks g
      WHERE g.id = track_id
        AND (
          auth.role() = 'service_role'
          OR (auth.uid() IS NOT NULL AND auth.uid() = g.user_id)
        )
    )
  );

-- 4. Alignment logs follow generated tracks
ALTER TABLE public.lyrics_alignment_logs
  DROP CONSTRAINT IF EXISTS lyrics_alignment_logs_track_id_fkey;

ALTER TABLE public.lyrics_alignment_logs
  ADD COLUMN IF NOT EXISTS item_id uuid;

UPDATE public.lyrics_alignment_logs l
SET item_id = COALESCE(
  l.item_id,
  g.item_id
)
FROM public.generated_music_tracks g
WHERE l.track_id = g.id;

ALTER TABLE public.lyrics_alignment_logs
  ALTER COLUMN item_id SET NOT NULL;

ALTER TABLE public.lyrics_alignment_logs
  ADD CONSTRAINT lyrics_alignment_logs_track_id_fkey
    FOREIGN KEY (track_id) REFERENCES public.generated_music_tracks(id) ON DELETE CASCADE;

ALTER TABLE public.lyrics_alignment_logs
  ADD CONSTRAINT lyrics_alignment_logs_item_id_fkey
    FOREIGN KEY (item_id) REFERENCES public.edn_items_immersive(id) ON DELETE CASCADE;

ALTER TABLE public.lyrics_alignment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners view their alignment logs" ON public.lyrics_alignment_logs;
DROP POLICY IF EXISTS "Owners insert alignment logs" ON public.lyrics_alignment_logs;

CREATE POLICY "Owners view their alignment logs"
  ON public.lyrics_alignment_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.generated_music_tracks g
      WHERE g.id = track_id
        AND (
          auth.role() = 'service_role'
          OR (auth.uid() IS NOT NULL AND auth.uid() = g.user_id)
        )
    )
  );

CREATE POLICY "Owners insert alignment logs"
  ON public.lyrics_alignment_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.generated_music_tracks g
      WHERE g.id = track_id
        AND (
          auth.role() = 'service_role'
          OR (auth.uid() IS NOT NULL AND auth.uid() = g.user_id)
        )
    )
  );

-- 5. Updated RPC to replace lyrics segments with stricter validation
CREATE OR REPLACE FUNCTION public.replace_lyrics_segments(
  p_track_id uuid,
  p_segments jsonb,
  p_log jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  segment jsonb;
  v_idx integer;
  v_start integer;
  v_end integer;
  v_text text;
  v_role text;
  v_segment_count integer := 0;
  v_item_id uuid;
  v_track_owner uuid;
BEGIN
  IF p_track_id IS NULL THEN
    RAISE EXCEPTION 'track_id is required';
  END IF;

  IF p_segments IS NULL OR jsonb_typeof(p_segments) <> 'array' THEN
    RAISE EXCEPTION 'segments payload must be a JSON array';
  END IF;

  IF jsonb_array_length(p_segments) = 0 THEN
    RAISE EXCEPTION 'segments payload cannot be empty';
  END IF;

  SELECT item_id, user_id
  INTO v_item_id, v_track_owner
  FROM public.generated_music_tracks
  WHERE id = p_track_id;

  IF v_item_id IS NULL THEN
    RAISE EXCEPTION 'track % does not exist', p_track_id;
  END IF;

  IF NOT (
    auth.role() = 'service_role'
    OR (auth.uid() IS NOT NULL AND auth.uid() = v_track_owner)
  ) THEN
    RAISE EXCEPTION 'permission denied for track %', p_track_id;
  END IF;

  DELETE FROM public.lyrics_segments WHERE track_id = p_track_id;

  FOR segment IN SELECT * FROM jsonb_array_elements(p_segments)
  LOOP
    v_idx := COALESCE((segment->>'idx')::integer, v_segment_count);
    v_start := GREATEST(0, COALESCE((segment->>'start_ms')::integer, 0));
    v_end := GREATEST(v_start, COALESCE((segment->>'end_ms')::integer, v_start));
    v_text := btrim(COALESCE(segment->>'text', ''));
    v_role := NULLIF(btrim(COALESCE(segment->>'role', '')), '');

    IF v_text = '' THEN
      CONTINUE;
    END IF;

    INSERT INTO public.lyrics_segments(track_id, item_id, idx, start_ms, end_ms, text, role)
    VALUES (p_track_id, v_item_id, v_idx, v_start, v_end, v_text, v_role);

    v_segment_count := v_segment_count + 1;
  END LOOP;

  IF COALESCE(jsonb_typeof(p_log), 'object') = 'object' THEN
    INSERT INTO public.lyrics_alignment_logs(
      track_id,
      item_id,
      run_at,
      duration_ms,
      segment_count,
      method,
      confidence,
      notes,
      metadata,
      created_by
    ) VALUES (
      p_track_id,
      v_item_id,
      COALESCE((p_log->>'run_at')::timestamptz, now()),
      (p_log->>'duration_ms')::integer,
      COALESCE((p_log->>'segment_count')::integer, v_segment_count),
      COALESCE(p_log->>'method', 'heuristic_v1'),
      (p_log->>'confidence')::numeric,
      p_log->>'notes',
      COALESCE(p_log->'metadata', '{}'::jsonb),
      NULLIF(p_log->>'created_by', '')::uuid
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.replace_lyrics_segments(uuid, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.replace_lyrics_segments(uuid, jsonb, jsonb) TO service_role;
