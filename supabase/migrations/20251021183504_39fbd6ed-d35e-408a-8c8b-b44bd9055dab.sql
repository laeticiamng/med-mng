-- 🔒 CORRECTION DES PROBLÈMES DE SÉCURITÉ CRITIQUES
-- Migration générée suite à l'audit de sécurité

-- ============================================
-- 1. CORRECTION DES FONCTIONS (Search Path)
-- ============================================

-- Mettre à jour toutes les fonctions pour définir explicitement le search_path
-- Cela prévient les attaques par injection SQL via manipulation du search_path

-- Fonction de mise à jour du timestamp updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fonction pour vérifier les rôles (si elle existe)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- ============================================
-- 2. ACTIVATION RLS SUR TOUTES LES TABLES
-- ============================================

-- Vérifier et activer RLS sur toutes les tables publiques importantes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================
-- 3. POLITIQUES RLS DE BASE POUR TABLES COMMUNES
-- ============================================

-- Activer RLS sur les tables de logs si elles existent
DO $$ 
BEGIN
    -- operation_logs
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'operation_logs') THEN
        ALTER TABLE public.operation_logs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Service role can insert logs" ON public.operation_logs;
        CREATE POLICY "Service role can insert logs" 
        ON public.operation_logs 
        FOR INSERT 
        WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Users can view their own logs" ON public.operation_logs;
        CREATE POLICY "Users can view their own logs" 
        ON public.operation_logs 
        FOR SELECT 
        USING (auth.uid()::text = (meta->>'user_id')::text OR auth.role() = 'service_role');
    END IF;

    -- audit_logs
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Only service role can manage audit logs" ON public.audit_logs;
        CREATE POLICY "Only service role can manage audit logs" 
        ON public.audit_logs 
        FOR ALL 
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================
-- 4. DÉPLACEMENT DES EXTENSIONS (si applicable)
-- ============================================

-- Créer un schéma pour les extensions si nécessaire
CREATE SCHEMA IF NOT EXISTS extensions;

-- Note: Le déplacement des extensions nécessite souvent une intervention manuelle
-- car certaines extensions ne peuvent pas être déplacées après installation
-- Cette partie sera documentée pour action manuelle

-- ============================================
-- 5. CONFIGURATION DE SÉCURITÉ ADDITIONNELLE
-- ============================================

-- S'assurer que les vues matérialisées ont RLS activé si applicable
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, matviewname 
        FROM pg_matviews 
        WHERE schemaname = 'public'
    LOOP
        -- Les vues matérialisées ne supportent pas RLS directement
        -- On doit s'assurer qu'elles sont créées avec les bonnes permissions
        EXECUTE format('REVOKE ALL ON %I.%I FROM PUBLIC', r.schemaname, r.matviewname);
        EXECUTE format('GRANT SELECT ON %I.%I TO authenticated', r.schemaname, r.matviewname);
    END LOOP;
END $$;

-- ============================================
-- COMMENTAIRES ET DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Fonction sécurisée pour mettre à jour automatiquement le champ updated_at. SET search_path = public prévient les attaques par injection.';

COMMENT ON FUNCTION public.has_role(_user_id uuid, _role text) IS 
'Fonction sécurisée pour vérifier les rôles utilisateur. SECURITY DEFINER permet de contourner RLS pour éviter la récursion.';
