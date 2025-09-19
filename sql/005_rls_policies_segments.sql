-- Row Level Security policies for lyrics segments linked to tracks
DROP POLICY IF EXISTS ls_select ON public.lyrics_segments;
CREATE POLICY ls_select ON public.lyrics_segments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.generated_music_tracks t
    WHERE t.id = track_id AND t.owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS ls_mut ON public.lyrics_segments;
CREATE POLICY ls_mut ON public.lyrics_segments
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.generated_music_tracks t
    WHERE t.id = track_id AND t.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.generated_music_tracks t
    WHERE t.id = track_id AND t.owner_id = auth.uid()
  ));
