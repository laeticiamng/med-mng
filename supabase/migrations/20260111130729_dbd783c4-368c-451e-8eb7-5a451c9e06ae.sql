-- ================================================================
-- MIGRATION: Corriger les dernières policies publiques
-- ================================================================

-- 1. items_completeness_history (public -> service_role)
DROP POLICY IF EXISTS "Service role can manage completeness history" ON public.items_completeness_history;
CREATE POLICY "Service role manages items_completeness_history"
ON public.items_completeness_history FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. items_completeness_reports (public -> service_role)
DROP POLICY IF EXISTS "Service role can manage completeness reports" ON public.items_completeness_reports;
CREATE POLICY "Service role manages items_completeness_reports"
ON public.items_completeness_reports FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. monitoring_incidents (public -> service_role) - déjà un service_role existe
DROP POLICY IF EXISTS "Admins can manage monitoring incidents" ON public.monitoring_incidents;

-- 4. notification_webhooks (public -> service_role)
DROP POLICY IF EXISTS "Admins can manage notification webhooks" ON public.notification_webhooks;
CREATE POLICY "Service role manages notification_webhooks"
ON public.notification_webhooks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. oic_competences (supprimer les doublons public)
DROP POLICY IF EXISTS "Allow service role to manage OIC competences" ON public.oic_competences;
DROP POLICY IF EXISTS "Allow service role to manage oic_competences" ON public.oic_competences;
CREATE POLICY "Service role manages oic_competences"
ON public.oic_competences FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. oic_extraction_methods (public -> service_role)
DROP POLICY IF EXISTS "Only service role can manage extraction methods" ON public.oic_extraction_methods;
CREATE POLICY "Service role manages oic_extraction_methods"
ON public.oic_extraction_methods FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. oic_extraction_progress (supprimer doublons public)
DROP POLICY IF EXISTS "Allow service role to manage extraction progress" ON public.oic_extraction_progress;
DROP POLICY IF EXISTS "Allow service role to manage oic_extraction_progress" ON public.oic_extraction_progress;
CREATE POLICY "Service role manages oic_extraction_progress"
ON public.oic_extraction_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. security_incidents (public -> service_role)
DROP POLICY IF EXISTS "Admins can manage security incidents" ON public.security_incidents;
CREATE POLICY "Service role manages security_incidents"
ON public.security_incidents FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9. streaming_access_logs (public -> service_role)
DROP POLICY IF EXISTS "Service role can manage streaming logs" ON public.streaming_access_logs;
CREATE POLICY "Service role manages streaming_access_logs"
ON public.streaming_access_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 10. subscribers (public -> service_role)
DROP POLICY IF EXISTS "service_role_manage_subscriptions" ON public.subscribers;
CREATE POLICY "Service role manages subscribers"
ON public.subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 11. suno_generated_tracks (public -> service_role)
DROP POLICY IF EXISTS "Service role can manage all tracks" ON public.suno_generated_tracks;
CREATE POLICY "Service role manages suno_generated_tracks"
ON public.suno_generated_tracks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 12. system_health_thresholds (public -> service_role)
DROP POLICY IF EXISTS "Admins can manage thresholds" ON public.system_health_thresholds;
CREATE POLICY "Service role manages system_health_thresholds"
ON public.system_health_thresholds FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 13. user_subscriptions (public -> service_role)
DROP POLICY IF EXISTS "Service role can manage user subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role manages user_subscriptions"
ON public.user_subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 14. webhook_endpoints (authenticated -> user scope avec created_by)
DROP POLICY IF EXISTS "Authenticated users can manage webhook endpoints" ON public.webhook_endpoints;
CREATE POLICY "Users can manage own webhook endpoints"
ON public.webhook_endpoints FOR ALL TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- 15. sandbox.competences_test (public -> service_role)
DROP POLICY IF EXISTS "Dev sandbox full access competences" ON sandbox.competences_test;
CREATE POLICY "Service role manages competences_test"
ON sandbox.competences_test FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 16. sandbox.items_test (public -> service_role)
DROP POLICY IF EXISTS "Dev sandbox full access items" ON sandbox.items_test;
CREATE POLICY "Service role manages items_test"
ON sandbox.items_test FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 17. sandbox.skills_test (public -> service_role)
DROP POLICY IF EXISTS "Dev sandbox full access skills" ON sandbox.skills_test;
CREATE POLICY "Service role manages skills_test"
ON sandbox.skills_test FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 18. sandbox.users_test (public -> service_role)
DROP POLICY IF EXISTS "Dev sandbox full access users" ON sandbox.users_test;
CREATE POLICY "Service role manages users_test"
ON sandbox.users_test FOR ALL TO service_role USING (true) WITH CHECK (true);