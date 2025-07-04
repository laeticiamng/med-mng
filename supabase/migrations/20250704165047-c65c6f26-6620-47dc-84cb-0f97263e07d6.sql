-- Créer la table de progression pour l'extraction OIC si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.oic_extraction_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'en_cours',
  page_number INTEGER DEFAULT 1,
  items_extracted INTEGER DEFAULT 0,
  total_expected INTEGER DEFAULT 4872,
  total_pages INTEGER DEFAULT 25,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT,
  failed_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des compétences OIC si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.oic_competences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  objectif_id TEXT NOT NULL UNIQUE,
  intitule TEXT NOT NULL,
  item_parent TEXT NOT NULL,
  rang TEXT NOT NULL,
  rubrique TEXT NOT NULL,
  description TEXT,
  ordre INTEGER,
  url_source TEXT NOT NULL,
  hash_content TEXT,
  date_import TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extraction_status TEXT DEFAULT 'complete',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_oic_competences_item_parent ON public.oic_competences(item_parent);
CREATE INDEX IF NOT EXISTS idx_oic_competences_rang ON public.oic_competences(rang);
CREATE INDEX IF NOT EXISTS idx_oic_extraction_progress_session ON public.oic_extraction_progress(session_id);

-- Fonction pour générer le rapport OIC
CREATE OR REPLACE FUNCTION public.get_oic_extraction_report()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_extracted INTEGER;
  result JSONB;
BEGIN
  -- Compter le total extrait
  SELECT COUNT(*) INTO total_extracted FROM public.oic_competences;
  
  -- Construire le rapport
  SELECT jsonb_build_object(
    'summary', jsonb_build_object(
      'expected', 4872,
      'extracted', total_extracted,
      'completeness_pct', ROUND((total_extracted::numeric / 4872) * 100, 2)
    ),
    'by_item', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'item_parent', item_parent,
          'total_count', count(*)
        )
      )
      FROM public.oic_competences
      GROUP BY item_parent
      ORDER BY item_parent
    ),
    'generated_at', NOW()
  ) INTO result;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.oic_extraction_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oic_competences ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read access to oic_competences" ON public.oic_competences;
DROP POLICY IF EXISTS "Allow service role to manage oic_competences" ON public.oic_competences;
DROP POLICY IF EXISTS "Allow public read access to oic_extraction_progress" ON public.oic_extraction_progress;
DROP POLICY IF EXISTS "Allow service role to manage oic_extraction_progress" ON public.oic_extraction_progress;

-- Créer les nouvelles politiques RLS
CREATE POLICY "Allow public read access to oic_competences" 
ON public.oic_competences FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage oic_competences" 
ON public.oic_competences FOR ALL 
USING (true);

CREATE POLICY "Allow public read access to oic_extraction_progress" 
ON public.oic_extraction_progress FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage oic_extraction_progress" 
ON public.oic_extraction_progress FOR ALL 
USING (true);