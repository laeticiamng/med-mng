-- Fix function search path issues for existing functions
-- Update all existing functions to have secure search_path

-- Update existing functions with proper search_path
ALTER FUNCTION public.update_urgent_protocols_timestamp() SET search_path TO 'public';
ALTER FUNCTION public.update_content_stats_after_view() SET search_path TO 'public';  
ALTER FUNCTION public.update_integration_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.generate_master_content(text) SET search_path TO 'public';
ALTER FUNCTION public.validate_edn_item_data(jsonb) SET search_path TO 'public';
ALTER FUNCTION public.calculate_sla_metrics() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_old_performance_metrics() SET search_path TO 'public';
ALTER FUNCTION public.calculate_completeness_score(uuid) SET search_path TO 'public';
ALTER FUNCTION public.create_activity_log_cleanup_job() SET search_path TO 'public';
ALTER FUNCTION public.detect_edn_duplicates() SET search_path TO 'public';
ALTER FUNCTION public.reset_monthly_quotas() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_old_music_generations() SET search_path TO 'public';
ALTER FUNCTION public.count_all_invitations() SET search_path TO 'public';
ALTER FUNCTION public.validate_music_lyrics(jsonb) SET search_path TO 'public';
ALTER FUNCTION public.generate_slug(text, text) SET search_path TO 'public';
ALTER FUNCTION public.sync_oic_competences() SET search_path TO 'public';
ALTER FUNCTION public.backup_critical_data() SET search_path TO 'public';
ALTER FUNCTION public.med_mng_remove_from_library(uuid) SET search_path TO 'public';
ALTER FUNCTION public.increment_rate_limit_counter(text, integer, integer) SET search_path TO 'public';
ALTER FUNCTION public.get_rate_limit_status(text, integer, integer) SET search_path TO 'public';
ALTER FUNCTION public.cleanup_expired_rate_limit_counters() SET search_path TO 'public';
ALTER FUNCTION public.med_mng_update_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.trigger_welcome_email() SET search_path TO 'public';
ALTER FUNCTION public.med_mng_create_activity_log_cleanup_job() SET search_path TO 'public';
ALTER FUNCTION public.med_mng_trigger_welcome_email() SET search_path TO 'public';
ALTER FUNCTION public.med_mng_get_remaining_quota() SET search_path TO 'public';
ALTER FUNCTION public.fix_all_edn_items_simple_correction() SET search_path TO 'public';
ALTER FUNCTION public.med_mng_decrement_quota(integer) SET search_path TO 'public';
ALTER FUNCTION public.log_ia_usage(text, text, integer, jsonb, text, integer, text) SET search_path TO 'public';
ALTER FUNCTION public.get_user_ia_stats(integer) SET search_path TO 'public';
ALTER FUNCTION public.get_current_user_role() SET search_path TO 'public';
ALTER FUNCTION public.update_oic_competences_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.med_mng_toggle_favorite(uuid) SET search_path TO 'public';
ALTER FUNCTION public.med_mng_log_listen(uuid, integer, numeric, text) SET search_path TO 'public';
ALTER FUNCTION public.med_mng_log_user_activity(text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.handle_new_emotionsroom_user() SET search_path TO 'public';
ALTER FUNCTION public.update_emotionscare_songs_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.migrate_edn_items_to_platform() SET search_path TO 'public';
ALTER FUNCTION public.handle_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.clean_corrupted_edn_items() SET search_path TO 'public';
ALTER FUNCTION public.calculate_item_completeness_score(text, jsonb, jsonb, jsonb, text[], jsonb) SET search_path TO 'public';
ALTER FUNCTION public.update_google_sheets_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.migrate_edn_items_complete() SET search_path TO 'public';