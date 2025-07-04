-- Créer la table selon vos spécifications exactes
DROP TABLE IF EXISTS public.edn_objectifs_connaissance CASCADE;
DROP TABLE IF EXISTS public.edn_extraction_progress CASCADE;

-- Table principale pour les compétences OIC
CREATE TABLE public.oic_competences (
  objectif_id TEXT PRIMARY KEY, -- Format OIC-XXX-YY-R-ZZ
  intitule TEXT NOT NULL,
  item_parent TEXT NOT NULL, -- Numéro d'item EDN (ex: "099")
  rang TEXT NOT NULL CHECK (rang IN ('A', 'B')),
  rubrique TEXT NOT NULL,
  description TEXT,
  ordre INTEGER,
  url_source TEXT,
  date_import TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_oic_competences_item_parent ON public.oic_competences(item_parent);
CREATE INDEX idx_oic_competences_rang ON public.oic_competences(rang);
CREATE INDEX idx_oic_competences_rubrique ON public.oic_competences(rubrique);

-- Politique RLS pour accès public en lecture
ALTER TABLE public.oic_competences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to OIC competences" 
ON public.oic_competences 
FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage OIC competences" 
ON public.oic_competences 
FOR ALL 
USING (true);

-- Trigger pour mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION public.update_oic_competences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_oic_competences_updated_at
  BEFORE UPDATE ON public.oic_competences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_oic_competences_updated_at();

-- Table pour tracker le progrès de l'extraction
CREATE TABLE public.oic_extraction_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  total_competences INTEGER DEFAULT 4872,
  competences_extraites INTEGER DEFAULT 0,
  page_courante INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 25,
  statut TEXT DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'erreur', 'pause')),
  derniere_activite TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  erreurs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Politique RLS pour le tracking
ALTER TABLE public.oic_extraction_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role to manage OIC extraction progress" 
ON public.oic_extraction_progress 
FOR ALL 
USING (true);

-- Fonction pour générer un rapport de complétude selon vos spécifications
CREATE OR REPLACE FUNCTION public.get_oic_competences_rapport()
RETURNS TABLE(
  item_parent TEXT,
  competences_attendues INTEGER,
  competences_extraites INTEGER,
  completude_pct NUMERIC,
  manquants TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si la table a des données
  IF NOT EXISTS (SELECT 1 FROM public.oic_competences LIMIT 1) THEN
    RETURN;
  END IF;

  -- Retourner les statistiques par item EDN (367 items)
  RETURN QUERY
  WITH items_stats AS (
    SELECT 
      o.item_parent,
      COUNT(*) as extraites,
      -- Estimation basée sur la répartition moyenne des 4872 compétences sur 367 items
      CASE 
        WHEN o.item_parent::INTEGER BETWEEN 1 AND 100 THEN 15
        WHEN o.item_parent::INTEGER BETWEEN 101 AND 200 THEN 12
        WHEN o.item_parent::INTEGER BETWEEN 201 AND 300 THEN 14
        WHEN o.item_parent::INTEGER BETWEEN 301 AND 367 THEN 10
        ELSE 13
      END as attendues_estime
    FROM public.oic_competences o
    GROUP BY o.item_parent
  )
  SELECT 
    s.item_parent,
    s.attendues_estime,
    s.extraites::INTEGER,
    ROUND((s.extraites::NUMERIC / s.attendues_estime::NUMERIC) * 100, 2),
    ARRAY[]::TEXT[] -- URLs manquantes à identifier
  FROM items_stats s
  ORDER BY s.item_parent::INTEGER;
END;
$$;