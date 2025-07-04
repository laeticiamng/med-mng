-- Création de la table pour stocker les objectifs de connaissance EDN
CREATE TABLE public.edn_objectifs_connaissance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objectif_id TEXT NOT NULL UNIQUE, -- Format OIC-XXX-YY-R-ZZ
  intitule TEXT NOT NULL,
  item_parent INTEGER NOT NULL, -- Numéro d'item EDN (ex: 099)
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
CREATE INDEX idx_edn_objectifs_item_parent ON public.edn_objectifs_connaissance(item_parent);
CREATE INDEX idx_edn_objectifs_rang ON public.edn_objectifs_connaissance(rang);
CREATE INDEX idx_edn_objectifs_rubrique ON public.edn_objectifs_connaissance(rubrique);

-- Politique RLS pour accès public en lecture
ALTER TABLE public.edn_objectifs_connaissance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to EDN objectifs" 
ON public.edn_objectifs_connaissance 
FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage EDN objectifs" 
ON public.edn_objectifs_connaissance 
FOR ALL 
USING (true);

-- Trigger pour mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION public.update_edn_objectifs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_edn_objectifs_updated_at
  BEFORE UPDATE ON public.edn_objectifs_connaissance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_edn_objectifs_updated_at();

-- Table pour tracker le progrès de l'extraction
CREATE TABLE public.edn_extraction_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  total_objectifs INTEGER DEFAULT 4872,
  objectifs_extraits INTEGER DEFAULT 0,
  page_courante INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 25,
  statut TEXT DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'erreur', 'pause')),
  derniere_activite TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  erreurs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Politique RLS pour le tracking
ALTER TABLE public.edn_extraction_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role to manage extraction progress" 
ON public.edn_extraction_progress 
FOR ALL 
USING (true);

-- Fonction pour générer un rapport de complétude
CREATE OR REPLACE FUNCTION public.get_edn_objectifs_rapport()
RETURNS TABLE(
  item_parent INTEGER,
  objectifs_attendus INTEGER,
  objectifs_extraits INTEGER,
  completude_pct NUMERIC,
  manquants TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH items_stats AS (
    SELECT 
      o.item_parent,
      COUNT(*) as extraits,
      -- Estimation basée sur la répartition moyenne (environ 13 objectifs par item)
      CASE 
        WHEN o.item_parent BETWEEN 1 AND 100 THEN 15
        WHEN o.item_parent BETWEEN 101 AND 200 THEN 12
        WHEN o.item_parent BETWEEN 201 AND 300 THEN 14
        ELSE 13
      END as attendus_estime
    FROM public.edn_objectifs_connaissance o
    GROUP BY o.item_parent
  )
  SELECT 
    s.item_parent,
    s.attendus_estime,
    s.extraits,
    ROUND((s.extraits::NUMERIC / s.attendus_estime::NUMERIC) * 100, 2),
    ARRAY[]::TEXT[] -- Les manquants seront identifiés lors de l'extraction complète
  FROM items_stats s
  ORDER BY s.item_parent;
END;
$$;