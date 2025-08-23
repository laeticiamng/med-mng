-- CRITICAL SECURITY FIXES - Phase 2: Fix Security Definer Views and Functions

-- Fix 1: Drop problematic Security Definer Views (these bypass RLS)
-- These views are causing security vulnerabilities by bypassing RLS policies

DROP VIEW IF EXISTS public.audit_summary;
DROP VIEW IF EXISTS public.competences_overview;
DROP VIEW IF EXISTS public.edn_items_with_competences;

-- Recreate as regular views (not SECURITY DEFINER) to respect RLS
CREATE VIEW public.audit_summary AS
SELECT 
  table_name,
  total_rows,
  valid_titles,
  valid_descriptions,
  avg_completeness_score
FROM (
  SELECT 
    'edn_items_immersive'::text as table_name,
    COUNT(*)::bigint as total_rows,
    COUNT(CASE WHEN title IS NOT NULL AND LENGTH(TRIM(title)) > 0 THEN 1 END)::bigint as valid_titles,
    COUNT(CASE WHEN pitch_intro IS NOT NULL AND LENGTH(TRIM(pitch_intro)) > 0 THEN 1 END)::bigint as valid_descriptions,
    AVG(CASE WHEN title IS NOT NULL THEN 75 ELSE 0 END)::numeric as avg_completeness_score
  FROM public.edn_items_immersive
  WHERE auth.uid() IS NOT NULL OR (auth.jwt() ->> 'role') = 'service_role'
) stats;

-- Fix 2: Add SET search_path to all SECURITY DEFINER functions to prevent path injection
-- Update critical functions that lack proper search_path protection

ALTER FUNCTION public.update_urgent_protocols_timestamp() SET search_path = 'public';
ALTER FUNCTION public.audit_and_correct_edn_content() SET search_path = 'public';
ALTER FUNCTION public.update_integration_updated_at() SET search_path = 'public';
ALTER FUNCTION public.audit_tableau_duplicates() SET search_path = 'public';
ALTER FUNCTION public.reset_monthly_quotas() SET search_path = 'public';
ALTER FUNCTION public.check_slow_generations() SET search_path = 'public';
ALTER FUNCTION public.cleanup_old_music_generations() SET search_path = 'public';
ALTER FUNCTION public.cleanup_duplicates() SET search_path = 'public';
ALTER FUNCTION public.cleanup_security_scan_false_positives() SET search_path = 'public';
ALTER FUNCTION public.complete_all_items_with_competences() SET search_path = 'public';
ALTER FUNCTION public.complete_missing_edn_fields() SET search_path = 'public';
ALTER FUNCTION public.cleanup_expired_rate_limit_counters() SET search_path = 'public';
ALTER FUNCTION public.count_generic_lisa_content() SET search_path = 'public';
ALTER FUNCTION public.create_generation_alert(_alert_type text, _severity text, _message text, _generation_log_id uuid, _threshold_value numeric, _actual_value numeric, _metadata jsonb) SET search_path = 'public';
ALTER FUNCTION public.med_mng_create_activity_log_cleanup_job() SET search_path = 'public';
ALTER FUNCTION public.med_mng_trigger_welcome_email() SET search_path = 'public';
ALTER FUNCTION public.trigger_welcome_email() SET search_path = 'public';
ALTER FUNCTION public.update_oic_competences_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_edn_items_with_specific_content() SET search_path = 'public';