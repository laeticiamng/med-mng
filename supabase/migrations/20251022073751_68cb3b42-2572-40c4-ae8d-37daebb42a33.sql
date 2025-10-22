
-- ================================================================
-- CORRECTION SÉCURITÉ : Table parcours_presets
-- ================================================================
-- Problème : RLS activé mais aucune policy définie
-- Solution : Ajouter policies lecture publique + écriture service-only

-- Table parcours_presets contient les presets de parcours émotionnels
-- Configuration publique mais modification restreinte au service_role

-- Policy 1: Lecture publique (tous peuvent voir les presets disponibles)
CREATE POLICY "Public can view parcours presets"
ON public.parcours_presets
FOR SELECT
USING (true);

-- Policy 2: Service role peut tout faire (INSERT, UPDATE, DELETE)
CREATE POLICY "Service role has full access to parcours presets"
ON public.parcours_presets
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Vérification : Confirmer que RLS est bien activé
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'parcours_presets') THEN
    ALTER TABLE public.parcours_presets ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS activé sur parcours_presets';
  ELSE
    RAISE NOTICE 'RLS déjà activé sur parcours_presets';
  END IF;
END $$;

-- ================================================================
-- NOTE: Extension pg_net
-- ================================================================
-- L'extension pg_net dans le schéma public est une limitation Supabase
-- Cette extension est gérée par Supabase et ne peut pas être déplacée
-- via migration utilisateur. C'est un warning accepté et documenté.

-- ================================================================
-- DOCUMENTATION
-- ================================================================
COMMENT ON POLICY "Public can view parcours presets" ON public.parcours_presets IS
  'Permet à tous les utilisateurs (authentifiés ou non) de consulter les presets de parcours disponibles. Lecture seule pour transparence.';

COMMENT ON POLICY "Service role has full access to parcours presets" ON public.parcours_presets IS
  'Seul le service_role peut créer, modifier ou supprimer des presets. Protection contre modifications non autorisées.';
