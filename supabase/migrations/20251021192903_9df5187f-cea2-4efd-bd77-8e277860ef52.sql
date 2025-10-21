-- Fix Supabase Linter Issues - Security Improvements (Final)

-- ========================================
-- 1. Fix Security Definer Views
-- Replace SECURITY DEFINER with SECURITY INVOKER
-- ========================================

-- Fix journal_text_decrypted view
CREATE OR REPLACE VIEW public.journal_text_decrypted
WITH (security_invoker = true)
AS
SELECT 
  journal_text.id,
  journal_text.ts,
  journal_text.user_id,
  journal_text.user_hash,
  CASE
    WHEN journal_text.text_raw_encrypted IS NOT NULL 
    THEN decrypt_sensitive_data(journal_text.text_raw_encrypted, 'journal_encryption_key')
    ELSE journal_text.text_raw
  END AS text_raw,
  CASE
    WHEN journal_text.styled_html_encrypted IS NOT NULL 
    THEN decrypt_sensitive_data(journal_text.styled_html_encrypted, 'journal_encryption_key')
    ELSE journal_text.styled_html
  END AS styled_html,
  CASE
    WHEN journal_text.preview_encrypted IS NOT NULL 
    THEN decrypt_sensitive_data(journal_text.preview_encrypted, 'journal_encryption_key')
    ELSE journal_text.preview
  END AS preview,
  journal_text.valence,
  CASE
    WHEN journal_text.emo_vec_encrypted IS NOT NULL 
    THEN decrypt_sensitive_data(journal_text.emo_vec_encrypted, 'journal_encryption_key')::numeric[]
    ELSE journal_text.emo_vec
  END AS emo_vec
FROM journal_text;

-- Fix journal_voice_decrypted view
CREATE OR REPLACE VIEW public.journal_voice_decrypted
WITH (security_invoker = true)
AS
SELECT 
  journal_voice.id,
  journal_voice.ts,
  journal_voice.user_id,
  journal_voice.user_hash,
  journal_voice.audio_url,
  CASE
    WHEN journal_voice.text_raw_encrypted IS NOT NULL 
    THEN decrypt_sensitive_data(journal_voice.text_raw_encrypted, 'journal_encryption_key')
    ELSE journal_voice.text_raw
  END AS text_raw,
  CASE
    WHEN journal_voice.summary_120_encrypted IS NOT NULL 
    THEN decrypt_sensitive_data(journal_voice.summary_120_encrypted, 'journal_encryption_key')
    ELSE journal_voice.summary_120
  END AS summary_120,
  journal_voice.valence,
  CASE
    WHEN journal_voice.emo_vec_encrypted IS NOT NULL 
    THEN decrypt_sensitive_data(journal_voice.emo_vec_encrypted, 'journal_encryption_key')::numeric[]
    ELSE journal_voice.emo_vec
  END AS emo_vec,
  journal_voice.pitch_avg,
  CASE
    WHEN journal_voice.crystal_meta_encrypted IS NOT NULL 
    THEN decrypt_sensitive_data(journal_voice.crystal_meta_encrypted, 'journal_encryption_key')::jsonb
    ELSE journal_voice.crystal_meta
  END AS crystal_meta
FROM journal_voice;

-- Fix security_compliance_report view
CREATE OR REPLACE VIEW public.security_compliance_report
WITH (security_invoker = true)
AS
WITH security_metrics AS (
  SELECT 
    'RLS Coverage' AS metric_name,
    COUNT(*) FILTER (WHERE rowsecurity = true) AS compliant_count,
    COUNT(*) AS total_count,
    ROUND(100.0 * COUNT(*) FILTER (WHERE rowsecurity = true)::numeric / NULLIF(COUNT(*), 0)::numeric, 1) AS compliance_pct
  FROM pg_tables
  WHERE schemaname = 'public' AND tablename !~~ 'pg_%'
  UNION ALL
  SELECT 
    'Tables with RLS Policies' AS metric_name,
    COUNT(DISTINCT tablename) AS compliant_count,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) AS total_count,
    ROUND(100.0 * COUNT(DISTINCT tablename)::numeric / NULLIF((SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true), 0)::numeric, 1) AS compliance_pct
  FROM pg_policies
  WHERE schemaname = 'public'
  UNION ALL
  SELECT 
    'Functions with search_path' AS metric_name,
    COUNT(*) FILTER (WHERE p.proconfig @> ARRAY['search_path=public']) AS compliant_count,
    COUNT(*) FILTER (WHERE p.prosecdef = true) AS total_count,
    ROUND(100.0 * COUNT(*) FILTER (WHERE p.proconfig @> ARRAY['search_path=public'])::numeric / NULLIF(COUNT(*) FILTER (WHERE p.prosecdef = true), 0)::numeric, 1) AS compliance_pct
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.prosecdef = true
)
SELECT 
  metric_name,
  compliant_count,
  total_count,
  compliance_pct,
  CASE
    WHEN compliance_pct >= 95 THEN '✅ Excellent'
    WHEN compliance_pct >= 80 THEN '✅ Bon'
    WHEN compliance_pct >= 60 THEN '⚠️ À améliorer'
    ELSE '❌ Critique'
  END AS status
FROM security_metrics;

-- ========================================
-- 2. Fix Function Search Paths
-- ========================================

-- Fix update_updated_at_column - Most commonly used trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix generate_slug - Commonly used utility function
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN lower(regexp_replace(input_text, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$;

-- Add comment documenting remaining manual actions
COMMENT ON SCHEMA public IS 'Security improvements applied (21 Oct 2025): Views converted to security_invoker, critical functions search_path fixed. Remaining manual actions: 1) Review and fix remaining functions without search_path, 2) Consider moving extensions to extensions schema, 3) Upgrade PostgreSQL version via Supabase dashboard for latest security patches.';
