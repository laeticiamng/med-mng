-- =====================================================
-- PRODUCT REVIEWS SYSTEM
-- =====================================================
-- Complete review and rating system for products
--
-- Addresses: productReviews feature disabled
-- Impact: Enables user reviews, ratings, and social proof
--
-- Created: 2025-11-16
-- Tables: 3 (product_reviews, review_votes, review_media)
-- RLS Policies: 14
-- Functions: 4
-- =====================================================

-- =====================================================
-- 1. PRODUCT REVIEWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Product & User
  product_id TEXT NOT NULL, -- External product ID (Shopify, etc.)
  product_type TEXT DEFAULT 'shopify' CHECK (product_type IN ('shopify', 'course', 'subscription', 'other')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 200),
  review_text TEXT NOT NULL CHECK (length(review_text) >= 10),

  -- Detailed Ratings (optional)
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),

  -- Metadata
  purchase_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true, -- Admin moderation

  -- Engagement
  helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
  unhelpful_count INTEGER DEFAULT 0 CHECK (unhelpful_count >= 0),

  -- Response
  seller_response TEXT,
  seller_responded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  edited_at TIMESTAMPTZ,

  -- One review per user per product
  UNIQUE(user_id, product_id, product_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product
  ON public.product_reviews(product_id, product_type);

CREATE INDEX IF NOT EXISTS idx_product_reviews_user
  ON public.product_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_product_reviews_rating
  ON public.product_reviews(rating DESC);

CREATE INDEX IF NOT EXISTS idx_product_reviews_approved
  ON public.product_reviews(is_approved, created_at DESC)
  WHERE is_approved = true;

CREATE INDEX IF NOT EXISTS idx_product_reviews_verified
  ON public.product_reviews(purchase_verified)
  WHERE purchase_verified = true;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_product_reviews_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();

  IF OLD.review_text IS DISTINCT FROM NEW.review_text OR OLD.title IS DISTINCT FROM NEW.title THEN
    NEW.edited_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_reviews_timestamp ON public.product_reviews;

CREATE TRIGGER trigger_update_product_reviews_timestamp
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_reviews_timestamp();

COMMENT ON TABLE public.product_reviews IS 'User reviews and ratings for products';
COMMENT ON COLUMN public.product_reviews.purchase_verified IS 'Whether user actually purchased the product';
COMMENT ON COLUMN public.product_reviews.seller_response IS 'Seller/admin response to review';

-- =====================================================
-- 2. REVIEW VOTES TABLE
-- =====================================================
-- Track helpful/unhelpful votes on reviews

CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at TIMESTAMPTZ DEFAULT now(),

  -- One vote per user per review
  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review
  ON public.review_votes(review_id);

CREATE INDEX IF NOT EXISTS idx_review_votes_user
  ON public.review_votes(user_id);

COMMENT ON TABLE public.review_votes IS 'Helpful/unhelpful votes on product reviews';

-- Auto-update review counts when votes change
CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'helpful' THEN
      UPDATE public.product_reviews
      SET helpful_count = helpful_count + 1
      WHERE id = NEW.review_id;
    ELSE
      UPDATE public.product_reviews
      SET unhelpful_count = unhelpful_count + 1
      WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'helpful' THEN
      UPDATE public.product_reviews
      SET helpful_count = GREATEST(0, helpful_count - 1)
      WHERE id = OLD.review_id;
    ELSE
      UPDATE public.product_reviews
      SET unhelpful_count = GREATEST(0, unhelpful_count - 1)
      WHERE id = OLD.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.vote_type != NEW.vote_type THEN
    -- Vote type changed
    IF OLD.vote_type = 'helpful' THEN
      UPDATE public.product_reviews
      SET
        helpful_count = GREATEST(0, helpful_count - 1),
        unhelpful_count = unhelpful_count + 1
      WHERE id = NEW.review_id;
    ELSE
      UPDATE public.product_reviews
      SET
        helpful_count = helpful_count + 1,
        unhelpful_count = GREATEST(0, unhelpful_count - 1)
      WHERE id = NEW.review_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_review_vote_counts ON public.review_votes;

CREATE TRIGGER trigger_update_review_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_vote_counts();

-- =====================================================
-- 3. REVIEW MEDIA TABLE
-- =====================================================
-- Photos/videos attached to reviews

CREATE TABLE IF NOT EXISTS public.review_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_media_review
  ON public.review_media(review_id, display_order);

COMMENT ON TABLE public.review_media IS 'Photos and videos attached to product reviews';

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_media ENABLE ROW LEVEL SECURITY;

-- ====== PRODUCT_REVIEWS POLICIES ======

-- Everyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
  ON public.product_reviews
  FOR SELECT
  USING (is_approved = true);

-- Users can view their own reviews (even if not approved)
CREATE POLICY "Users view own reviews"
  ON public.product_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create reviews
CREATE POLICY "Users create reviews"
  ON public.product_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users update own reviews"
  ON public.product_reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users delete own reviews"
  ON public.product_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all reviews
CREATE POLICY "Admins view all reviews"
  ON public.product_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- Admins can moderate reviews
CREATE POLICY "Admins moderate reviews"
  ON public.product_reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name IN ('admin', 'moderator')
    )
  );

-- ====== REVIEW_VOTES POLICIES ======

-- Users can view all votes
CREATE POLICY "Users view votes"
  ON public.review_votes
  FOR SELECT
  USING (true);

-- Users can create votes
CREATE POLICY "Users create votes"
  ON public.review_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users update own votes"
  ON public.review_votes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users delete own votes"
  ON public.review_votes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====== REVIEW_MEDIA POLICIES ======

-- Everyone can view media from approved reviews
CREATE POLICY "Anyone view approved review media"
  ON public.review_media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.product_reviews
      WHERE id = review_media.review_id
        AND is_approved = true
    )
  );

-- Users can add media to their own reviews
CREATE POLICY "Users add own review media"
  ON public.review_media
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_reviews
      WHERE id = review_media.review_id
        AND user_id = auth.uid()
    )
  );

-- Users can delete their own review media
CREATE POLICY "Users delete own review media"
  ON public.review_media
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.product_reviews
      WHERE id = review_media.review_id
        AND user_id = auth.uid()
    )
  );

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Get product review statistics
CREATE OR REPLACE FUNCTION get_product_review_stats(p_product_id TEXT, p_product_type TEXT DEFAULT 'shopify')
RETURNS TABLE (
  total_reviews BIGINT,
  average_rating NUMERIC,
  rating_distribution JSONB,
  verified_purchases BIGINT,
  featured_reviews BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    ROUND(AVG(rating), 2),
    jsonb_build_object(
      '5', COUNT(*) FILTER (WHERE rating = 5),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '1', COUNT(*) FILTER (WHERE rating = 1)
    ),
    COUNT(*) FILTER (WHERE purchase_verified = true)::BIGINT,
    COUNT(*) FILTER (WHERE is_featured = true)::BIGINT
  FROM public.product_reviews
  WHERE product_id = p_product_id
    AND product_type = p_product_type
    AND is_approved = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_product_review_stats(TEXT, TEXT) TO authenticated, anon;

-- Get reviews for a product
CREATE OR REPLACE FUNCTION get_product_reviews(
  p_product_id TEXT,
  p_product_type TEXT DEFAULT 'shopify',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_sort_by TEXT DEFAULT 'helpful' -- 'helpful', 'recent', 'rating_high', 'rating_low'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  rating INTEGER,
  title TEXT,
  review_text TEXT,
  purchase_verified BOOLEAN,
  is_featured BOOLEAN,
  helpful_count INTEGER,
  unhelpful_count INTEGER,
  seller_response TEXT,
  created_at TIMESTAMPTZ,
  media_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.id,
    pr.user_id,
    u.email,
    pr.rating,
    pr.title,
    pr.review_text,
    pr.purchase_verified,
    pr.is_featured,
    pr.helpful_count,
    pr.unhelpful_count,
    pr.seller_response,
    pr.created_at,
    (SELECT COUNT(*) FROM public.review_media WHERE review_id = pr.id)::BIGINT
  FROM public.product_reviews pr
  LEFT JOIN auth.users u ON pr.user_id = u.id
  WHERE pr.product_id = p_product_id
    AND pr.product_type = p_product_type
    AND pr.is_approved = true
  ORDER BY
    CASE
      WHEN p_sort_by = 'helpful' THEN pr.helpful_count
      WHEN p_sort_by = 'rating_high' THEN pr.rating
      WHEN p_sort_by = 'rating_low' THEN -pr.rating
      ELSE 0
    END DESC,
    CASE WHEN p_sort_by = 'recent' THEN pr.created_at END DESC NULLS LAST,
    pr.is_featured DESC,
    pr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_product_reviews(TEXT, TEXT, INTEGER, INTEGER, TEXT) TO authenticated, anon;

-- Toggle review vote
CREATE OR REPLACE FUNCTION toggle_review_vote(
  p_review_id UUID,
  p_vote_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_existing_vote TEXT;
  v_result JSONB;
BEGIN
  -- Check existing vote
  SELECT vote_type INTO v_existing_vote
  FROM public.review_votes
  WHERE review_id = p_review_id
    AND user_id = auth.uid();

  IF v_existing_vote IS NOT NULL THEN
    IF v_existing_vote = p_vote_type THEN
      -- Remove vote
      DELETE FROM public.review_votes
      WHERE review_id = p_review_id
        AND user_id = auth.uid();

      v_result := jsonb_build_object('action', 'removed', 'vote_type', p_vote_type);
    ELSE
      -- Change vote
      UPDATE public.review_votes
      SET vote_type = p_vote_type
      WHERE review_id = p_review_id
        AND user_id = auth.uid();

      v_result := jsonb_build_object('action', 'changed', 'vote_type', p_vote_type);
    END IF;
  ELSE
    -- Add new vote
    INSERT INTO public.review_votes (review_id, user_id, vote_type)
    VALUES (p_review_id, auth.uid(), p_vote_type);

    v_result := jsonb_build_object('action', 'added', 'vote_type', p_vote_type);
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION toggle_review_vote(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION get_product_review_stats IS 'Returns review statistics for a product';
COMMENT ON FUNCTION get_product_reviews IS 'Returns paginated reviews for a product';
COMMENT ON FUNCTION toggle_review_vote IS 'Toggles helpful/unhelpful vote on a review';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('product_reviews', 'review_votes', 'review_media')
  ) THEN
    RAISE EXCEPTION 'Review tables not created';
  END IF;

  RAISE NOTICE '✅ Product reviews system created successfully';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- ✅ 3 tables for complete review system
-- ✅ 14 RLS policies for security
-- ✅ 4 helper functions
-- ✅ Auto-update triggers for vote counts
-- ✅ Support for photos/videos
-- ✅ Seller responses
-- ✅ Review moderation
-- =====================================================
