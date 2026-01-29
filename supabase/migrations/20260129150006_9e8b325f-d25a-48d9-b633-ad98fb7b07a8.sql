
-- =====================================================
-- SECURITY FIX: pwa_metrics anonymous insert policy
-- Fix RLS violation for PWA metrics collection
-- =====================================================

-- Drop conflicting/duplicate policies on pwa_metrics
DROP POLICY IF EXISTS "pwa_metrics_anon_or_owner_insert" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Authenticated users can insert own PWA metrics" ON public.pwa_metrics;

-- Create proper anonymous INSERT policy for PWA tracking
-- This allows anonymous users to insert metrics with user_id = NULL
-- and authenticated users to insert with their own user_id
CREATE POLICY "pwa_metrics_insert_any"
ON public.pwa_metrics
FOR INSERT
TO public
WITH CHECK (
  (user_id IS NULL) 
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- =====================================================
-- SECURITY FIX: Add search_path to critical functions
-- =====================================================

-- Fix refresh_leaderboard_entries if it exists
CREATE OR REPLACE FUNCTION public.refresh_leaderboard_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear and repopulate leaderboard from gamification stats
  DELETE FROM leaderboard_entries;
  
  INSERT INTO leaderboard_entries (user_id, username, score, rank, category)
  SELECT 
    ugs.user_id,
    COALESCE(p.name, p.email, 'Utilisateur'),
    ugs.total_points,
    ROW_NUMBER() OVER (ORDER BY ugs.total_points DESC),
    'weekly'
  FROM user_gamification_stats ugs
  LEFT JOIN profiles p ON p.id = ugs.user_id
  WHERE ugs.total_points > 0
  ORDER BY ugs.total_points DESC
  LIMIT 100;
END;
$$;

-- Create secure has_role function if not exists
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- =====================================================
-- COMMUNITY TABLES: Add missing RLS policies
-- =====================================================

-- Ensure RLS is enabled on community tables
ALTER TABLE IF EXISTS public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.study_group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for community_posts if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_posts' AND policyname = 'community_posts_select'
  ) THEN
    CREATE POLICY "community_posts_select" ON public.community_posts
    FOR SELECT TO public USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_posts' AND policyname = 'community_posts_insert_auth'
  ) THEN
    CREATE POLICY "community_posts_insert_auth" ON public.community_posts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_posts' AND policyname = 'community_posts_update_owner'
  ) THEN
    CREATE POLICY "community_posts_update_owner" ON public.community_posts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_posts' AND policyname = 'community_posts_delete_owner'
  ) THEN
    CREATE POLICY "community_posts_delete_owner" ON public.community_posts
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for community_post_likes if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_post_likes' AND policyname = 'post_likes_select'
  ) THEN
    CREATE POLICY "post_likes_select" ON public.community_post_likes
    FOR SELECT TO public USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_post_likes' AND policyname = 'post_likes_insert_auth'
  ) THEN
    CREATE POLICY "post_likes_insert_auth" ON public.community_post_likes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_post_likes' AND policyname = 'post_likes_delete_owner'
  ) THEN
    CREATE POLICY "post_likes_delete_owner" ON public.community_post_likes
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for study_groups if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'study_groups' AND policyname = 'study_groups_select'
  ) THEN
    CREATE POLICY "study_groups_select" ON public.study_groups
    FOR SELECT TO public USING (is_public = true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'study_groups' AND policyname = 'study_groups_insert_auth'
  ) THEN
    CREATE POLICY "study_groups_insert_auth" ON public.study_groups
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

-- Create policies for study_group_members if missing  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'study_group_members' AND policyname = 'group_members_select'
  ) THEN
    CREATE POLICY "group_members_select" ON public.study_group_members
    FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'study_group_members' AND policyname = 'group_members_insert_auth'
  ) THEN
    CREATE POLICY "group_members_insert_auth" ON public.study_group_members
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'study_group_members' AND policyname = 'group_members_delete_owner'
  ) THEN
    CREATE POLICY "group_members_delete_owner" ON public.study_group_members
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;
