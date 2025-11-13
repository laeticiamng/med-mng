-- Create table for page notes and comments
CREATE TABLE IF NOT EXISTS public.page_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_path TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for page notes
CREATE POLICY "Users can view their own page notes"
  ON public.page_notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own page notes"
  ON public.page_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own page notes"
  ON public.page_notes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own page notes"
  ON public.page_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_page_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_page_notes_updated_at
  BEFORE UPDATE ON public.page_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_page_notes_updated_at();

-- Create indexes for faster queries
CREATE INDEX idx_page_notes_user_id ON public.page_notes(user_id);
CREATE INDEX idx_page_notes_page_path ON public.page_notes(user_id, page_path);
CREATE INDEX idx_page_notes_pinned ON public.page_notes(user_id, is_pinned);

-- Enable realtime for page notes
ALTER TABLE public.page_notes REPLICA IDENTITY FULL;