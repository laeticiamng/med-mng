-- Table pour les favoris des items EDN
CREATE TABLE IF NOT EXISTS public.user_edn_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_code TEXT NOT NULL,
  item_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_code)
);

-- Enable RLS
ALTER TABLE public.user_edn_favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own favorites" 
ON public.user_edn_favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.user_edn_favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.user_edn_favorites FOR DELETE 
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_edn_favorites_user ON public.user_edn_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_edn_favorites_item ON public.user_edn_favorites(item_code);