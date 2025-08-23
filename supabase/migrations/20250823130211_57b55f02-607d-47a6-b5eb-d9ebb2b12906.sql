-- Fix remaining functions without secure search_path
-- These are the main application functions that need secure search_path

-- Core application functions
ALTER FUNCTION public.accept_invitation(text) SET search_path TO 'public';
ALTER FUNCTION public.audit_and_correct_edn_content() SET search_path TO 'public';
ALTER FUNCTION public.audit_and_fix_edn_content() SET search_path TO 'public';
ALTER FUNCTION public.audit_tableau_duplicates() SET search_path TO 'public';
ALTER FUNCTION public.auto_expire_invitations() SET search_path TO 'public';
ALTER FUNCTION public.auto_security_maintenance() SET search_path TO 'public';
ALTER FUNCTION public.check_music_generation_quota(uuid) SET search_path TO 'public';
ALTER FUNCTION public.check_rate_limit(text, text, integer, integer) SET search_path TO 'public';
ALTER FUNCTION public.check_slow_generations() SET search_path TO 'public';
ALTER FUNCTION public.clean_generic_lisa_content() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_duplicates() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_old_chat_logs() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_old_imports() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_old_integrity_reports() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_old_operation_logs() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_old_streaming_logs() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_security_issues() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_security_scan_false_positives() SET search_path TO 'public';
ALTER FUNCTION public.complete_all_items_with_competences() SET search_path TO 'public';
ALTER FUNCTION public.complete_extraction_batch(uuid, text, text, jsonb, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.complete_missing_edn_fields() SET search_path TO 'public';
ALTER FUNCTION public.count_generic_lisa_content() SET search_path TO 'public';
ALTER FUNCTION public.count_invitations_by_status(invitation_status) SET search_path TO 'public';
ALTER FUNCTION public.create_generation_alert(text, text, text, uuid, numeric, numeric, jsonb) SET search_path TO 'public';