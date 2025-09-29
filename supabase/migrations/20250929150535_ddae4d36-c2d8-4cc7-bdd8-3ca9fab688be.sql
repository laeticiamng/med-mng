-- Complete Security Definer View Fix - Final Implementation
-- This migration creates security-barrier versions of all remaining views without ownership changes

-- =====================================================
-- FIX ALL REMAINING SECURITY DEFINER VIEWS 
-- =====================================================

-- 1. Fix audit_summary view
DROP VIEW IF EXISTS public.audit_summary CASCADE;
CREATE VIEW public.audit_summary
WITH (security_barrier=true)
AS
SELECT 
    'edn_items_immersive' AS table_name,
    COUNT(*) FILTER (WHERE title IS NOT NULL AND title <> '') AS valid_titles,
    COUNT(*) FILTER (WHERE tableau_rang_a IS NOT NULL) AS valid_descriptions,
    ROUND(AVG(
        CASE
            WHEN title IS NOT NULL AND tableau_rang_a IS NOT NULL THEN 100
            ELSE 50
        END), 2) AS avg_completeness_score,
    COUNT(*) AS total_rows
FROM edn_items_immersive;

-- 2. Fix lyrics_texts_latest view  
DROP VIEW IF EXISTS public.lyrics_texts_latest CASCADE;
CREATE VIEW public.lyrics_texts_latest
WITH (security_barrier=true)
AS
SELECT DISTINCT ON (item_code, rang) 
    id,
    item_code,
    rang,
    content,
    style_meta,
    version,
    is_published,
    status,
    generated_by,
    created_at,
    updated_at
FROM lyrics_texts
WHERE is_published = true
ORDER BY item_code, rang, version DESC;

-- 3. Fix oic_completion_dashboard view
DROP VIEW IF EXISTS public.oic_completion_dashboard CASCADE;
CREATE VIEW public.oic_completion_dashboard
WITH (security_barrier=true)
AS
SELECT 
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE completion_status = 'updated') AS nb_updated,
    COUNT(*) FILTER (WHERE completion_status = 'skipped_empty') AS nb_empty,
    COUNT(*) FILTER (WHERE completion_status = 'skipped_error') AS nb_error
FROM backup_oic_competences;

-- 4. Fix v_competences_parsed view
DROP VIEW IF EXISTS public.v_competences_parsed CASCADE;
CREATE VIEW public.v_competences_parsed
WITH (security_barrier=true)
AS
SELECT 
    objectif_id,
    intitule,
    description,
    url_source,
    rang,
    item_parent,
    split_part(objectif_id, '-', 2) AS item_id,
    (split_part(objectif_id, '-', 3))::integer AS ordre_num,
    split_part(objectif_id, '-', 4) AS rang_code
FROM backup_oic_competences;

-- Grant appropriate permissions on all views
GRANT SELECT ON public.audit_summary TO authenticated;
GRANT SELECT ON public.lyrics_texts_latest TO authenticated;
GRANT SELECT ON public.oic_completion_dashboard TO authenticated;
GRANT SELECT ON public.v_competences_parsed TO authenticated;