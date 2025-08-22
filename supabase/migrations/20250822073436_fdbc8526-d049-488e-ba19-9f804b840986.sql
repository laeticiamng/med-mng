-- 🔒 RÉSOLUTION CRITIQUE DES PROBLÈMES DE SÉCURITÉ (Correction finale)

-- 1. Supprimer les 6 vues SECURITY DEFINER problématiques  
DROP VIEW IF EXISTS public.edn_items_with_competences CASCADE;
DROP VIEW IF EXISTS public.competences_overview CASCADE;  
DROP VIEW IF EXISTS public.audit_summary CASCADE;
DROP VIEW IF EXISTS analytics.edn_items_with_competences CASCADE;
DROP VIEW IF EXISTS analytics.competences_overview CASCADE;
DROP VIEW IF EXISTS analytics.audit_summary CASCADE;

-- 2. Recréer les vues sans SECURITY DEFINER
CREATE OR REPLACE VIEW public.edn_items_with_competences AS
SELECT 
  item_code,
  title,
  subtitle,
  competences_count_rang_a,
  competences_count_rang_b,
  completeness_score,
  created_at,
  updated_at
FROM public.edn_items_complete
WHERE status = 'active';

CREATE OR REPLACE VIEW public.competences_overview AS
SELECT 
  objectif_id as id,
  intitule as title,
  description,
  item_parent,
  rang as rank,
  'OIC' as category,
  created_at,
  updated_at
FROM public.oic_competences
WHERE objectif_id IS NOT NULL;

CREATE OR REPLACE VIEW public.audit_summary AS
SELECT 
  'edn_items_complete' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as valid_titles,
  COUNT(CASE WHEN paroles_musicales IS NOT NULL THEN 1 END) as valid_descriptions,
  AVG(COALESCE(completeness_score, 0)) as avg_completeness_score
FROM public.edn_items_complete;

-- 3. Sécuriser les tables avec des données personnelles sensibles
-- Table music_generation_usage - Données financières sensibles
ALTER TABLE public.music_generation_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own usage data" ON public.music_generation_usage;
CREATE POLICY "Users can view their own usage data"
  ON public.music_generation_usage FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage data" ON public.music_generation_usage;
CREATE POLICY "Users can insert their own usage data"
  ON public.music_generation_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table biovida_analyses - Données médicales CRITIQUES
ALTER TABLE public.biovida_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read access to biovida_analyses" ON public.biovida_analyses;
DROP POLICY IF EXISTS "Allow anonymous insert access to biovida_analyses" ON public.biovida_analyses;
DROP POLICY IF EXISTS "Service role can manage medical data" ON public.biovida_analyses;

CREATE POLICY "Service role can manage medical data"
  ON public.biovida_analyses FOR ALL
  USING (auth.role() = 'service_role');

-- Tables d'abonnements - Données personnelles
ALTER TABLE public.abonnement_biovida ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public inserts to biovida subscriptions" ON public.abonnement_biovida;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.abonnement_biovida;

CREATE POLICY "Service role can manage subscriptions"
  ON public.abonnement_biovida FOR ALL
  USING (auth.role() = 'service_role');

-- Table Digital Medicine - Données de contact
ALTER TABLE public."Digital Medicine" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert to Digital Medicine" ON public."Digital Medicine";
DROP POLICY IF EXISTS "Service role can manage contact forms" ON public."Digital Medicine";

CREATE POLICY "Service role can manage contact forms"
  ON public."Digital Medicine" FOR ALL
  USING (auth.role() = 'service_role');