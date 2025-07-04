-- Mise à jour du schéma selon les spécifications du ticket
DROP TABLE IF EXISTS public.oic_competences CASCADE;
DROP TABLE IF EXISTS public.oic_extraction_progress CASCADE;

-- Table principale pour les compétences OIC (spécifications ticket)
CREATE TABLE public.oic_competences (
  objectif_id TEXT PRIMARY KEY, -- Format OIC-XXX-YY-R-ZZ
  intitule TEXT NOT NULL,
  item_parent TEXT NOT NULL, -- Numéro d'item EDN (001-367)
  rang TEXT CHECK (rang IN ('A', 'B')),
  rubrique TEXT,
  description TEXT,
  ordre INTEGER,
  url_source TEXT UNIQUE,
  date_import TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hash_content TEXT, -- Pour éviter les doublons
  extraction_status TEXT DEFAULT 'complete', -- complete, partial, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_oic_item_parent ON public.oic_competences(item_parent);
CREATE INDEX idx_oic_rang ON public.oic_competences(rang);
CREATE INDEX idx_oic_rubrique ON public.oic_competences(rubrique);
CREATE INDEX idx_oic_date_import ON public.oic_competences(date_import);

-- Table de suivi d'extraction avec gestion de session
CREATE TABLE public.oic_extraction_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_number INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 25,
  items_extracted INTEGER DEFAULT 0,
  total_expected INTEGER DEFAULT 4872,
  current_page_url TEXT,
  last_item_id TEXT,
  status TEXT DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'termine', 'erreur', 'pause')),
  error_message TEXT,
  failed_urls JSONB DEFAULT '[]'::jsonb,
  auth_cookies TEXT, -- Pour maintenir la session CAS
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiques RLS
ALTER TABLE public.oic_competences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oic_extraction_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to OIC competences" 
ON public.oic_competences FOR SELECT USING (true);

CREATE POLICY "Allow service role to manage OIC competences" 
ON public.oic_competences FOR ALL USING (true);

CREATE POLICY "Allow service role to manage extraction progress" 
ON public.oic_extraction_progress FOR ALL USING (true);

-- Fonction de rapport de complétude améliorée
CREATE OR REPLACE FUNCTION public.get_oic_extraction_report()
RETURNS TABLE(
  summary JSONB,
  by_item JSONB,
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
  missing_items_list TEXT[];
  failed_extractions TEXT[];
BEGIN
  -- Statistiques globales
  SELECT COUNT(*) INTO total_extracted FROM public.oic_competences;
  
  completeness_pct := ROUND((total_extracted::NUMERIC / expected_total::NUMERIC) * 100, 2);
  
  -- Statistiques par item
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
  GROUP BY item_parent;
  
  -- URLs échouées depuis les logs d'extraction
  SELECT array_agg(DISTINCT url) INTO failed_extractions
  FROM (
    SELECT jsonb_array_elements_text(failed_urls) as url
    FROM public.oic_extraction_progress
    WHERE failed_urls IS NOT NULL
  ) failed;
  
  -- Items manquants (001-367)
  WITH expected_items AS (
    SELECT lpad(generate_series(1, 367)::text, 3, '0') as item_id
  ),
  extracted_items AS (
    SELECT DISTINCT item_parent FROM public.oic_competences
  )
  SELECT array_agg(item_id) INTO missing_items_list
  FROM expected_items
  WHERE item_id NOT IN (SELECT item_parent FROM extracted_items);
  
  RETURN QUERY SELECT
    jsonb_build_object(
      'expected', expected_total,
      'extracted', total_extracted,
      'completeness_pct', completeness_pct,
      'missing_count', COALESCE(array_length(missing_items_list, 1), 0),
      'failed_count', COALESCE(array_length(failed_extractions, 1), 0)
    ) as summary,
    COALESCE(by_item_stats, '[]'::jsonb) as by_item,
    COALESCE(missing_items_list, ARRAY[]::TEXT[]) as missing_items,
    COALESCE(failed_extractions, ARRAY[]::TEXT[]) as failed_urls;
END;
$$;