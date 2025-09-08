-- 🔒 CORRECTIONS SÉCURITÉ CRITIQUES V2 - MED-MNG
-- Fix des Security Definer Views sans référence à user_id manquant

-- 1. Corriger les Security Definer Views (remplacer par des fonctions sécurisées)
DROP VIEW IF EXISTS public.team_emotion_summary CASCADE;
DROP VIEW IF EXISTS public.user_achievements_view CASCADE;
DROP VIEW IF EXISTS public.user_stats_view CASCADE;
DROP VIEW IF EXISTS public.music_generation_analytics CASCADE;
DROP VIEW IF EXISTS public.content_analytics CASCADE;
DROP VIEW IF EXISTS public.performance_metrics_view CASCADE;

-- 2. Créer une table d'audit sécurisée pour les actions sensibles
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action_type text NOT NULL,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  session_id text,
  risk_score integer DEFAULT 0
);

-- Activer RLS sur la table d'audit
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Politique: Seuls les admins peuvent voir les logs d'audit
CREATE POLICY "Admins only audit access" ON public.security_audit_log
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 3. Fonction pour nettoyer automatiquement les anciens logs
CREATE OR REPLACE FUNCTION public.cleanup_security_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  -- Nettoyer les logs de plus de 90 jours
  DELETE FROM public.security_audit_log 
  WHERE created_at < now() - INTERVAL '90 days';
  
  -- Nettoyer les anciens logs de rate limiting si la table existe
  DELETE FROM public.rate_limit_counters 
  WHERE window_end < now() - INTERVAL '2 hours'
  AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limit_counters');
END;
$$;

-- 4. Index de performance pour les nouvelles tables
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action_type ON public.security_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_risk_score ON public.security_audit_log(risk_score) WHERE risk_score > 5;

-- 5. Fonction pour analyser les métriques de sécurité
CREATE OR REPLACE FUNCTION public.get_security_metrics()
RETURNS TABLE(
  metric_name text,
  metric_value numeric,
  status text,
  last_updated timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  WITH metrics AS (
    SELECT 
      'high_risk_actions'::text as name,
      COUNT(*)::numeric as value,
      CASE WHEN COUNT(*) > 10 THEN 'WARNING' ELSE 'OK' END as status,
      now() as updated
    FROM public.security_audit_log 
    WHERE risk_score >= 7 
    AND created_at >= current_date - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
      'failed_authentications'::text as name,
      COUNT(*)::numeric as value,
      CASE WHEN COUNT(*) > 50 THEN 'CRITICAL' ELSE 'OK' END as status,
      now() as updated
    FROM public.security_audit_log 
    WHERE action_type = 'auth_failure'
    AND created_at >= current_date - INTERVAL '1 day'
  )
  SELECT name, value, status, updated FROM metrics;
END;
$$;