-- Enable Row Level Security on reference and user data tables
ALTER TABLE public.items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items            FORCE  ROW LEVEL SECURITY;

ALTER TABLE public.item_competences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_competences FORCE  ROW LEVEL SECURITY;

ALTER TABLE public.generated_music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_music_tracks FORCE  ROW LEVEL SECURITY;

ALTER TABLE public.lyrics_segments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyrics_segments        FORCE  ROW LEVEL SECURITY;
