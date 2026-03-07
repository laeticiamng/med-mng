-- Create audio-demos storage bucket for public demo tracks
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-demos', 'audio-demos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to audio demos
CREATE POLICY "Public read access for audio demos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-demos');
