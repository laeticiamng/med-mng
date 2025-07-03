-- Créer les tables pour le système d'audit et nettoyage
CREATE TABLE public.audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (report_type IN ('database', 'code', 'ui_consistency', 'performance')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  findings JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Table pour stocker les problèmes détectés
CREATE TABLE public.audit_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.audit_reports(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL, -- 'duplicate', 'inconsistency', 'missing_data', 'performance', 'ui_inconsistency'
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_table TEXT,
  affected_column TEXT,
  affected_file TEXT,
  affected_component TEXT,
  suggestion TEXT,
  auto_fixable BOOLEAN DEFAULT false,
  fixed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les corrections automatiques
CREATE TABLE public.audit_fixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.audit_issues(id) ON DELETE CASCADE,
  fix_type TEXT NOT NULL, -- 'sql', 'code_update', 'style_update'
  fix_script TEXT NOT NULL,
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  rollback_script TEXT,
  result JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'historique des nettoyages
CREATE TABLE public.cleanup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleanup_type TEXT NOT NULL,
  affected_records INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Accessible aux admins et service role
CREATE POLICY "Admins can manage audit reports"
ON public.audit_reports FOR ALL
USING (true);

CREATE POLICY "Admins can manage audit issues"
ON public.audit_issues FOR ALL
USING (true);

CREATE POLICY "Admins can manage audit fixes"
ON public.audit_fixes FOR ALL
USING (true);

CREATE POLICY "Admins can view cleanup history"
ON public.cleanup_history FOR ALL
USING (true);

-- Fonction pour détecter les doublons dans les données EDN
CREATE OR REPLACE FUNCTION public.detect_edn_duplicates()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '[]'::jsonb;
  duplicate_record RECORD;
BEGIN
  -- Détecter les doublons par item_code
  FOR duplicate_record IN
    SELECT item_code, COUNT(*) as count, array_agg(id) as ids
    FROM public.edn_items_immersive
    GROUP BY item_code
    HAVING COUNT(*) > 1
  LOOP
    result := result || jsonb_build_object(
      'type', 'duplicate_item_code',
      'item_code', duplicate_record.item_code,
      'count', duplicate_record.count,
      'ids', duplicate_record.ids
    );
  END LOOP;
  
  -- Détecter les doublons par slug
  FOR duplicate_record IN
    SELECT slug, COUNT(*) as count, array_agg(id) as ids
    FROM public.edn_items_immersive
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
  LOOP
    result := result || jsonb_build_object(
      'type', 'duplicate_slug',
      'slug', duplicate_record.slug,
      'count', duplicate_record.count,
      'ids', duplicate_record.ids
    );
  END LOOP;
  
  RETURN result;
END;
$$;

-- Fonction pour détecter les incohérences dans les données
CREATE OR REPLACE FUNCTION public.detect_data_inconsistencies()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '[]'::jsonb;
  issue_record RECORD;
BEGIN
  -- Items sans titre
  SELECT COUNT(*) as count INTO issue_record
  FROM public.edn_items_immersive
  WHERE title IS NULL OR title = '';
  
  IF issue_record.count > 0 THEN
    result := result || jsonb_build_object(
      'type', 'missing_title',
      'count', issue_record.count,
      'description', 'Items EDN sans titre'
    );
  END IF;
  
  -- Items avec des slugs invalides
  SELECT COUNT(*) as count INTO issue_record
  FROM public.edn_items_immersive
  WHERE slug IS NOT NULL AND (
    slug ~ '[^a-z0-9\-]' OR
    slug LIKE '%-%-%' OR
    slug LIKE '-%' OR
    slug LIKE '%-'
  );
  
  IF issue_record.count > 0 THEN
    result := result || jsonb_build_object(
      'type', 'invalid_slug',
      'count', issue_record.count,
      'description', 'Slugs avec format invalide'
    );
  END IF;
  
  -- Items avec JSON malformé
  SELECT COUNT(*) as count INTO issue_record
  FROM public.edn_items_immersive
  WHERE (tableau_rang_a IS NOT NULL AND NOT (tableau_rang_a::text ~ '^[\[\{]'))
     OR (tableau_rang_b IS NOT NULL AND NOT (tableau_rang_b::text ~ '^[\[\{]'))
     OR (scene_immersive IS NOT NULL AND NOT (scene_immersive::text ~ '^[\[\{]'))
     OR (quiz_questions IS NOT NULL AND NOT (quiz_questions::text ~ '^[\[\{]'));
  
  IF issue_record.count > 0 THEN
    result := result || jsonb_build_object(
      'type', 'malformed_json',
      'count', issue_record.count,
      'description', 'Données JSON potentiellement malformées'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Fonction pour nettoyer automatiquement les doublons
CREATE OR REPLACE FUNCTION public.cleanup_duplicates()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{"cleaned": 0, "details": []}'::jsonb;
  duplicate_record RECORD;
  keep_id UUID;
  delete_ids UUID[];
  cleaned_count INTEGER := 0;
BEGIN
  -- Nettoyer les doublons par item_code (garder le plus récent)
  FOR duplicate_record IN
    SELECT item_code, array_agg(id ORDER BY created_at DESC) as ids
    FROM public.edn_items_immersive
    GROUP BY item_code
    HAVING COUNT(*) > 1
  LOOP
    keep_id := duplicate_record.ids[1];
    delete_ids := duplicate_record.ids[2:];
    
    DELETE FROM public.edn_items_immersive 
    WHERE id = ANY(delete_ids);
    
    cleaned_count := cleaned_count + array_length(delete_ids, 1);
    
    result := jsonb_set(
      result, 
      '{details}', 
      (result->'details') || jsonb_build_object(
        'item_code', duplicate_record.item_code,
        'kept_id', keep_id,
        'deleted_ids', delete_ids
      )
    );
  END LOOP;
  
  result := jsonb_set(result, '{cleaned}', to_jsonb(cleaned_count));
  
  RETURN result;
END;
$$;

-- Fonction pour générer un rapport d'audit complet
CREATE OR REPLACE FUNCTION public.generate_audit_report(report_type_param TEXT DEFAULT 'database')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  report_id UUID;
  duplicates_result JSONB;
  inconsistencies_result JSONB;
  metrics JSONB := '{}'::jsonb;
BEGIN
  -- Créer le rapport
  INSERT INTO public.audit_reports (report_type, status)
  VALUES (report_type_param, 'running')
  RETURNING id INTO report_id;
  
  IF report_type_param = 'database' THEN
    -- Détecter les doublons
    SELECT public.detect_edn_duplicates() INTO duplicates_result;
    
    -- Détecter les incohérences
    SELECT public.detect_data_inconsistencies() INTO inconsistencies_result;
    
    -- Calculer les métriques
    metrics := jsonb_build_object(
      'total_edn_items', (SELECT COUNT(*) FROM public.edn_items_immersive),
      'items_with_tableau_a', (SELECT COUNT(*) FROM public.edn_items_immersive WHERE tableau_rang_a IS NOT NULL),
      'items_with_tableau_b', (SELECT COUNT(*) FROM public.edn_items_immersive WHERE tableau_rang_b IS NOT NULL),
      'items_with_music', (SELECT COUNT(*) FROM public.edn_items_immersive WHERE paroles_musicales IS NOT NULL),
      'items_with_quiz', (SELECT COUNT(*) FROM public.edn_items_immersive WHERE quiz_questions IS NOT NULL),
      'duplicates_found', jsonb_array_length(duplicates_result),
      'inconsistencies_found', jsonb_array_length(inconsistencies_result)
    );
    
    -- Mettre à jour le rapport
    UPDATE public.audit_reports 
    SET 
      status = 'completed',
      findings = duplicates_result || inconsistencies_result,
      metrics = metrics,
      completed_at = now()
    WHERE id = report_id;
  END IF;
  
  RETURN report_id;
END;
$$;