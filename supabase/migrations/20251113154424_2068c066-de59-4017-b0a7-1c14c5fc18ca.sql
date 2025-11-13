-- Create table for template comments and ratings
CREATE TABLE IF NOT EXISTS public.template_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for template application history
CREATE TABLE IF NOT EXISTS public.template_application_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filters_applied JSONB NOT NULL,
  results_count INTEGER,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for template favorites
CREATE TABLE IF NOT EXISTS public.template_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.template_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_application_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_comments
CREATE POLICY "Users can view comments on templates they have access to"
ON public.template_comments FOR SELECT
USING (true);

CREATE POLICY "Users can create comments on templates"
ON public.template_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.template_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.template_comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for template_application_history
CREATE POLICY "Users can view their own application history"
ON public.template_application_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create application history entries"
ON public.template_application_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for template_favorites
CREATE POLICY "Users can view their own favorites"
ON public.template_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
ON public.template_favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
ON public.template_favorites FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_template_comments_template_id ON public.template_comments(template_id);
CREATE INDEX idx_template_comments_user_id ON public.template_comments(user_id);
CREATE INDEX idx_template_application_history_template_id ON public.template_application_history(template_id);
CREATE INDEX idx_template_application_history_user_id ON public.template_application_history(user_id);
CREATE INDEX idx_template_favorites_template_id ON public.template_favorites(template_id);
CREATE INDEX idx_template_favorites_user_id ON public.template_favorites(user_id);

-- Create trigger for automatic timestamp updates on comments
CREATE TRIGGER update_template_comments_updated_at
BEFORE UPDATE ON public.template_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();