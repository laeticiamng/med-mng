-- ========================================
-- CORRECTION CRITIQUE SÉCURITÉ SUPABASE
-- ========================================
-- À exécuter en PRIORITÉ P0

-- 1. IDENTIFICATION ET CORRECTION DES SECURITY DEFINER VIEWS
-- ========================================

-- Lister toutes les vues avec SECURITY DEFINER
SELECT schemaname, viewname, viewowner 
FROM pg_views 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
AND definition LIKE '%SECURITY DEFINER%';

-- Exemple de correction type :
-- AVANT (problématique)
-- CREATE VIEW sensitive_data_view WITH (security_definer=true) AS
-- SELECT * FROM sensitive_table WHERE user_id = current_user_id();

-- APRÈS (sécurisé)
-- DROP VIEW IF EXISTS sensitive_data_view;
-- CREATE VIEW sensitive_data_view AS
-- SELECT * FROM sensitive_table 
-- WHERE user_id = auth.uid(); -- Utilise RLS au lieu de SECURITY DEFINER

-- 2. CORRECTION DES FONCTIONS SANS SEARCH_PATH
-- ========================================

-- Lister les fonctions problématiques
SELECT n.nspname as schema_name, 
       p.proname as function_name,
       pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'auth', 'storage')
AND prosecdef = false -- Pas SECURITY DEFINER
AND NOT EXISTS (
    SELECT 1 
    FROM pg_depend d 
    WHERE d.objid = p.oid 
    AND d.deptype = 'e'
);

-- Template de correction pour les fonctions :
/*
ALTER FUNCTION function_name(args) 
SET search_path = public, extensions;

-- Exemple concret :
ALTER FUNCTION calculate_completion_score(user_id uuid) 
SET search_path = public, extensions;
*/

-- 3. DÉPLACEMENT DES EXTENSIONS HORS SCHEMA PUBLIC
-- ========================================

-- Créer schema dédié pour les extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Exemple de déplacement (à adapter selon les extensions présentes) :
-- ALTER EXTENSION extension_name SET SCHEMA extensions;

-- 4. CONFIGURATION SÉCURISÉE DES OTP
-- ========================================

-- Réduire la durée de vie des OTP à 5 minutes
UPDATE auth.config 
SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{otp_expiry}',
    '300'::jsonb  -- 5 minutes en secondes
)
WHERE key = 'otp_expiry';

-- 5. VALIDATION DES RLS POLICIES
-- ========================================

-- Vérifier que toutes les tables ont RLS activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

-- Template pour activer RLS sur tables manquantes :
-- ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Vérifier les policies existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. CRÉATION DE POLICIES SÉCURISÉES TYPE
-- ========================================

-- Example de policy sécurisée pour table utilisateur :
/*
-- Lecture : utilisateur peut voir ses propres données
CREATE POLICY "users_select_own" ON users
FOR SELECT USING (auth.uid() = id);

-- Mise à jour : utilisateur peut modifier ses propres données
CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (auth.uid() = id);

-- Insertion : utilisateur peut créer son propre profil
CREATE POLICY "users_insert_own" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Suppression : utilisateur peut supprimer son propre profil
CREATE POLICY "users_delete_own" ON users
FOR DELETE USING (auth.uid() = id);
*/

-- 7. FONCTIONS D'AUDIT SÉCURITÉ
-- ========================================

-- Fonction pour auditer régulièrement la sécurité
CREATE OR REPLACE FUNCTION audit_security_status()
RETURNS TABLE (
    check_name text,
    status text,
    details text
) 
SECURITY DEFINER
SET search_path = public, auth, extensions
LANGUAGE plpgsql
AS $$
BEGIN
    -- Vérifier les vues SECURITY DEFINER
    RETURN QUERY
    SELECT 
        'security_definer_views'::text,
        CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END::text,
        'Found ' || COUNT(*) || ' views with SECURITY DEFINER'::text
    FROM pg_views 
    WHERE definition LIKE '%SECURITY DEFINER%'
    AND schemaname NOT IN ('information_schema', 'pg_catalog');
    
    -- Vérifier les tables sans RLS
    RETURN QUERY
    SELECT 
        'tables_without_rls'::text,
        CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END::text,
        'Found ' || COUNT(*) || ' tables without RLS'::text
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = false;
    
    -- Autres vérifications...
    
END;
$$;

-- 8. TRIGGER D'AUDIT AUTOMATIQUE
-- ========================================

-- Créer table pour logs d'audit
CREATE TABLE IF NOT EXISTS security_audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    check_date timestamptz DEFAULT now(),
    check_results jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS sur la table d'audit
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy : seuls les admins peuvent voir les logs d'audit
CREATE POLICY "security_audit_admin_only" ON security_audit_log
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Fonction pour exécuter l'audit automatiquement
CREATE OR REPLACE FUNCTION run_security_audit()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    audit_results jsonb;
BEGIN
    -- Exécuter l'audit et stocker les résultats
    SELECT jsonb_agg(row_to_json(r)) INTO audit_results
    FROM audit_security_status() r;
    
    -- Sauvegarder dans la table de log
    INSERT INTO security_audit_log (check_results)
    VALUES (audit_results);
    
    -- Lever une exception si des problèmes critiques sont détectés
    IF audit_results::text LIKE '%FAIL%' THEN
        RAISE EXCEPTION 'Critical security issues detected. Check security_audit_log for details.';
    END IF;
END;
$$;

-- Programmer l'audit automatique (à configurer côté Supabase)
-- SELECT cron.schedule('security-audit', '0 */6 * * *', 'SELECT run_security_audit();');

-- ========================================
-- INSTRUCTIONS D'EXÉCUTION
-- ========================================

/*
ÉTAPES À SUIVRE :

1. BACKUP : Sauvegarder la base AVANT toute modification
   pg_dump -h [host] -U [user] -d [database] > backup_pre_security_fix.sql

2. AUDIT INITIAL : 
   SELECT * FROM audit_security_status();

3. CORRECTIONS PAR ORDRE DE PRIORITÉ :
   a) Identifier et corriger les Security Definer Views
   b) Fixer le search_path des fonctions
   c) Déplacer les extensions
   d) Configurer les OTP
   e) Valider toutes les RLS policies

4. VALIDATION FINALE :
   SELECT * FROM audit_security_status();
   -- Tous les checks doivent être 'PASS'

5. MONITORING CONTINU :
   -- Configurer l'audit automatique
   -- Surveiller les logs de sécurité
   -- Alerte en cas de problème détecté

ATTENTION : 
- Tester d'abord sur un environnement de staging
- Valider chaque étape avant de passer à la suivante  
- Documenter toutes les modifications
- Informer l'équipe des changements de sécurité
*/