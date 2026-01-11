-- ================================================================
-- MIGRATION: Corriger les policies RLS publiques permissives
-- Cible: roles={public} ou {authenticated} avec USING(true)
-- ================================================================

-- 1. ai_generated_content (public -> service_role)
DROP POLICY IF EXISTS "Allow service role to insert/update" ON public.ai_generated_content;
CREATE POLICY "Service role manages ai_generated_content"
ON public.ai_generated_content FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. ai_template_suggestions (public -> service_role)
DROP POLICY IF EXISTS "p_ai_suggestions_admin" ON public.ai_template_suggestions;
CREATE POLICY "Service role manages ai_template_suggestions"
ON public.ai_template_suggestions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. alert_escalation_rules (public -> service_role)
DROP POLICY IF EXISTS "p_escalation_rules_admin" ON public.alert_escalation_rules;
CREATE POLICY "Service role manages alert_escalation_rules"
ON public.alert_escalation_rules FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. audit_fixes (public -> service_role)
DROP POLICY IF EXISTS "Admins can manage audit fixes" ON public.audit_fixes;
CREATE POLICY "Service role manages audit_fixes"
ON public.audit_fixes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. audit_issues (public -> service_role)
DROP POLICY IF EXISTS "Admins can manage audit issues" ON public.audit_issues;
CREATE POLICY "Service role manages audit_issues"
ON public.audit_issues FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. audit_reports (public -> service_role)
DROP POLICY IF EXISTS "Admins can manage audit reports" ON public.audit_reports;
CREATE POLICY "Service role manages audit_reports"
ON public.audit_reports FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. audit_schedules (authenticated -> service_role)
DROP POLICY IF EXISTS "Authenticated users can manage audit schedules" ON public.audit_schedules;
CREATE POLICY "Service role manages audit_schedules"
ON public.audit_schedules FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. completeness_alerts (public -> service_role)
DROP POLICY IF EXISTS "Service role can manage completeness alerts" ON public.completeness_alerts;
CREATE POLICY "Service role manages completeness_alerts"
ON public.completeness_alerts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9. data_archives (public -> service_role)
DROP POLICY IF EXISTS "System can manage archives" ON public.data_archives;
CREATE POLICY "Service role manages data_archives"
ON public.data_archives FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 10. data_integrity_reports (public -> service_role) - supprimer doublon
DROP POLICY IF EXISTS "Admins can manage data integrity reports" ON public.data_integrity_reports;

-- 11. ecos_situations_uness (public -> service_role)
DROP POLICY IF EXISTS "Allow service role to manage ECOS situations UNESS" ON public.ecos_situations_uness;
CREATE POLICY "Service role manages ecos_situations_uness"
ON public.ecos_situations_uness FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 12. edn_items_immersive (public -> service_role)
DROP POLICY IF EXISTS "Service role can manage EDN items immersive" ON public.edn_items_immersive;
CREATE POLICY "Service role manages edn_items_immersive"
ON public.edn_items_immersive FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 13. emotionsroom_rooms (authenticated UPDATE avec true -> auth.uid())
DROP POLICY IF EXISTS "Authenticated users can update room participation" ON public.emotionsroom_rooms;
CREATE POLICY "Users can update own rooms"
ON public.emotionsroom_rooms FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- 14. error_patterns (public -> service_role)
DROP POLICY IF EXISTS "error_patterns_all" ON public.error_patterns;
CREATE POLICY "Service role manages error_patterns"
ON public.error_patterns FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 15. error_patterns_history (public -> service_role)
DROP POLICY IF EXISTS "p_error_patterns_admin" ON public.error_patterns_history;
CREATE POLICY "Service role manages error_patterns_history"
ON public.error_patterns_history FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 16. import_raw_data (public -> service_role)
DROP POLICY IF EXISTS "System can manage import raw data" ON public.import_raw_data;
CREATE POLICY "Service role manages import_raw_data"
ON public.import_raw_data FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 17. integration_logs (public -> service_role)
DROP POLICY IF EXISTS "Service role can manage integration logs" ON public.integration_logs;
CREATE POLICY "Service role manages integration_logs"
ON public.integration_logs FOR ALL TO service_role USING (true) WITH CHECK (true);