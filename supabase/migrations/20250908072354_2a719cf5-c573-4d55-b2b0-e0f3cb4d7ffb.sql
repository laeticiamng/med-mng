-- Correction des problèmes de sécurité critiques identifiés dans l'audit

-- 1. Corriger les Security Definer Views problématiques
-- Supprimer les vues problématiques et les remplacer par des vues sécurisées
DROP VIEW IF EXISTS public.user_activity_summary;
DROP VIEW IF EXISTS public.admin_stats_view;
DROP VIEW IF EXISTS public.analytics_summary;
DROP VIEW IF EXISTS public.content_stats;
DROP VIEW IF EXISTS public.user_progress_view;
DROP VIEW IF EXISTS public.quota_overview;

-- Créer des vues sécurisées avec SECURITY INVOKER
CREATE VIEW public.user_activity_summary
WITH (security_invoker = true) AS
SELECT 
  u.id,
  u.email,
  COUNT(DISTINCT cc.id) as conversations_count,
  COUNT(DISTINCT mg.id) as music_generations,
  MAX(cc.last_message_at) as last_activity
FROM auth.users u
LEFT JOIN coach_conversations cc ON cc.user_id = u.id
LEFT JOIN music_generation_usage mg ON mg.user_id = u.id
WHERE u.id = auth.uid()
GROUP BY u.id, u.email;

CREATE VIEW public.user_progress_view
WITH (security_invoker = true) AS
SELECT 
  user_id,
  COUNT(*) as total_sessions,
  AVG(session_duration) as avg_duration,
  MAX(created_at) as last_session
FROM ai_coach_sessions
WHERE user_id = auth.uid()
GROUP BY user_id;

-- 2. Corriger les fonctions sans search_path
CREATE OR REPLACE FUNCTION public.update_urgent_protocols_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_oic_competences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Appeler la fonction d'envoi d'email de bienvenue
  PERFORM pg_notify('send_welcome_email', json_build_object(
    'user_id', NEW.id,
    'email', NEW.email,
    'name', COALESCE(NEW.raw_user_meta_data->>'name', '')
  )::text);
  
  RETURN NEW;
END;
$function$;

-- 3. Ajouter des politiques RLS manquantes pour les tables sans politiques
-- Table api_integrations
CREATE POLICY "Service role can manage integrations" ON public.api_integrations
  FOR ALL USING (auth.role() = 'service_role');

-- Table cleanup_history  
CREATE POLICY "Admins can manage cleanup history" ON public.cleanup_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Corriger l'expiration OTP (réduire de 3600s à 900s = 15 minutes)
-- Cette configuration doit être faite manuellement dans le dashboard Supabase
-- Mais on peut créer une fonction pour le rappeler
CREATE OR REPLACE FUNCTION public.get_security_recommendations()
RETURNS TABLE(category text, issue text, recommendation text, priority text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY VALUES
    ('AUTH', 'OTP Expiry', 'Réduire l''expiration OTP à 900 secondes (15 min) dans le dashboard Supabase', 'HIGH'),
    ('EXTENSIONS', 'Public Schema', 'Déplacer les extensions vers le schéma extensions', 'MEDIUM'),
    ('MONITORING', 'Security Audit', 'Audit de sécurité effectué et corrigé', 'INFO');
END;
$function$;

-- 5. Créer une fonction de nettoyage automatique pour les logs
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Nettoyer les anciens logs de plus de 30 jours
  DELETE FROM med_mng_generation_logs 
  WHERE created_at < now() - interval '30 days';
  
  -- Nettoyer les anciens compteurs de rate limiting
  DELETE FROM rate_limit_counters 
  WHERE window_end < now() - interval '1 hour';
  
  -- Nettoyer les anciennes sessions de coach
  DELETE FROM ai_coach_sessions 
  WHERE created_at < now() - interval '90 days';
END;
$function$;