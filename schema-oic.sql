-- 🎫 TICKET 4-bis — Schéma complet pour l'extraction des objectifs EDN
-- Table des compétences OIC avec structure optimisée

-- Suppression des tables existantes si besoin
DROP TABLE IF EXISTS public.oic_competences CASCADE;
DROP TABLE IF EXISTS public.oic_extraction_progress CASCADE;

-- Table principale des compétences OIC
CREATE TABLE public.oic_competences (
  -- Identifiant unique au format OIC-XXX-YY-R-ZZ
  objectif_id TEXT PRIMARY KEY,
  
  -- Métadonnées de base
  intitule TEXT NOT NULL,
  item_parent TEXT NOT NULL,        -- XXX (001-367)
  rang TEXT NOT NULL CHECK (rang IN ('A', 'B')),
  rubrique TEXT,                    -- Nom complet de la rubrique
  description TEXT,
  ordre INTEGER,                    -- ZZ (ordre dans le rang)
  
  -- Traçabilité
  url_source TEXT UNIQUE NOT NULL,
  date_import TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hash_content TEXT,                -- Hash du contenu pour détecter les changements
  extraction_status TEXT DEFAULT 'complete' CHECK (extraction_status IN ('complete', 'partial', 'failed')),
  
  -- Données brutes pour debug et reprocessing
  raw_json JSONB,
  
  -- Horodatage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index de performance
CREATE INDEX idx_oic_item_parent ON public.oic_competences(item_parent);
CREATE INDEX idx_oic_rang ON public.oic_competences(rang);
CREATE INDEX idx_oic_rubrique ON public.oic_competences(rubrique);
CREATE INDEX idx_oic_date_import ON public.oic_competences(date_import);
CREATE INDEX idx_oic_extraction_status ON public.oic_competences(extraction_status);

-- Index composite pour analyses
CREATE INDEX idx_oic_item_rang ON public.oic_competences(item_parent, rang);
CREATE INDEX idx_oic_rubrique_rang ON public.oic_competences(rubrique, rang);

-- Index GIN pour recherche dans le JSON
CREATE INDEX idx_oic_raw_json ON public.oic_competences USING GIN(raw_json);

-- Table de suivi des extractions
CREATE TABLE public.oic_extraction_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  
  -- Progression
  page_number INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 98,      -- ~4872/50 batches
  items_extracted INTEGER DEFAULT 0,
  total_expected INTEGER DEFAULT 4872,
  
  -- État de la session
  status TEXT DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'termine', 'erreur', 'pause')),
  current_page_url TEXT,
  last_item_id TEXT,
  
  -- Gestion d'erreurs
  error_message TEXT,
  failed_urls JSONB DEFAULT '[]'::jsonb,
  
  -- Authentification (si nécessaire)
  auth_cookies TEXT,
  
  -- Horodatage
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour le suivi
CREATE INDEX idx_extraction_session ON public.oic_extraction_progress(session_id);
CREATE INDEX idx_extraction_status ON public.oic_extraction_progress(status);
CREATE INDEX idx_extraction_activity ON public.oic_extraction_progress(last_activity);

-- Fonction de mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION update_oic_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la mise à jour automatique
CREATE TRIGGER trigger_oic_updated_at
  BEFORE UPDATE ON public.oic_competences
  FOR EACH ROW
  EXECUTE FUNCTION update_oic_updated_at();

-- Politiques RLS (Row Level Security)
ALTER TABLE public.oic_competences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oic_extraction_progress ENABLE ROW LEVEL SECURITY;

-- Lecture publique des compétences
CREATE POLICY "Allow public read access to OIC competences" 
ON public.oic_competences FOR SELECT USING (true);

-- Gestion complète pour les service roles
CREATE POLICY "Allow service role to manage OIC competences" 
ON public.oic_competences FOR ALL USING (true);

CREATE POLICY "Allow service role to manage extraction progress" 
ON public.oic_extraction_progress FOR ALL USING (true);

-- Fonction de rapport de complétude améliorée
CREATE OR REPLACE FUNCTION public.get_oic_extraction_report()
RETURNS TABLE(
  summary JSONB,
  by_item JSONB,
  by_rubrique JSONB,
  missing_items TEXT[],
  failed_urls TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_extracted INTEGER;
  expected_total INTEGER := 4872;
  completeness_pct NUMERIC;
  by_item_stats JSONB;
  by_rubrique_stats JSONB;
  missing_items_list TEXT[];
  failed_extractions TEXT[];
BEGIN
  -- Statistiques globales
  SELECT COUNT(*) INTO total_extracted FROM public.oic_competences;
  
  completeness_pct := ROUND((total_extracted::NUMERIC / expected_total::NUMERIC) * 100, 2);
  
  -- Statistiques par item EDN
  SELECT jsonb_agg(
    jsonb_build_object(
      'item_parent', item_parent,
      'rang_a_count', COUNT(*) FILTER (WHERE rang = 'A'),
      'rang_b_count', COUNT(*) FILTER (WHERE rang = 'B'),
      'total_count', COUNT(*),
      'rubriques', jsonb_agg(DISTINCT rubrique) FILTER (WHERE rubrique IS NOT NULL)
    )
  ) INTO by_item_stats
  FROM public.oic_competences
  GROUP BY item_parent
  ORDER BY item_parent;
  
  -- Statistiques par rubrique
  SELECT jsonb_agg(
    jsonb_build_object(
      'rubrique', rubrique,
      'rang_a_count', COUNT(*) FILTER (WHERE rang = 'A'),
      'rang_b_count', COUNT(*) FILTER (WHERE rang = 'B'),
      'total_count', COUNT(*),
      'items_count', COUNT(DISTINCT item_parent)
    )
  ) INTO by_rubrique_stats
  FROM public.oic_competences
  WHERE rubrique IS NOT NULL
  GROUP BY rubrique
  ORDER BY rubrique;
  
  -- URLs échouées depuis les logs d'extraction
  SELECT array_agg(DISTINCT url) INTO failed_extractions
  FROM (
    SELECT jsonb_array_elements_text(failed_urls) as url
    FROM public.oic_extraction_progress
    WHERE failed_urls IS NOT NULL AND jsonb_array_length(failed_urls) > 0
  ) failed;
  
  -- Items EDN manquants (001-367)
  WITH expected_items AS (
    SELECT lpad(generate_series(1, 367)::text, 3, '0') as item_id
  ),
  extracted_items AS (
    SELECT DISTINCT item_parent FROM public.oic_competences
  )
  SELECT array_agg(item_id ORDER BY item_id) INTO missing_items_list
  FROM expected_items
  WHERE item_id NOT IN (SELECT item_parent FROM extracted_items);
  
  RETURN QUERY SELECT
    jsonb_build_object(
      'expected', expected_total,
      'extracted', total_extracted,
      'completeness_pct', completeness_pct,
      'missing_count', COALESCE(array_length(missing_items_list, 1), 0),
      'failed_count', COALESCE(array_length(failed_extractions, 1), 0),
      'items_covered', (
        SELECT COUNT(DISTINCT item_parent) FROM public.oic_competences
      ),
      'rubriques_count', (
        SELECT COUNT(DISTINCT rubrique) FROM public.oic_competences WHERE rubrique IS NOT NULL
      )
    ) as summary,
    COALESCE(by_item_stats, '[]'::jsonb) as by_item,
    COALESCE(by_rubrique_stats, '[]'::jsonb) as by_rubrique,
    COALESCE(missing_items_list, ARRAY[]::TEXT[]) as missing_items,
    COALESCE(failed_extractions, ARRAY[]::TEXT[]) as failed_urls;
END;
$$;

-- Fonction de nettoyage des extractions anciennes
CREATE OR REPLACE FUNCTION public.cleanup_old_extractions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les sessions d'extraction terminées depuis plus de 7 jours
  DELETE FROM public.oic_extraction_progress
  WHERE status IN ('termine', 'erreur')
  AND last_activity < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Fonction de validation de la complétude d'un item
CREATE OR REPLACE FUNCTION public.validate_item_completeness(item_code TEXT)
RETURNS TABLE(
  item_parent TEXT,
  rang_a_count BIGINT,
  rang_b_count BIGINT,
  total_count BIGINT,
  is_complete BOOLEAN,
  missing_rangs TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  rang_a_cnt BIGINT;
  rang_b_cnt BIGINT;
  missing_list TEXT[] := '{}';
BEGIN
  -- Compter les compétences par rang pour cet item
  SELECT 
    COUNT(*) FILTER (WHERE rang = 'A'),
    COUNT(*) FILTER (WHERE rang = 'B')
  INTO rang_a_cnt, rang_b_cnt
  FROM public.oic_competences
  WHERE oic_competences.item_parent = item_code;
  
  -- Déterminer les rangs manquants
  IF rang_a_cnt = 0 THEN
    missing_list := array_append(missing_list, 'A');
  END IF;
  
  IF rang_b_cnt = 0 THEN
    missing_list := array_append(missing_list, 'B');
  END IF;
  
  RETURN QUERY SELECT
    item_code,
    rang_a_cnt,
    rang_b_cnt,
    rang_a_cnt + rang_b_cnt,
    (rang_a_cnt > 0 AND rang_b_cnt > 0),
    missing_list;
END;
$$;

-- Vues utiles pour l'analyse
CREATE OR REPLACE VIEW public.v_oic_stats_by_item AS
SELECT 
  item_parent,
  COUNT(*) as total_competences,
  COUNT(*) FILTER (WHERE rang = 'A') as rang_a_count,
  COUNT(*) FILTER (WHERE rang = 'B') as rang_b_count,
  array_agg(DISTINCT rubrique ORDER BY rubrique) FILTER (WHERE rubrique IS NOT NULL) as rubriques,
  MIN(date_import) as first_imported,
  MAX(date_import) as last_imported,
  COUNT(*) FILTER (WHERE extraction_status = 'failed') as failed_count
FROM public.oic_competences
GROUP BY item_parent
ORDER BY item_parent;

CREATE OR REPLACE VIEW public.v_oic_stats_by_rubrique AS
SELECT 
  rubrique,
  COUNT(*) as total_competences,
  COUNT(*) FILTER (WHERE rang = 'A') as rang_a_count,
  COUNT(*) FILTER (WHERE rang = 'B') as rang_b_count,
  COUNT(DISTINCT item_parent) as items_count,
  array_agg(DISTINCT item_parent ORDER BY item_parent) as items_list
FROM public.oic_competences
WHERE rubrique IS NOT NULL
GROUP BY rubrique
ORDER BY total_competences DESC;

-- Commentaires pour la documentation
COMMENT ON TABLE public.oic_competences IS 'Compétences OIC extraites depuis LiSA UNESS - Format OIC-XXX-YY-R-ZZ';
COMMENT ON TABLE public.oic_extraction_progress IS 'Suivi des sessions d''extraction en temps réel';

COMMENT ON COLUMN public.oic_competences.objectif_id IS 'Identifiant unique OIC-XXX-YY-R-ZZ';
COMMENT ON COLUMN public.oic_competences.item_parent IS 'Numéro d''item EDN (001-367)';
COMMENT ON COLUMN public.oic_competences.rang IS 'Niveau de compétence A (base) ou B (approfondi)';
COMMENT ON COLUMN public.oic_competences.rubrique IS 'Domaine médical (Génétique, Cancérologie, etc.)';
COMMENT ON COLUMN public.oic_competences.raw_json IS 'Contenu MediaWiki brut pour debug et retraitement';

-- Configuration des permissions par défaut
GRANT SELECT ON public.oic_competences TO anon, authenticated;
GRANT SELECT ON public.v_oic_stats_by_item TO anon, authenticated;
GRANT SELECT ON public.v_oic_stats_by_rubrique TO anon, authenticated;

-- Messages de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Schéma OIC créé avec succès';
  RAISE NOTICE '📊 Tables: oic_competences, oic_extraction_progress';
  RAISE NOTICE '🔍 Vues: v_oic_stats_by_item, v_oic_stats_by_rubrique';
  RAISE NOTICE '⚡ Fonctions: get_oic_extraction_report(), validate_item_completeness()';
  RAISE NOTICE '🛡️ RLS activé avec politiques appropriées';
END $$;