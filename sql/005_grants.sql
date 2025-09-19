-- Minimal privileges for Supabase roles with RLS enforced
GRANT SELECT ON public.items, public.item_competences TO authenticated;
-- GRANT SELECT ON public.items, public.item_competences TO anon; -- optional public read access

GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_music_tracks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lyrics_segments        TO authenticated;

GRANT ALL ON public.generated_music_tracks, public.lyrics_segments TO service_role;
GRANT ALL ON public.items, public.item_competences                TO service_role;
