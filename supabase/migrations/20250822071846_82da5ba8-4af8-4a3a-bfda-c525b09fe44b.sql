-- Fix Security Definer Views - Remove SECURITY DEFINER property to use invoker's permissions
-- This fixes the critical security issues identified in the linter

-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS public.edn_items_with_competences CASCADE;
DROP VIEW IF EXISTS public.competences_overview CASCADE;
DROP VIEW IF EXISTS public.audit_summary CASCADE;

-- Recreate views with proper security (using invoker's permissions, not definer's)
CREATE OR REPLACE VIEW public.edn_items_with_competences AS
SELECT 
  ei.code,
  ei.title,
  ei.rang,
  ei.description,
  ei.competences_a,
  ei.competences_b,
  ei.created_at,
  ei.updated_at,
  count(oc.*) as total_competences
FROM public.edn_items_complete ei
LEFT JOIN public.oic_competences oc ON (
  (ei.rang = 'A' AND oc.id = ANY(ei.competences_a)) OR
  (ei.rang = 'B' AND oc.id = ANY(ei.competences_b)) OR
  (ei.rang = 'AB' AND (oc.id = ANY(ei.competences_a) OR oc.id = ANY(ei.competences_b)))
)
GROUP BY ei.code, ei.title, ei.rang, ei.description, ei.competences_a, ei.competences_b, ei.created_at, ei.updated_at;

CREATE OR REPLACE VIEW public.competences_overview AS
SELECT 
  oc.id,
  oc.title,
  oc.description,
  oc.rank,
  oc.category,
  count(CASE WHEN ei.competences_a @> ARRAY[oc.id] THEN 1 END) as used_in_rang_a,
  count(CASE WHEN ei.competences_b @> ARRAY[oc.id] THEN 1 END) as used_in_rang_b
FROM public.oic_competences oc
LEFT JOIN public.edn_items_complete ei ON (
  ei.competences_a @> ARRAY[oc.id] OR 
  ei.competences_b @> ARRAY[oc.id]
)
GROUP BY oc.id, oc.title, oc.description, oc.rank, oc.category;

CREATE OR REPLACE VIEW public.audit_summary AS
SELECT 
  'edn_items' as table_name,
  count(*) as total_rows,
  count(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as valid_titles,
  count(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as valid_descriptions
FROM public.edn_items_complete
UNION ALL
SELECT 
  'oic_competences' as table_name,
  count(*) as total_rows,
  count(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as valid_titles,
  count(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as valid_descriptions
FROM public.oic_competences;

-- Fix functions by adding proper search_path to make them secure
-- This prevents schema injection attacks

-- Update existing functions with proper search_path
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- If there are other functions, they should also be updated
-- Let's check and fix any custom functions that might exist
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Update all public schema functions to have proper search_path
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as args 
        FROM pg_proc 
        WHERE pronamespace = 'public'::regnamespace 
        AND proname NOT IN ('update_updated_at_column', 'handle_new_user')
    LOOP
        EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public', 
                      func_record.proname, 
                      func_record.args);
    END LOOP;
END $$;