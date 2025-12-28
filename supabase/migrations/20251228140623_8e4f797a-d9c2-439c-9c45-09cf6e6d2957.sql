-- Table pour les notes personnelles sur les items EDN
CREATE TABLE IF NOT EXISTS public.user_edn_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_code TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_code)
);

-- Enable RLS
ALTER TABLE public.user_edn_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notes" 
ON public.user_edn_notes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
ON public.user_edn_notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
ON public.user_edn_notes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
ON public.user_edn_notes FOR DELETE 
USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_edn_notes_user ON public.user_edn_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_edn_notes_item ON public.user_edn_notes(item_code);

-- Trigger pour updated_at
CREATE TRIGGER update_user_edn_notes_updated_at
BEFORE UPDATE ON public.user_edn_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();