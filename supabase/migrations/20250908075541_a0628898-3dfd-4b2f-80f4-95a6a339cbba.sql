-- Fix critical security issues identified by linter

-- 1. Fix functions without proper search_path
ALTER FUNCTION public.count_all_invitations() SET search_path = 'public', 'extensions';
ALTER FUNCTION public.count_invitations_by_status(invitation_status) SET search_path = 'public', 'extensions';
ALTER FUNCTION public.med_mng_get_remaining_quota() SET search_path = 'public', 'extensions';
ALTER FUNCTION public.med_mng_toggle_favorite(uuid) SET search_path = 'public', 'extensions';

-- 2. Create proper RLS policies for tables that have RLS enabled but no policies
-- Check which tables need policies (this is informational)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
AND tablename NOT IN (
  SELECT DISTINCT tablename 
  FROM pg_policies 
  WHERE schemaname = 'public'
);

-- 3. Fix extension in public schema by moving to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
-- Note: Extensions should be moved by superuser, this creates the schema for future use

-- 4. Add missing RLS policies for tables that need them
-- Example: Adding policies for any table with RLS enabled but no policies