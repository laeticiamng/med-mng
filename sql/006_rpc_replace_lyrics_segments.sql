-- Create log table if it does not exist
CREATE TABLE IF NOT EXISTS public.lyrics_segments_log (
  id bigserial PRIMARY KEY,
  track_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  segment_count int NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Main RPC definition
CREATE OR REPLACE FUNCTION public.replace_lyrics_segments(
  p_track_id uuid,
  p_segments jsonb,
  p_log jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  v_owner uuid;
  v_item uuid;
  v_count int;
  seg jsonb;
  s_idx int;
  s_start int;
  s_end int;
  s_text text;
  s_role text;
BEGIN
  -- 1) Minimum input validation
  IF p_track_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_TRACK_ID';
  END IF;

  IF p_segments IS NULL OR jsonb_typeof(p_segments) <> 'array' THEN
    RAISE EXCEPTION 'INVALID_SEGMENTS';
  END IF;

  v_count := jsonb_array_length(p_segments);
  IF v_count = 0 THEN
    RAISE EXCEPTION 'EMPTY_SEGMENTS';
  END IF;

  -- 2) Check ownership and retrieve related item
  SELECT owner_id, item_id
    INTO v_owner, v_item
  FROM public.generated_music_tracks
  WHERE id = p_track_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'TRACK_NOT_FOUND';
  END IF;

  IF v_owner <> auth.uid() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  -- 3) Quick payload validation
  FOR seg IN SELECT * FROM jsonb_array_elements(p_segments) LOOP
    s_idx   := NULLIF(seg->>'idx','')::int;
    s_start := NULLIF(seg->>'start_ms','')::int;
    s_end   := NULLIF(seg->>'end_ms','')::int;
    s_text  := seg->>'text';
    s_role  := seg->>'role';

    IF s_idx IS NULL OR s_idx < 0 THEN
      RAISE EXCEPTION 'INVALID_IDX';
    END IF;
    IF s_start IS NULL OR s_end IS NULL OR s_end <= s_start THEN
      RAISE EXCEPTION 'INVALID_TIMECODE';
    END IF;
    IF s_text IS NULL OR length(trim(s_text)) = 0 THEN
      RAISE EXCEPTION 'EMPTY_TEXT';
    END IF;
  END LOOP;

  -- 4) Atomic replacement
  PERFORM 1;
  BEGIN
    DELETE FROM public.lyrics_segments WHERE track_id = p_track_id;

    INSERT INTO public.lyrics_segments(track_id, item_id, idx, start_ms, end_ms, text, role)
    SELECT p_track_id, v_item,
           (seg->>'idx')::int,
           (seg->>'start_ms')::int,
           (seg->>'end_ms')::int,
           (seg->>'text')::text,
           NULLIF(seg->>'role','')
    FROM jsonb_array_elements(p_segments) seg;

    INSERT INTO public.lyrics_segments_log(track_id, owner_id, segment_count, meta)
    VALUES (p_track_id, v_owner, v_count, COALESCE(p_log, '{}'::jsonb));
  EXCEPTION WHEN OTHERS THEN
    RAISE;
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.replace_lyrics_segments(uuid, jsonb, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.replace_lyrics_segments(uuid, jsonb, jsonb) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.replace_lyrics_segments(uuid, jsonb, jsonb) TO service_role;
