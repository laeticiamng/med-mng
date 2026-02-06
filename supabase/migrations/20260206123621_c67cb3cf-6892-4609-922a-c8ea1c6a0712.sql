
-- ============================================================
-- SECURITY HARDENING: Add SECURITY DEFINER SET search_path = public
-- to all 96 public functions missing this configuration.
-- This prevents search_path hijacking attacks.
-- ============================================================

-- Critical security functions
ALTER FUNCTION public.get_current_user_id() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.check_rate_limit(text, text, integer, integer) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.increment_rate_limit_counter(text, integer, integer) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_rate_limit_status(text, integer, integer) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.sanitize_user_input(text) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.create_user_session(jsonb) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.notify_critical_incident() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.notify_critical_security_incident() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_security_headers() SECURITY DEFINER SET search_path = public;

-- Validation functions
ALTER FUNCTION public.validate_emotion_transaction() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.validate_music_lyrics(jsonb) SECURITY DEFINER SET search_path = public;

-- Calculation functions
ALTER FUNCTION public.calc_meditation_mood_delta() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_completeness_score(jsonb) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_internal_level(text, numeric) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_new_ease_factor(numeric, integer) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_next_audit_run(text, integer, integer, time) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_next_run(text, integer, integer, time) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_srs_interval(integer, numeric, integer) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_streak_bonus(integer) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_trust_score(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_who5_score(jsonb) SECURITY DEFINER SET search_path = public;

-- Utility functions
ALTER FUNCTION public.cleanup_old_notifications() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.count_all_invitations() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.count_invitations_by_status(invitation_status) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.detect_consent_anomaly() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.enrich_oic_by_specialty_range(integer, integer, text) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.generate_anonymous_pseudo() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.generate_join_code() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.generate_slug(text) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.generate_tournament_bracket() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_current_week_bounds() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_latest_quality_metrics() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_user_statistics(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_weekly_summary(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.increment_view_count(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_dsar_legal_deadline() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.trigger_detect_score_drops() SECURITY DEFINER SET search_path = public;

-- Med-mng functions
ALTER FUNCTION public.med_mng_decrement_quota(integer) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.med_mng_get_remaining_quota() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.med_mng_log_listen(uuid, integer, numeric, text) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.med_mng_toggle_favorite(uuid) SECURITY DEFINER SET search_path = public;

-- Trigger functions (updated_at handlers)
ALTER FUNCTION public.handle_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_accessibility_report_config_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_alert_config_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_competences_counters() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_consent_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_content_master_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_custom_challenges_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_data_integrity_reports_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_edn_items_audit_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_edn_items_complete_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_escalation_metrics_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_exchange_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_extraction_logs_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_focus_sessions_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_gamification_points() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_gdpr_alerts_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_group_meditation_timestamp() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_guild_member_count() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_guild_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_leaderboard_rank() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_marketplace_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_med_mng_generation_logs_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_meditation_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_monitoring_incidents_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_music_achievement_progress() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_music_journey_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_music_metrics_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_notification_templates_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_page_notes_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_parcours_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_pdf_templates_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_playlist_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_privacy_policy_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_program_stats() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_pseudonymization_rules_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_quality_alert_config_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_recommendation_alert_timestamp() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_schedule_next_run() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_scheduled_export_timestamp() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_scheduled_reports_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_security_incidents_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_settings_alerts_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_settings_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_shopify_purchases_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_stats_on_breath_session() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_tournament_participants() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_user_goals_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_user_level() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_user_level_timestamp() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_user_scores_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_user_sitemap_data_updated_at() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_user_stats() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_vr_nebula_updated_at() SECURITY DEFINER SET search_path = public;
