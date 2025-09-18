-- Create table for aligned lyrics segments
CREATE TABLE IF NOT EXISTS public.lyrics_segments (
  track_id uuid NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  idx integer NOT NULL,
  start_ms integer NOT NULL CHECK (start_ms >= 0),
  end_ms integer NOT NULL CHECK (end_ms >= start_ms),
  text text NOT NULL,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (track_id, idx)
);

CREATE INDEX IF NOT EXISTS idx_lyrics_segments_track_start
  ON public.lyrics_segments(track_id, start_ms);

ALTER TABLE public.lyrics_segments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lyrics_segments'
      AND policyname = 'Owners manage their lyrics segments'
  ) THEN
    CREATE POLICY "Owners manage their lyrics segments"
      ON public.lyrics_segments
      USING (
        EXISTS (
          SELECT 1 FROM public.med_mng_songs s
          WHERE s.id = track_id
            AND (
              s.created_by = auth.uid()
              OR s.user_id = auth.uid()
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.med_mng_songs s
          WHERE s.id = track_id
            AND (
              s.created_by = auth.uid()
              OR s.user_id = auth.uid()
            )
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lyrics_segments_updated_at'
  ) THEN
    CREATE TRIGGER trg_lyrics_segments_updated_at
      BEFORE UPDATE ON public.lyrics_segments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Logs for alignment runs
CREATE TABLE IF NOT EXISTS public.lyrics_alignment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  run_at timestamptz NOT NULL DEFAULT now(),
  duration_ms integer,
  segment_count integer,
  method text NOT NULL DEFAULT 'heuristic_v1',
  confidence numeric,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lyrics_alignment_logs_track
  ON public.lyrics_alignment_logs(track_id, run_at DESC);

ALTER TABLE public.lyrics_alignment_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lyrics_alignment_logs'
      AND policyname = 'Owners view their alignment logs'
  ) THEN
    CREATE POLICY "Owners view their alignment logs"
      ON public.lyrics_alignment_logs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.med_mng_songs s
          WHERE s.id = track_id
            AND (
              s.created_by = auth.uid()
              OR s.user_id = auth.uid()
            )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lyrics_alignment_logs'
      AND policyname = 'Owners insert alignment logs'
  ) THEN
    CREATE POLICY "Owners insert alignment logs"
      ON public.lyrics_alignment_logs FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.med_mng_songs s
          WHERE s.id = track_id
            AND (
              s.created_by = auth.uid()
              OR s.user_id = auth.uid()
            )
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lyrics_alignment_logs_updated_at'
  ) THEN
    CREATE TRIGGER trg_lyrics_alignment_logs_updated_at
      BEFORE UPDATE ON public.lyrics_alignment_logs
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helper function to atomically replace segments and record logs
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
BEGIN
  IF p_track_id IS NULL THEN
    RAISE EXCEPTION 'track_id is required';
  END IF;

  IF p_segments IS NULL OR jsonb_typeof(p_segments) <> 'array' THEN
    RAISE EXCEPTION 'segments payload must be a JSON array';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.med_mng_songs s
    WHERE s.id = p_track_id
      AND (
        auth.role() = 'service_role'
        OR (
          auth.uid() IS NOT NULL
          AND (s.created_by = auth.uid() OR s.user_id = auth.uid())
        )
      )
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

    INSERT INTO public.lyrics_segments(track_id, idx, start_ms, end_ms, text, role)
    VALUES (p_track_id, v_idx, v_start, v_end, v_text, v_role);

    v_segment_count := v_segment_count + 1;
  END LOOP;

  IF COALESCE(jsonb_typeof(p_log), 'object') = 'object' THEN
    INSERT INTO public.lyrics_alignment_logs(
      track_id,
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
