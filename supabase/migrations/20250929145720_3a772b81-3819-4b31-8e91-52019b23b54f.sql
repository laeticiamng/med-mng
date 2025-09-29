-- Fix security vulnerabilities in music_generation_usage and backup_oic_competences tables

-- =====================================================
-- SECURE music_generation_usage TABLE
-- =====================================================

-- Drop all existing policies on music_generation_usage to clean up duplicates and conflicts
DROP POLICY IF EXISTS "Service role can manage music usage" ON public.music_generation_usage;
DROP POLICY IF EXISTS "Service role can manage usage" ON public.music_generation_usage;
DROP POLICY IF EXISTS "Users can insert their own usage data" ON public.music_generation_usage;
DROP POLICY IF EXISTS "Users can update own usage data" ON public.music_generation_usage;
DROP POLICY IF EXISTS "Users can view own usage data" ON public.music_generation_usage;
DROP POLICY IF EXISTS "Users can view their own usage" ON public.music_generation_usage;
DROP POLICY IF EXISTS "Users can view their own usage data" ON public.music_generation_usage;

-- Create secure RLS policies for music_generation_usage
CREATE POLICY "Users can manage their own music usage data" 
ON public.music_generation_usage 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to music usage" 
ON public.music_generation_usage 
FOR ALL 
USING ((auth.jwt() ->> 'role') = 'service_role');

-- =====================================================
-- SECURE backup_oic_competences TABLE  
-- =====================================================

-- Drop the public read policy that exposes medical data
DROP POLICY IF EXISTS "Allow public read access to backup OIC competences" ON public.backup_oic_competences;

-- Keep only the service role policy for backup_oic_competences
-- This ensures only backend services can access this sensitive medical education data
-- If authenticated users need access to this data, it should be through controlled endpoints

-- Verify RLS is enabled on both tables
ALTER TABLE public.music_generation_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_oic_competences ENABLE ROW LEVEL SECURITY;