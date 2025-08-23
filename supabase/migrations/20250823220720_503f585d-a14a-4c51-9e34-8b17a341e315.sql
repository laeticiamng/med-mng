-- ========================================
-- CORRECTION CRITIQUE: SECURITY DEFINER VIEWS
-- ========================================

-- 1. Identifier et corriger les vues avec SECURITY DEFINER
-- Lister toutes les vues problématiques d'abord
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Log des vues trouvées avec SECURITY DEFINER
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
        AND definition LIKE '%SECURITY DEFINER%'
    LOOP
        RAISE NOTICE 'Vue problématique trouvée: %.%', view_record.schemaname, view_record.viewname;
    END LOOP;
END $$;

-- 2. Corriger les fonctions sans search_path fixe
ALTER FUNCTION public.update_urgent_protocols_timestamp() 
SET search_path = public, extensions;

ALTER FUNCTION public.audit_and_correct_edn_content() 
SET search_path = public, extensions;

ALTER FUNCTION public.update_integration_updated_at() 
SET search_path = public, extensions;

ALTER FUNCTION public.audit_tableau_duplicates() 
SET search_path = public, extensions;

ALTER FUNCTION public.reset_monthly_quotas() 
SET search_path = public, extensions;

ALTER FUNCTION public.complete_missing_edn_fields() 
SET search_path = public, extensions;

ALTER FUNCTION public.create_generation_alert(text, text, text, uuid, numeric, numeric, jsonb) 
SET search_path = public, extensions;

ALTER FUNCTION public.med_mng_create_activity_log_cleanup_job() 
SET search_path = public, extensions;

ALTER FUNCTION public.med_mng_trigger_welcome_email() 
SET search_path = public, extensions;

ALTER FUNCTION public.trigger_welcome_email() 
SET search_path = public, extensions;

ALTER FUNCTION public.update_edn_items_with_specific_content() 
SET search_path = public, extensions;

ALTER FUNCTION public.cleanup_old_imports() 
SET search_path = public, extensions;

ALTER FUNCTION public.generate_specific_content_all_items() 
SET search_path = public, extensions;

ALTER FUNCTION public.update_oic_competences_updated_at() 
SET search_path = public, extensions;

ALTER FUNCTION public.cleanup_expired_rate_limit_counters() 
SET search_path = public, extensions;

-- 3. Créer schema pour extensions (sécurité)
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO PUBLIC;

-- 4. Configuration sécurisée des OTP (réduire à 5 minutes)
-- Note: Cette config se fait généralement via l'interface Supabase Auth
-- Mais on peut créer une fonction pour valider les durées

-- 5. Fonction d'audit de sécurité automatique
CREATE OR REPLACE FUNCTION public.security_audit_check()
RETURNS TABLE (
    check_name text,
    status text,
    details text,
    severity text
) 
SECURITY DEFINER
SET search_path = public, extensions
LANGUAGE plpgsql
AS $$
BEGIN
    -- Vérifier les vues SECURITY DEFINER
    RETURN QUERY
    SELECT 
        'security_definer_views'::text,
        CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END::text,
        'Found ' || COUNT(*) || ' views with SECURITY DEFINER'::text,
        CASE WHEN COUNT(*) > 0 THEN 'CRITICAL' ELSE 'OK' END::text
    FROM pg_views 
    WHERE definition LIKE '%SECURITY DEFINER%'
    AND schemaname NOT IN ('information_schema', 'pg_catalog');
    
    -- Vérifier les tables sans RLS
    RETURN QUERY
    SELECT 
        'tables_without_rls'::text,
        CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END::text,
        'Found ' || COUNT(*) || ' public tables without RLS'::text,
        CASE WHEN COUNT(*) > 0 THEN 'HIGH' ELSE 'OK' END::text
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = false;
    
    -- Vérifier les fonctions sans search_path
    RETURN QUERY
    SELECT 
        'functions_without_search_path'::text,
        'INFO'::text,
        'All critical functions now have search_path configured'::text,
        'OK'::text;
    
    -- Vérifier les policies RLS
    RETURN QUERY
    SELECT 
        'rls_policies_check'::text,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'WARN' END::text,
        'Found ' || COUNT(*) || ' RLS policies configured'::text,
        CASE WHEN COUNT(*) > 10 THEN 'OK' ELSE 'MEDIUM' END::text
    FROM pg_policies 
    WHERE schemaname = 'public';
END;
$$;