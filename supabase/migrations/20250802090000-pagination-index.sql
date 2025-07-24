-- Add indexes for pagination performance
CREATE INDEX IF NOT EXISTS idx_med_mng_songs_created_at ON public.med_mng_songs(created_at);
CREATE INDEX IF NOT EXISTS idx_med_mng_user_songs_created_at ON public.med_mng_user_songs(created_at);
