-- ============================================================================
-- Posts and Comments Tables
-- Migration: 20251114130000
-- Description: Add posts, comments, and related tables for community features
-- ============================================================================

-- ============================================================================
-- TABLE: posts
-- Description: User-created posts for the community feed
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT, -- Preview text for listings
  tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of tags
  thumbnail_url TEXT, -- Featured image URL
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT non_empty_title CHECK (length(trim(title)) > 0),
  CONSTRAINT non_empty_content CHECK (length(trim(content)) > 0)
);

-- Create indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);

-- Enable RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published posts"
  ON public.posts FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);
CREATE POLICY "Users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: post_comments
-- Description: Comments on posts with nested reply support
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT non_empty_comment_content CHECK (length(trim(content)) > 0)
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at DESC);

-- Enable RLS for comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments on published posts"
  ON public.post_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_comments.post_id
      AND (posts.status = 'published' OR auth.uid() = posts.user_id)
    )
  );
CREATE POLICY "Users can create comments"
  ON public.post_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_comments.post_id
      AND posts.status = 'published'
    )
  );
CREATE POLICY "Users can update their own comments"
  ON public.post_comments FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments"
  ON public.post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: post_likes
-- Description: Track likes on posts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(post_id, user_id)
);

-- Create indexes for likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- Enable RLS for likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes on published posts"
  ON public.post_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_likes.post_id
      AND posts.status = 'published'
    )
  );
CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_likes.post_id
      AND posts.status = 'published'
    )
  );
CREATE POLICY "Users can unlike posts"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: comment_likes
-- Description: Track likes on comments
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(comment_id, user_id)
);

-- Create indexes for comment likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- Enable RLS for comment likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (true);
CREATE POLICY "Users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike comments"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update post comment count when comment is added/deleted
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comment_count = comment_count + 1,
        updated_at = now()
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comment_count = GREATEST(comment_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update comment count on posts
CREATE TRIGGER update_post_comment_count_trigger
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_comment_count();

-- Function: Update post like count when like is added/removed
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET like_count = like_count + 1,
        updated_at = now()
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET like_count = GREATEST(like_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update like count on posts
CREATE TRIGGER update_post_like_count_trigger
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_post_like_count();

-- Function: Update comment like count when like is added/removed
CREATE OR REPLACE FUNCTION public.update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.post_comments
    SET like_count = like_count + 1,
        updated_at = now()
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.post_comments
    SET like_count = GREATEST(like_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update like count on comments
CREATE TRIGGER update_comment_like_count_trigger
AFTER INSERT OR DELETE ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_like_count();

-- Function: Set published_at when status changes to published
CREATE OR REPLACE FUNCTION public.set_post_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-set published_at
CREATE TRIGGER set_post_published_at_trigger
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.set_post_published_at();
