-- Row Level Security policies for generated music tracks
DROP POLICY IF EXISTS gmt_select ON public.generated_music_tracks;
CREATE POLICY gmt_select ON public.generated_music_tracks
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS gmt_insert ON public.generated_music_tracks;
CREATE POLICY gmt_insert ON public.generated_music_tracks
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS gmt_update ON public.generated_music_tracks;
CREATE POLICY gmt_update ON public.generated_music_tracks
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS gmt_delete ON public.generated_music_tracks;
CREATE POLICY gmt_delete ON public.generated_music_tracks
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());
