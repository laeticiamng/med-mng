-- 1. Ajouter colonne language à profiles si manquante
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';

-- 2. Corriger RLS sur user_settings pour permettre l'accès anonyme
-- D'abord supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_select_policy" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_insert_policy" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_update_policy" ON public.user_settings;

-- Créer des politiques permissives pour les utilisateurs anonymes et authentifiés
CREATE POLICY "user_settings_public_read"
ON public.user_settings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "user_settings_public_insert"
ON public.user_settings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "user_settings_public_update"
ON public.user_settings
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);