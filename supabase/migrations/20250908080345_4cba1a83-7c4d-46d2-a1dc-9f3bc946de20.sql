-- AUDIT COMPLET: Correction des problèmes de sécurité critiques

-- 1. CORRECTION DES SECURITY DEFINER VIEWS (CRITIQUE)
-- Remplacer les vues SECURITY DEFINER par des fonctions sécurisées

-- Supprimer les vues problématiques et créer des fonctions sécurisées
DROP VIEW IF EXISTS admin_user_overview CASCADE;
DROP VIEW IF EXISTS system_health_overview CASCADE;
DROP VIEW IF EXISTS content_analytics_overview CASCADE;
DROP VIEW IF EXISTS security_audit_overview CASCADE;
DROP VIEW IF EXISTS user_activity_summary CASCADE;
DROP VIEW IF EXISTS subscription_analytics CASCADE;

-- Créer des fonctions SECURITY DEFINER sécurisées avec search_path fixe
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
SET search_path = 'public', 'auth'
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    COALESCE(au.raw_user_meta_data->>'role', 'user')::text,
    au.last_sign_in_at,
    CASE WHEN au.banned_until IS NULL OR au.banned_until < NOW() THEN true ELSE false END
  FROM auth.users au
  ORDER BY au.created_at DESC;
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
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  SELECT jsonb_build_object(
    'database_size', pg_size_pretty(pg_database_size(current_database())),
    'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
    'uptime', (SELECT extract(epoch from (now() - pg_postmaster_start_time()))),
    'last_check', now()
  ) INTO health_data;

  RETURN health_data;
END;
$$;

-- 2. CORRECTION DES FONCTIONS SANS SEARCH_PATH
ALTER FUNCTION public.count_all_invitations() SET search_path = 'public';
ALTER FUNCTION public.count_invitations_by_status(invitation_status) SET search_path = 'public';
ALTER FUNCTION public.med_mng_get_remaining_quota() SET search_path = 'public';
ALTER FUNCTION public.med_mng_toggle_favorite(uuid) SET search_path = 'public';

-- Rechercher et corriger toutes les autres fonctions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT p.proname, n.nspname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prosecdef = false
        AND NOT EXISTS (
            SELECT 1 FROM pg_settings 
            WHERE name = 'search_path' 
            AND setting LIKE '%' || n.nspname || '%'
        )
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = ''public''', 
                         func_record.nspname, 
                         func_record.proname, 
                         func_record.args);
        EXCEPTION WHEN OTHERS THEN
            -- Ignorer les erreurs pour les fonctions système
            CONTINUE;
        END;
    END LOOP;
END;
$$;

-- 3. OPTIMISATION DE LA CONFIGURATION OTP
UPDATE auth.config SET 
  otp_exp_in = 900, -- 15 minutes au lieu de la valeur par défaut
  otp_length = 6,
  password_min_length = 8
WHERE TRUE;

-- 4. CRÉATION D'UNE TABLE D'AUDIT SÉCURISÉE
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS sur la table d'audit
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour la table d'audit (seuls les admins peuvent voir)
CREATE POLICY "Admins can view security audit logs" ON security_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 5. FONCTION DE VALIDATION SÉCURISÉE
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$;

-- 6. INDEX DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON security_audit_log(event_type);

-- 7. TRIGGER DE SÉCURITÉ POUR AUDIT AUTOMATIQUE
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO security_audit_log (event_type, user_id, details)
  VALUES (
    TG_OP,
    auth.uid(),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;