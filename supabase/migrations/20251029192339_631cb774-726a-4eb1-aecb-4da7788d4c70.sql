-- Table pour stocker les résultats d'audit de complétude des items EDN
CREATE TABLE IF NOT EXISTS public.edn_items_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code TEXT NOT NULL,
  audit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completeness_score INTEGER, -- Score de complétude sur 100
  rang_a_complete BOOLEAN, -- Compétences rang A complètes
  rang_b_complete BOOLEAN, -- Compétences rang B complètes
  missing_rang_a TEXT[], -- Liste des compétences rang A manquantes
  missing_rang_b TEXT[], -- Liste des compétences rang B manquantes
  ai_analysis JSONB, -- Analyse détaillée de l'IA
  suggestions TEXT, -- Suggestions d'amélioration
  status TEXT DEFAULT 'pending', -- pending, analyzing, completed, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_edn_items_audit_item_code ON public.edn_items_audit(item_code);
CREATE INDEX idx_edn_items_audit_status ON public.edn_items_audit(status);
CREATE INDEX idx_edn_items_audit_audit_date ON public.edn_items_audit(audit_date DESC);

-- RLS policies
ALTER TABLE public.edn_items_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audit results"
ON public.edn_items_audit FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert audit results"
ON public.edn_items_audit FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update audit results"
ON public.edn_items_audit FOR UPDATE
USING (true);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_edn_items_audit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_edn_items_audit_updated_at
BEFORE UPDATE ON public.edn_items_audit
FOR EACH ROW
EXECUTE FUNCTION public.update_edn_items_audit_updated_at();
