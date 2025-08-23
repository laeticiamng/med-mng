-- 🚨 CRITICAL SECURITY FIX: Remove the dangerous public access policy
-- This policy allows ANYONE to read ALL profile data - MAJOR SECURITY BREACH

-- Remove the dangerous public access policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Also clean up duplicate policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Verify only secure policies remain (should only show policies that restrict access to own data)
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- Log this critical security fix
INSERT INTO public.security_audit_log (
    finding_type,
    severity,
    description,
    location,
    metadata,
    action_taken
) VALUES (
    'PUBLIC_ACCESS_REMOVED',
    'CRITICAL',
    'Removed dangerous public access policy from profiles table that allowed unauthorized access to personal information',
    'public.profiles',
    jsonb_build_object(
        'removed_policy', 'Profiles are viewable by everyone',
        'security_risk', 'Public access to emails, phone numbers, and personal data',
        'fix_applied', 'RLS policies now restrict access to profile owner only'
    ),
    'POLICY_REMOVED'
) ON CONFLICT DO NOTHING;