-- Table pour le partage de ressources communautaires
CREATE TABLE IF NOT EXISTS public.shared_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL DEFAULT 'document',
  url TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  author_id UUID NOT NULL,
  likes_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Likes sur les ressources
CREATE TABLE IF NOT EXISTS public.resource_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.shared_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(resource_id, user_id)
);

-- Signets/Favoris sur les ressources
CREATE TABLE IF NOT EXISTS public.resource_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.shared_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(resource_id, user_id)
);

-- Commentaires sur les ressources
CREATE TABLE IF NOT EXISTS public.resource_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.shared_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_resources
CREATE POLICY "Anyone can view approved resources"
  ON public.shared_resources FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Authenticated users can create resources"
  ON public.shared_resources FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their resources"
  ON public.shared_resources FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their resources"
  ON public.shared_resources FOR DELETE
  USING (auth.uid() = author_id);

-- RLS Policies for resource_likes
CREATE POLICY "Anyone can view likes"
  ON public.resource_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON public.resource_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON public.resource_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for resource_bookmarks
CREATE POLICY "Users can view their bookmarks"
  ON public.resource_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can bookmark"
  ON public.resource_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove bookmarks"
  ON public.resource_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for resource_comments
CREATE POLICY "Anyone can view comments"
  ON public.resource_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON public.resource_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their comments"
  ON public.resource_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments"
  ON public.resource_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Données de démonstration
INSERT INTO public.shared_resources (title, description, resource_type, url, tags, author_id, likes_count, downloads_count, views_count, comments_count)
VALUES
  ('Fiches Cardiologie Complètes', 'Résumé complet des pathologies cardiaques pour l''EDN', 'pdf', 'https://example.com/cardio.pdf', ARRAY['cardiologie', 'EDN', 'fiches'], '00000000-0000-0000-0000-000000000001', 156, 89, 342, 12),
  ('Schémas Anatomie - Neurologie', 'Illustrations détaillées du système nerveux', 'image', 'https://example.com/neuro.png', ARRAY['neurologie', 'anatomie', 'schémas'], '00000000-0000-0000-0000-000000000002', 234, 167, 521, 23),
  ('Tableau des Antibiotiques', 'Récapitulatif des antibiotiques par classe et spectre', 'spreadsheet', 'https://example.com/antibio.xlsx', ARRAY['infectiologie', 'antibiotiques', 'pharmacologie'], '00000000-0000-0000-0000-000000000003', 312, 245, 678, 34),
  ('Cours Vidéo - ECG Débutant', 'Lien vers cours complet d''interprétation ECG', 'link', 'https://example.com/ecg-course', ARRAY['ECG', 'cardiologie', 'vidéo'], '00000000-0000-0000-0000-000000000004', 89, 0, 234, 8);