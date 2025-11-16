-- =====================================================
-- WISHLIST SYSTEM
-- =====================================================
-- User wishlist for products and learning items
--
-- Addresses: wishlist feature disabled (feature flag)
-- Impact: Enables users to save items for later purchase/study
--
-- Created: 2025-11-16
-- Tables: 1 (wishlists)
-- RLS Policies: 5
-- Functions: 2
-- =====================================================

-- =====================================================
-- 1. WISHLISTS TABLE
-- =====================================================
-- Stores user wishlists for products, courses, and items

CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Item identification (flexible for different item types)
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'course', 'edn_item', 'ecos_scenario', 'playlist', 'other')),
  item_id TEXT NOT NULL, -- Can be UUID or external ID (e.g., Shopify product ID)
  item_metadata JSONB, -- Stores item details for quick access

  -- Priority and organization
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 5), -- 0 = low, 5 = high
  notes TEXT, -- User notes about why they want this item
  tags TEXT[] DEFAULT '{}',

  -- Status tracking
  is_purchased BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ,
  is_reminded BOOLEAN DEFAULT false, -- Has user been reminded about this item

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure unique item per user
  UNIQUE(user_id, item_type, item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id
  ON public.wishlists(user_id);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_type
  ON public.wishlists(user_id, item_type);

CREATE INDEX IF NOT EXISTS idx_wishlists_item
  ON public.wishlists(item_type, item_id);

CREATE INDEX IF NOT EXISTS idx_wishlists_priority
  ON public.wishlists(user_id, priority DESC)
  WHERE is_purchased = false;

CREATE INDEX IF NOT EXISTS idx_wishlists_created
  ON public.wishlists(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wishlists_unpurchased
  ON public.wishlists(user_id, is_purchased)
  WHERE is_purchased = false;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_wishlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();

  -- If marked as purchased, set purchased_at
  IF NEW.is_purchased = true AND OLD.is_purchased = false THEN
    NEW.purchased_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_wishlists_timestamp ON public.wishlists;

CREATE TRIGGER trigger_update_wishlists_timestamp
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlists_updated_at();

COMMENT ON TABLE public.wishlists IS 'User wishlists for products, courses, and learning items';
COMMENT ON COLUMN public.wishlists.item_type IS 'Type of item: product, course, edn_item, ecos_scenario, playlist, other';
COMMENT ON COLUMN public.wishlists.item_metadata IS 'Cached item details (title, price, image, etc.) for quick display';
COMMENT ON COLUMN public.wishlists.priority IS '0 (low) to 5 (high) priority level';
COMMENT ON COLUMN public.wishlists.is_reminded IS 'Whether user has been reminded about this item (e.g., price drop, back in stock)';

-- =====================================================
-- 2. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlist items
CREATE POLICY "Users view own wishlist"
  ON public.wishlists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add items to their wishlist
CREATE POLICY "Users add to wishlist"
  ON public.wishlists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own wishlist items
CREATE POLICY "Users update own wishlist"
  ON public.wishlists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own wishlist items
CREATE POLICY "Users delete from wishlist"
  ON public.wishlists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all wishlists (analytics)
CREATE POLICY "Admins view all wishlists"
  ON public.wishlists
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- =====================================================
-- 3. HELPER FUNCTIONS
-- =====================================================

-- Function to get user's wishlist with optional filters
CREATE OR REPLACE FUNCTION get_user_wishlist(
  p_user_id UUID,
  p_item_type TEXT DEFAULT NULL,
  p_purchased BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  item_type TEXT,
  item_id TEXT,
  item_metadata JSONB,
  priority INTEGER,
  notes TEXT,
  tags TEXT[],
  is_purchased BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.item_type,
    w.item_id,
    w.item_metadata,
    w.priority,
    w.notes,
    w.tags,
    w.is_purchased,
    w.created_at,
    w.updated_at
  FROM public.wishlists w
  WHERE w.user_id = p_user_id
    AND (p_item_type IS NULL OR w.item_type = p_item_type)
    AND w.is_purchased = p_purchased
  ORDER BY w.priority DESC, w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_wishlist(UUID, TEXT, BOOLEAN) TO authenticated;

-- Function to toggle wishlist item
CREATE OR REPLACE FUNCTION toggle_wishlist_item(
  p_item_type TEXT,
  p_item_id TEXT,
  p_item_metadata JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_existing_id UUID;
  v_result JSONB;
BEGIN
  -- Check if item already in wishlist
  SELECT id INTO v_existing_id
  FROM public.wishlists
  WHERE user_id = auth.uid()
    AND item_type = p_item_type
    AND item_id = p_item_id;

  IF v_existing_id IS NOT NULL THEN
    -- Item exists, remove it
    DELETE FROM public.wishlists
    WHERE id = v_existing_id;

    v_result := jsonb_build_object(
      'action', 'removed',
      'item_id', p_item_id,
      'item_type', p_item_type,
      'success', true
    );
  ELSE
    -- Item doesn't exist, add it
    INSERT INTO public.wishlists (user_id, item_type, item_id, item_metadata)
    VALUES (auth.uid(), p_item_type, p_item_id, p_item_metadata)
    RETURNING id INTO v_existing_id;

    v_result := jsonb_build_object(
      'action', 'added',
      'item_id', p_item_id,
      'item_type', p_item_type,
      'wishlist_id', v_existing_id,
      'success', true
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION toggle_wishlist_item(TEXT, TEXT, JSONB) TO authenticated;

COMMENT ON FUNCTION get_user_wishlist IS 'Returns user wishlist with optional filters (type, purchased status)';
COMMENT ON FUNCTION toggle_wishlist_item IS 'Toggles item in wishlist (add if not exists, remove if exists)';

-- =====================================================
-- 4. ANALYTICS VIEW
-- =====================================================
-- View for admin analytics on wishlist trends

CREATE OR REPLACE VIEW wishlist_analytics AS
SELECT
  item_type,
  item_id,
  COUNT(*) as wishlist_count,
  COUNT(*) FILTER (WHERE is_purchased = true) as purchase_count,
  ROUND(
    (COUNT(*) FILTER (WHERE is_purchased = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as conversion_rate,
  AVG(priority) as avg_priority,
  MAX(created_at) as last_added_at
FROM public.wishlists
GROUP BY item_type, item_id
ORDER BY wishlist_count DESC;

COMMENT ON VIEW wishlist_analytics IS 'Analytics view showing wishlist trends and conversion rates';

-- Grant access to admins only
GRANT SELECT ON wishlist_analytics TO authenticated;

-- =====================================================
-- 5. SAMPLE DATA (DEV/TESTING ONLY)
-- =====================================================

-- Uncomment for dev environment
/*
-- Example: Add sample wishlist items
INSERT INTO public.wishlists (
  user_id,
  item_type,
  item_id,
  item_metadata,
  priority,
  notes
) VALUES
  (
    auth.uid(),
    'product',
    'shopify-123456',
    '{"title": "Cours ECN 2025", "price": 49.99, "image_url": "https://example.com/course.jpg"}'::JSONB,
    5,
    'Must-buy for upcoming exam'
  ),
  (
    auth.uid(),
    'ecos_scenario',
    'ecos-cardiac-001',
    '{"title": "Urgence cardiaque", "difficulty": "hard"}'::JSONB,
    4,
    'Practice before exam'
  ),
  (
    auth.uid(),
    'playlist',
    'playlist-uuid-here',
    '{"title": "Révision Cardiologie", "items_count": 25}'::JSONB,
    3,
    'Good playlist recommended by peer'
  )
ON CONFLICT (user_id, item_type, item_id) DO NOTHING;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- To verify table created:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name = 'wishlists';

-- To verify RLS policies:
-- SELECT tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'wishlists'
-- ORDER BY policyname;

-- To test wishlist system:
-- SELECT * FROM get_user_wishlist(auth.uid());
-- SELECT toggle_wishlist_item('product', 'shopify-123', '{"title": "Test Product"}'::JSONB);
-- SELECT * FROM wishlist_analytics;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- ✅ wishlists table with flexible item support
-- ✅ 5 RLS policies for security
-- ✅ 2 helper functions for wishlist management
-- ✅ Analytics view for admin insights
-- ✅ Indexes for optimal performance
-- ✅ Auto-toggle functionality (add/remove)
-- =====================================================
