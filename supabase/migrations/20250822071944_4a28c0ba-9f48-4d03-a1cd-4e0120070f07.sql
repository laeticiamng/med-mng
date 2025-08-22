-- Fix Security Issues - Corrected Migration with proper column names
-- Remove SECURITY DEFINER views and recreate without it

-- Drop existing problematic views
DROP VIEW IF EXISTS public.edn_items_with_competences CASCADE;
DROP VIEW IF EXISTS public.competences_overview CASCADE;
DROP VIEW IF EXISTS public.audit_summary CASCADE;

-- Create simplified, secure views using invoker's permissions
CREATE OR REPLACE VIEW public.edn_items_with_competences AS
SELECT 
  ei.item_code,
  ei.title,
  ei.subtitle,
  ei.created_at,
  ei.updated_at,
  ei.competences_count_rang_a,
  ei.competences_count_rang_b,
  ei.completeness_score
FROM public.edn_items_complete ei;

CREATE OR REPLACE VIEW public.competences_overview AS
SELECT 
  oc.objectif_id as id,
  oc.intitule as title,
  oc.description,
  oc.rang as rank,
  oc.rubrique as category,
  oc.item_parent,
  oc.created_at,
  oc.updated_at
FROM public.oic_competences oc;

CREATE OR REPLACE VIEW public.audit_summary AS
SELECT 
  'edn_items_complete' as table_name,
  count(*) as total_rows,
  count(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as valid_titles,
  count(CASE WHEN subtitle IS NOT NULL AND subtitle != '' THEN 1 END) as valid_descriptions,
  avg(completeness_score) as avg_completeness_score
FROM public.edn_items_complete
UNION ALL
SELECT 
  'oic_competences' as table_name,
  count(*) as total_rows,
  count(CASE WHEN intitule IS NOT NULL AND intitule != '' THEN 1 END) as valid_titles,
  count(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as valid_descriptions,
  0 as avg_completeness_score
FROM public.oic_competences;