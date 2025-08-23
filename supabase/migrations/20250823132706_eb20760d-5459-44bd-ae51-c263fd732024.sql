-- Check current profiles table structure and policies
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
UNION ALL
SELECT 
    schemaname,
    tablename,
    rowsecurity::text,
    'NO_POLICIES' as policyname,
    null as permissive,
    null as roles,
    null as cmd,
    null as qual,
    null as with_check
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public'
AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles');

-- Also check if RLS is enabled on profiles table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';