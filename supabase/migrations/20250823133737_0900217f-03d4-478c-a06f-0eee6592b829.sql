-- 🚨 CRITICAL SECURITY FIX: Remove the dangerous public access policy
-- This policy allows ANYONE to read ALL profile data - MAJOR SECURITY BREACH

-- Remove the dangerous public access policy that exposes all personal data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Also clean up any duplicate policies 
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Verify only secure policies remain
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid() = id%' THEN '✅ SECURE (Own data only)'
        WHEN qual = 'true' THEN '❌ PUBLIC ACCESS'
        ELSE qual
    END as security_level
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY cmd, policyname;