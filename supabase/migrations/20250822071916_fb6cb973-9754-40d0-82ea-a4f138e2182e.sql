-- Fix Security Issues - Corrected Migration
-- First, check the actual schema and fix accordingly

-- Fix the views with correct column references
DROP VIEW IF EXISTS public.edn_items_with_competences CASCADE;
DROP VIEW IF EXISTS public.competences_overview CASCADE;
DROP VIEW IF EXISTS public.audit_summary CASCADE;

-- Create correct views based on actual table structure
CREATE OR REPLACE VIEW public.edn_items_with_competences AS
SELECT 
  ei.item_code,
  ei.title,
  ei.subtitle,
  ei.created_at,
  ei.updated_at,
  count(CASE WHEN ei.competences_oic_rang_a ? oc.id::text THEN 1 END) as competences_rang_a_count,
  count(CASE WHEN ei.competences_oic_rang_b ? oc.id::text THEN 1 END) as competences_rang_b_count
FROM public.edn_items_complete ei
LEFT JOIN public.oic_competences oc ON (
  ei.competences_oic_rang_a ? oc.id::text OR 
  ei.competences_oic_rang_b ? oc.id::text
)
GROUP BY ei.item_code, ei.title, ei.subtitle, ei.created_at, ei.updated_at;

CREATE OR REPLACE VIEW public.competences_overview AS
SELECT 
  oc.id,
  oc.intitule as title,
  oc.description,
  oc.rang as rank,
  oc.rubrique as category,
  count(CASE WHEN ei.competences_oic_rang_a ? oc.id::text THEN 1 END) as used_in_rang_a,
  count(CASE WHEN ei.competences_oic_rang_b ? oc.id::text THEN 1 END) as used_in_rang_b
FROM public.oic_competences oc
LEFT JOIN public.edn_items_complete ei ON (
  ei.competences_oic_rang_a ? oc.id::text OR 
  ei.competences_oic_rang_b ? oc.id::text
)
GROUP BY oc.id, oc.intitule, oc.description, oc.rang, oc.rubrique;

CREATE OR REPLACE VIEW public.audit_summary AS
SELECT 
  'edn_items_complete' as table_name,
  count(*) as total_rows,
  count(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as valid_titles,
  count(CASE WHEN subtitle IS NOT NULL AND subtitle != '' THEN 1 END) as valid_descriptions
FROM public.edn_items_complete
UNION ALL
SELECT 
  'oic_competences' as table_name,
  count(*) as total_rows,
  count(CASE WHEN intitule IS NOT NULL AND intitule != '' THEN 1 END) as valid_titles,
  count(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as valid_descriptions
FROM public.oic_competences;