-- CRITICAL SECURITY FIXES - Part 2
-- Fix remaining RLS policies without conflicts

-- 1. Enable RLS on remaining tables that need it
ALTER TABLE public."Digital Medicine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_edn_items_immersive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_oic_competences ENABLE ROW LEVEL SECURITY;

-- 2. Drop and recreate conflicting policies to ensure they're correct

-- Drop existing groups policies if they exist
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
DROP POLICY IF EXISTS "Service role can manage groups" ON public.groups;

-- Recreate groups policies
CREATE POLICY "Anyone can view groups" ON public.groups
FOR SELECT USING (true);

CREATE POLICY "Service role can manage groups" ON public.groups
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. Add missing RLS policies for tables that don't have any

-- For badges table (if policies don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Users can view own badges') THEN
    EXECUTE 'CREATE POLICY "Users can view own badges" ON public.badges FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Users can insert own badges') THEN
    EXECUTE 'CREATE POLICY "Users can insert own badges" ON public.badges FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Users can update own badges') THEN
    EXECUTE 'CREATE POLICY "Users can update own badges" ON public.badges FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Users can delete own badges') THEN
    EXECUTE 'CREATE POLICY "Users can delete own badges" ON public.badges FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- For backup tables (service role access only)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'backup_edn_items_immersive' AND policyname = 'Service role can view backup tables') THEN
    EXECUTE 'CREATE POLICY "Service role can view backup tables" ON public.backup_edn_items_immersive FOR SELECT USING (auth.jwt() ->> ''role'' = ''service_role'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'backup_oic_competences' AND policyname = 'Service role can view backup OIC') THEN
    EXECUTE 'CREATE POLICY "Service role can view backup OIC" ON public.backup_oic_competences FOR SELECT USING (auth.jwt() ->> ''role'' = ''service_role'')';
  END IF;
END $$;

-- For Digital Medicine table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Digital Medicine' AND policyname = 'Public can insert to Digital Medicine') THEN
    EXECUTE 'CREATE POLICY "Public can insert to Digital Medicine" ON public."Digital Medicine" FOR INSERT WITH CHECK (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Digital Medicine' AND policyname = 'Service role can manage Digital Medicine') THEN
    EXECUTE 'CREATE POLICY "Service role can manage Digital Medicine" ON public."Digital Medicine" FOR ALL USING (auth.jwt() ->> ''role'' = ''service_role'')';
  END IF;
END $$;