-- ============================================
-- SECURITY HARDENING: Fix search_path for all SECURITY DEFINER functions
-- Prevents schema hijacking attacks
-- ============================================

-- Core utility functions
ALTER FUNCTION public.is_room_host(p_user_id uuid, p_room_id uuid) SET search_path = public;
ALTER FUNCTION public.is_room_member(p_user_id uuid, p_room_id uuid) SET search_path = public;
ALTER FUNCTION public.get_profile_by_user_id(p_user_id uuid) SET search_path = public;
ALTER FUNCTION public.get_rls_policies() SET search_path = public;
ALTER FUNCTION public.get_rls_table_summaries() SET search_path = public;
ALTER FUNCTION public.list_rls_policies() SET search_path = public;
ALTER FUNCTION public.get_user_role_history(_user_id uuid) SET search_path = public;
ALTER FUNCTION public.get_all_role_changes(_limit integer) SET search_path = public;
ALTER FUNCTION public.audit_profile_changes() SET search_path = public;
ALTER FUNCTION public.auto_expire_invitations() SET search_path = public;
ALTER FUNCTION public.calculate_buddy_compatibility(user1_id uuid, user2_id uuid) SET search_path = public;

-- Cleanup and maintenance functions
ALTER FUNCTION public.cleanup_expired_rate_limit_counters() SET search_path = public;
ALTER FUNCTION public.check_activity_badges() SET search_path = public;
ALTER FUNCTION public.check_slow_generations() SET search_path = public;
ALTER FUNCTION public.cleanup_failed_generations() SET search_path = public;
ALTER FUNCTION public.cleanup_old_audit_logs() SET search_path = public;
ALTER FUNCTION public.cleanup_old_performance_metrics() SET search_path = public;
ALTER FUNCTION public.cleanup_old_streaming_logs() SET search_path = public;

-- Gamification functions
ALTER FUNCTION public.decrement_post_likes(post_id uuid) SET search_path = public;
ALTER FUNCTION public.decrement_preset_likes(p_preset_id uuid) SET search_path = public;

-- Audit and security functions
ALTER FUNCTION public.encrypt_journal_voice() SET search_path = public;
ALTER FUNCTION public.generate_audit_report(report_type_param text) SET search_path = public;
ALTER FUNCTION public.generate_security_audit_report() SET search_path = public;
ALTER FUNCTION public.get_cron_jobs_list() SET search_path = public;
ALTER FUNCTION public.get_current_user_role() SET search_path = public;

-- Recommendation functions
ALTER FUNCTION public.calculate_recommendation_impact(rec_id uuid) SET search_path = public;

-- Fix and content functions
ALTER FUNCTION public.fix_competences_mapping_correct() SET search_path = public;
ALTER FUNCTION public.fix_generic_content_and_complete_platform() SET search_path = public;

-- Item completeness functions (multiple signatures - fix both)
ALTER FUNCTION public.calculate_item_completeness_score(item_id uuid) SET search_path = public;
ALTER FUNCTION public.calculate_item_completeness_score(
  p_item_code text, 
  p_tableau_a jsonb, 
  p_tableau_b jsonb, 
  p_quiz_questions jsonb, 
  p_paroles_musicales text[], 
  p_scene_immersive jsonb
) SET search_path = public;