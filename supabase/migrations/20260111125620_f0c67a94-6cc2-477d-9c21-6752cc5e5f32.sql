-- =====================================================
-- AUDIT SECURITY FIX PART 2B: Continuer les corrections
-- Reprendre à partir de operation_logs
-- =====================================================

-- 13. operation_logs - Logs système
DROP POLICY IF EXISTS "Service role can insert logs" ON public.operation_logs;
DROP POLICY IF EXISTS "Service role manages operation_logs" ON public.operation_logs;
CREATE POLICY "Service role manages operation_logs" 
ON public.operation_logs 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 14. performance_metrics - Métriques système
DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leurs propres métriques" ON public.performance_metrics;
DROP POLICY IF EXISTS "Service role manages performance_metrics" ON public.performance_metrics;
CREATE POLICY "Service role manages performance_metrics" 
ON public.performance_metrics 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 15. pwa_metrics - Métriques PWA système
DROP POLICY IF EXISTS "pwa_metrics_delete_own" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_insert_all" ON public.pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_update_own" ON public.pwa_metrics;
DROP POLICY IF EXISTS "Service role manages pwa_metrics" ON public.pwa_metrics;
CREATE POLICY "Service role manages pwa_metrics" 
ON public.pwa_metrics 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 16. realtime_notifications - Système
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.realtime_notifications;
DROP POLICY IF EXISTS "Service role manages realtime_notifications" ON public.realtime_notifications;
CREATE POLICY "Service role manages realtime_notifications" 
ON public.realtime_notifications 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 17. retention_notifications - Système
DROP POLICY IF EXISTS "System can create notifications" ON public.retention_notifications;
DROP POLICY IF EXISTS "Service role manages retention_notifications" ON public.retention_notifications;
CREATE POLICY "Service role manages retention_notifications" 
ON public.retention_notifications 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 18. share_notifications - Système
DROP POLICY IF EXISTS "System can insert notifications" ON public.share_notifications;
DROP POLICY IF EXISTS "Service role manages share_notifications" ON public.share_notifications;
CREATE POLICY "Service role manages share_notifications" 
ON public.share_notifications 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 19. social_room_events - Events système
DROP POLICY IF EXISTS "events_insert" ON public.social_room_events;
DROP POLICY IF EXISTS "Service role manages social_room_events" ON public.social_room_events;
CREATE POLICY "Service role manages social_room_events" 
ON public.social_room_events 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 20. system_health_metrics - Métriques système
DROP POLICY IF EXISTS "System can insert health metrics" ON public.system_health_metrics;
DROP POLICY IF EXISTS "Service role manages system_health_metrics" ON public.system_health_metrics;
CREATE POLICY "Service role manages system_health_metrics" 
ON public.system_health_metrics 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 21. user_unlocked_modules - Système
DROP POLICY IF EXISTS "System can insert unlocked modules" ON public.user_unlocked_modules;
DROP POLICY IF EXISTS "Service role manages user_unlocked_modules" ON public.user_unlocked_modules;
CREATE POLICY "Service role manages user_unlocked_modules" 
ON public.user_unlocked_modules 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);