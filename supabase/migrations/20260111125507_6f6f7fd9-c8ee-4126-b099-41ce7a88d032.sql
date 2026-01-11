-- =====================================================
-- AUDIT SECURITY FIX: Corriger les policies RLS trop permissives
-- =====================================================

-- 1. dsar_requests: Table avec user_id - Restreindre aux propriétaires
DROP POLICY IF EXISTS "Approvers can update DSAR requests" ON public.dsar_requests;
CREATE POLICY "Users can update own DSAR requests" 
ON public.dsar_requests 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. emotionscare_songs: Pas de user_id, table de contenu partagé - Restreindre UPDATE à service_role
DROP POLICY IF EXISTS "Users can update their own songs" ON public.emotionscare_songs;
CREATE POLICY "Service role can update songs" 
ON public.emotionscare_songs 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- 3. scheduled_reports: Table admin - Restreindre à service_role
DROP POLICY IF EXISTS "Allow authenticated delete scheduled_reports" ON public.scheduled_reports;
DROP POLICY IF EXISTS "Allow authenticated insert scheduled_reports" ON public.scheduled_reports;
DROP POLICY IF EXISTS "Allow authenticated update scheduled_reports" ON public.scheduled_reports;

CREATE POLICY "Service role manages scheduled_reports" 
ON public.scheduled_reports 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 4. compliance_audits: Table admin avec triggered_by - Restreindre insertion
DROP POLICY IF EXISTS "Authenticated users can create compliance audits" ON public.compliance_audits;
CREATE POLICY "Users can insert own compliance audits" 
ON public.compliance_audits 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = triggered_by);

-- 5. compliance_recommendations: Table admin - Restreindre à service_role pour UPDATE
DROP POLICY IF EXISTS "Users can update recommendations" ON public.compliance_recommendations;
CREATE POLICY "Service role can update recommendations" 
ON public.compliance_recommendations 
FOR UPDATE 
TO service_role
USING (true);

-- 6. accessibility_report_config: Table admin singleton - Restreindre à service_role
DROP POLICY IF EXISTS "Users can insert report config" ON public.accessibility_report_config;
DROP POLICY IF EXISTS "Users can update report config" ON public.accessibility_report_config;

CREATE POLICY "Service role manages accessibility_report_config" 
ON public.accessibility_report_config 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 7. b2b_anonymous_sessions: Garder INSERT pour authenticated mais c'est correct (sessions anonymes B2B)
-- Cette policy est acceptable car les sessions B2B sont créées par des utilisateurs authentifiés

-- 8. emotionsroom_rooms: Ajouter created_by pour tracker le créateur
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.emotionsroom_rooms;
-- Vérifier si la colonne created_by existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'emotionsroom_rooms' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.emotionsroom_rooms ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

CREATE POLICY "Users can create emotionsroom rooms" 
ON public.emotionsroom_rooms 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- 9. org_ethical_disclaimers: Table org - Restreindre à service_role
DROP POLICY IF EXISTS "org_disclaimers_insert" ON public.org_ethical_disclaimers;
CREATE POLICY "Service role manages org_ethical_disclaimers" 
ON public.org_ethical_disclaimers 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- FIX: Functions sans search_path
-- =====================================================

-- Mise à jour des fonctions avec search_path sécurisé
-- Note: Les fonctions spécifiques seront identifiées et corrigées individuellement

-- =====================================================
-- CLEANUP: Supprimer les policies orphelines ou dupliquées
-- =====================================================