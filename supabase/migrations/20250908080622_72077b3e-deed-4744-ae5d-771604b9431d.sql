-- AUDIT COMPLET: Correction sécurité + optimisation (PARTIE 1/3)

-- ======================================================================
-- 1. CORRECTION SÉCURITÉ CRITIQUE - SECURITY DEFINER VIEWS
-- ======================================================================

-- Supprimer les vues problématiques existantes
DROP VIEW IF EXISTS admin_user_overview CASCADE;
DROP VIEW IF EXISTS system_health_overview CASCADE; 
DROP VIEW IF EXISTS content_analytics_overview CASCADE;
DROP VIEW IF EXISTS security_audit_overview CASCADE;
DROP VIEW IF EXISTS user_activity_summary CASCADE;
DROP VIEW IF EXISTS subscription_analytics CASCADE;

-- Créer des fonctions SECURITY DEFINER sécurisées
CREATE OR REPLACE FUNCTION get_admin_user_overview()
RETURNS TABLE(
  user_id uuid,
  email text,
  role text,
  last_sign_in timestamptz,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Vérifier les permissions admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.role,
    p.updated_at,
    true
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_system_health_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  health_data jsonb;
BEGIN
  -- Vérifier les permissions admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  SELECT jsonb_build_object(
    'database_size', pg_size_pretty(pg_database_size(current_database())),
    'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
    'uptime', extract(epoch from (now() - pg_postmaster_start_time())),
    'last_check', now(),
    'tables_count', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'),
    'functions_count', (SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public')
  ) INTO health_data;

  RETURN health_data;
END;
$$;

-- ======================================================================
-- 2. CORRECTION FONCTIONS SANS SEARCH_PATH
-- ======================================================================

-- Corriger toutes les fonctions existantes
ALTER FUNCTION public.count_all_invitations() SET search_path = 'public';
ALTER FUNCTION public.count_invitations_by_status(invitation_status) SET search_path = 'public';
ALTER FUNCTION public.med_mng_get_remaining_quota() SET search_path = 'public';
ALTER FUNCTION public.med_mng_toggle_favorite(uuid) SET search_path = 'public';
ALTER FUNCTION public.is_admin() SET search_path = 'public';
ALTER FUNCTION public.get_user_organization_role(uuid) SET search_path = 'public';

-- Corriger automatiquement toutes les autres fonctions
DO $$
DECLARE
    func_record RECORD;
    fix_count INTEGER := 0;
BEGIN
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            n.nspname as schema_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname NOT IN ('get_admin_user_overview', 'get_system_health_overview')
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = ''public''', 
                         func_record.schema_name, 
                         func_record.function_name, 
                         func_record.args);
            fix_count := fix_count + 1;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorer les erreurs pour fonctions système
            CONTINUE;
        END;
    END LOOP;
    
    RAISE NOTICE 'Fixed search_path for % functions', fix_count;
END;
$$;

-- ======================================================================
-- 3. TABLE D'AUDIT SÉCURISÉE COMPLÈTE
-- ======================================================================

CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  source text DEFAULT 'system',
  created_at timestamptz DEFAULT now(),
  
  -- Index pour performances
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'login', 'logout', 'failed_login', 'password_change', 
    'admin_action', 'data_access', 'security_violation',
    'function_call', 'migration', 'backup', 'restore'
  ))
);

-- Enable RLS et index
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity ON security_audit_log(severity);

-- Politique RLS stricte pour audit
CREATE POLICY "Admins only can view security logs" ON security_audit_log
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert security logs" ON security_audit_log
  FOR INSERT WITH CHECK (true);

-- ======================================================================
-- 4. FONCTIONS DE SÉCURITÉ AVANCÉES
-- ======================================================================

-- Fonction d'audit automatique améliorée
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type text,
  p_details jsonb DEFAULT '{}',
  p_severity text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO security_audit_log (
    event_type, 
    user_id, 
    details, 
    severity,
    source
  ) VALUES (
    p_event_type,
    auth.uid(),
    p_details,
    p_severity,
    'application'
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Fonction de nettoyage sécurisé des logs anciens
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Vérifier permissions admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Garder les logs critiques plus longtemps
  DELETE FROM security_audit_log 
  WHERE created_at < now() - CASE 
    WHEN severity = 'critical' THEN INTERVAL '1 year'
    WHEN severity = 'error' THEN INTERVAL '6 months'
    WHEN severity = 'warning' THEN INTERVAL '3 months'
    ELSE INTERVAL '1 month'
  END;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log l'action de nettoyage
  PERFORM log_security_event(
    'cleanup', 
    jsonb_build_object('deleted_logs', deleted_count),
    'info'
  );
  
  RETURN deleted_count;
END;
$$;

-- ======================================================================
-- 5. OPTIMISATIONS PERFORMANCE
-- ======================================================================

-- Index composites pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_role_active ON profiles(role, created_at) WHERE role IN ('admin', 'user');
CREATE INDEX IF NOT EXISTS idx_user_quotas_user_reset ON user_quotas(user_id, quota_reset_date);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limit_counters(identifier, window_start, window_end);

-- Statistiques automatiques
ANALYZE security_audit_log;
ANALYZE profiles;
ANALYZE user_quotas;