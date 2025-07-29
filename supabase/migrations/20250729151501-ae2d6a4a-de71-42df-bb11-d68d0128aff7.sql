-- Point I: Vérification automatisée complétude des items
-- Créer la table pour stocker les rapports de complétude

CREATE TABLE IF NOT EXISTS public.items_completeness_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  audit_type TEXT NOT NULL DEFAULT 'manual',
  total_items INTEGER NOT NULL DEFAULT 0,
  complete_items INTEGER NOT NULL DEFAULT 0,
  incomplete_items INTEGER NOT NULL DEFAULT 0,
  critical_issues INTEGER NOT NULL DEFAULT 0,
  average_completeness NUMERIC(5,2) DEFAULT 0,
  summary JSONB DEFAULT '{}',
  results JSONB DEFAULT '[]',
  alerts JSONB DEFAULT '[]'
);

-- Table pour les alertes de complétude
CREATE TABLE IF NOT EXISTS public.completeness_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  item_code TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'missing_tableau_a', 'missing_tableau_b', 'empty_quiz', etc.
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Table pour l'historique des scores de complétude par item
CREATE TABLE IF NOT EXISTS public.items_completeness_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  item_code TEXT NOT NULL,
  completeness_score INTEGER NOT NULL,
  tableau_a_score INTEGER DEFAULT 0,
  tableau_b_score INTEGER DEFAULT 0,
  quiz_score INTEGER DEFAULT 0,
  content_score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  report_id UUID REFERENCES public.items_completeness_reports(id)
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_completeness_alerts_item_code ON public.completeness_alerts(item_code);
CREATE INDEX IF NOT EXISTS idx_completeness_alerts_resolved ON public.completeness_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_completeness_history_item_code ON public.items_completeness_history(item_code);
CREATE INDEX IF NOT EXISTS idx_completeness_history_created_at ON public.items_completeness_history(created_at);

-- Enable RLS
ALTER TABLE public.items_completeness_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completeness_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_completeness_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour les rapports de complétude
CREATE POLICY "Service role can manage completeness reports" 
ON public.items_completeness_reports 
FOR ALL 
USING (true);

CREATE POLICY "Admins can view completeness reports" 
ON public.items_completeness_reports 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies pour les alertes
CREATE POLICY "Service role can manage completeness alerts" 
ON public.completeness_alerts 
FOR ALL 
USING (true);

CREATE POLICY "Admins can view completeness alerts" 
ON public.completeness_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies pour l'historique
CREATE POLICY "Service role can manage completeness history" 
ON public.items_completeness_history 
FOR ALL 
USING (true);

CREATE POLICY "Admins can view completeness history" 
ON public.items_completeness_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Fonction pour calculer le score de complétude d'un item
CREATE OR REPLACE FUNCTION public.calculate_item_completeness_score(
  p_item_code TEXT,
  p_tableau_a JSONB,
  p_tableau_b JSONB,
  p_quiz_questions JSONB,
  p_paroles_musicales TEXT[],
  p_scene_immersive JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tableau_a_score INTEGER := 0;
  tableau_b_score INTEGER := 0;
  quiz_score INTEGER := 0;
  content_score INTEGER := 0;
  total_score INTEGER := 0;
BEGIN
  -- Score Tableau A (25 points max)
  IF p_tableau_a IS NOT NULL THEN
    IF jsonb_extract_path_text(p_tableau_a, 'title') IS NOT NULL THEN
      tableau_a_score := tableau_a_score + 5;
    END IF;
    
    IF jsonb_extract_path(p_tableau_a, 'sections') IS NOT NULL 
       AND jsonb_array_length(jsonb_extract_path(p_tableau_a, 'sections')) > 0 THEN
      tableau_a_score := tableau_a_score + 20;
    END IF;
  END IF;
  
  -- Score Tableau B (25 points max)
  IF p_tableau_b IS NOT NULL THEN
    IF jsonb_extract_path_text(p_tableau_b, 'title') IS NOT NULL THEN
      tableau_b_score := tableau_b_score + 5;
    END IF;
    
    IF jsonb_extract_path(p_tableau_b, 'sections') IS NOT NULL 
       AND jsonb_array_length(jsonb_extract_path(p_tableau_b, 'sections')) > 0 THEN
      tableau_b_score := tableau_b_score + 20;
    END IF;
  END IF;
  
  -- Score Quiz (25 points max)
  IF p_quiz_questions IS NOT NULL 
     AND jsonb_array_length(p_quiz_questions) >= 2 THEN
    quiz_score := 25;
  ELSIF p_quiz_questions IS NOT NULL 
        AND jsonb_array_length(p_quiz_questions) >= 1 THEN
    quiz_score := 15;
  END IF;
  
  -- Score Contenu (25 points max)
  IF p_paroles_musicales IS NOT NULL AND array_length(p_paroles_musicales, 1) > 0 THEN
    content_score := content_score + 10;
  END IF;
  
  IF p_scene_immersive IS NOT NULL THEN
    content_score := content_score + 15;
  END IF;
  
  total_score := tableau_a_score + tableau_b_score + quiz_score + content_score;
  
  RETURN total_score;
END;
$$;

-- Fonction pour générer les alertes de complétude
CREATE OR REPLACE FUNCTION public.generate_completeness_alerts(
  p_item_code TEXT,
  p_tableau_a JSONB,
  p_tableau_b JSONB,
  p_quiz_questions JSONB,
  p_paroles_musicales TEXT[],
  p_scene_immersive JSONB
) RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alerts TEXT[] := '{}';
BEGIN
  -- Vérifier Tableau A
  IF p_tableau_a IS NULL OR jsonb_extract_path(p_tableau_a, 'sections') IS NULL THEN
    alerts := array_append(alerts, 'Tableau Rang A manquant ou incomplet');
  END IF;
  
  -- Vérifier Tableau B
  IF p_tableau_b IS NULL OR jsonb_extract_path(p_tableau_b, 'sections') IS NULL THEN
    alerts := array_append(alerts, 'Tableau Rang B manquant ou incomplet');
  END IF;
  
  -- Vérifier Quiz
  IF p_quiz_questions IS NULL OR jsonb_array_length(p_quiz_questions) < 2 THEN
    alerts := array_append(alerts, 'Quiz insuffisant (moins de 2 questions)');
  END IF;
  
  -- Vérifier Contenu
  IF p_paroles_musicales IS NULL OR array_length(p_paroles_musicales, 1) = 0 THEN
    alerts := array_append(alerts, 'Paroles musicales manquantes');
  END IF;
  
  IF p_scene_immersive IS NULL THEN
    alerts := array_append(alerts, 'Scène immersive manquante');
  END IF;
  
  RETURN alerts;
END;
$$;

-- Fonction pour audit complet automatisé
CREATE OR REPLACE FUNCTION public.run_automated_completeness_audit()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_record RECORD;
  total_items INTEGER := 0;
  complete_items INTEGER := 0;
  incomplete_items INTEGER := 0;
  critical_issues INTEGER := 0;
  total_score_sum INTEGER := 0;
  item_score INTEGER;
  item_alerts TEXT[];
  report_id UUID;
  results JSONB := '[]';
  summary JSONB;
BEGIN
  -- Compter tous les items
  SELECT COUNT(*) INTO total_items FROM public.edn_items_immersive;
  
  -- Créer un nouveau rapport
  INSERT INTO public.items_completeness_reports (
    audit_type,
    total_items
  ) VALUES (
    'automated',
    total_items
  ) RETURNING id INTO report_id;
  
  -- Analyser chaque item
  FOR item_record IN 
    SELECT * FROM public.edn_items_immersive ORDER BY item_code
  LOOP
    -- Calculer le score
    item_score := public.calculate_item_completeness_score(
      item_record.item_code,
      item_record.tableau_rang_a,
      item_record.tableau_rang_b,
      item_record.quiz_questions,
      item_record.paroles_musicales,
      item_record.scene_immersive
    );
    
    -- Générer les alertes
    item_alerts := public.generate_completeness_alerts(
      item_record.item_code,
      item_record.tableau_rang_a,
      item_record.tableau_rang_b,
      item_record.quiz_questions,
      item_record.paroles_musicales,
      item_record.scene_immersive
    );
    
    -- Catégoriser l'item
    IF item_score >= 80 THEN
      complete_items := complete_items + 1;
    ELSE
      incomplete_items := incomplete_items + 1;
    END IF;
    
    IF item_score < 50 THEN
      critical_issues := critical_issues + 1;
    END IF;
    
    total_score_sum := total_score_sum + item_score;
    
    -- Ajouter aux résultats
    results := results || jsonb_build_object(
      'item_code', item_record.item_code,
      'completeness_score', item_score,
      'tableau_a_present', item_record.tableau_rang_a IS NOT NULL,
      'tableau_b_present', item_record.tableau_rang_b IS NOT NULL,
      'quiz_present', item_record.quiz_questions IS NOT NULL,
      'alerts', item_alerts,
      'status', CASE 
        WHEN item_score >= 80 THEN 'complete'
        WHEN item_score >= 50 THEN 'incomplete'
        ELSE 'critical'
      END
    );
    
    -- Sauvegarder l'historique
    INSERT INTO public.items_completeness_history (
      item_code,
      completeness_score,
      tableau_a_score,
      tableau_b_score,
      quiz_score,
      content_score,
      report_id
    ) VALUES (
      item_record.item_code,
      item_score,
      CASE WHEN item_record.tableau_rang_a IS NOT NULL THEN 25 ELSE 0 END,
      CASE WHEN item_record.tableau_rang_b IS NOT NULL THEN 25 ELSE 0 END,
      CASE WHEN item_record.quiz_questions IS NOT NULL THEN 25 ELSE 0 END,
      CASE WHEN item_record.paroles_musicales IS NOT NULL THEN 25 ELSE 0 END,
      report_id
    );
    
    -- Créer des alertes si nécessaire
    IF array_length(item_alerts, 1) > 0 THEN
      FOR i IN 1..array_length(item_alerts, 1) LOOP
        INSERT INTO public.completeness_alerts (
          item_code,
          alert_type,
          severity,
          message,
          metadata
        ) VALUES (
          item_record.item_code,
          'completeness_issue',
          CASE WHEN item_score < 50 THEN 'critical' ELSE 'medium' END,
          item_alerts[i],
          jsonb_build_object('score', item_score, 'report_id', report_id)
        );
      END LOOP;
    END IF;
  END LOOP;
  
  -- Créer le résumé
  summary := jsonb_build_object(
    'total_items', total_items,
    'complete_items', complete_items,
    'incomplete_items', incomplete_items,
    'critical_issues', critical_issues,
    'average_completeness', CASE WHEN total_items > 0 THEN total_score_sum::NUMERIC / total_items ELSE 0 END,
    'completion_rate', CASE WHEN total_items > 0 THEN (complete_items::NUMERIC / total_items * 100) ELSE 0 END
  );
  
  -- Mettre à jour le rapport
  UPDATE public.items_completeness_reports 
  SET 
    complete_items = summary->>'complete_items',
    incomplete_items = summary->>'incomplete_items', 
    critical_issues = summary->>'critical_issues',
    average_completeness = (summary->>'average_completeness')::NUMERIC,
    summary = summary,
    results = results
  WHERE id = report_id;
  
  RETURN jsonb_build_object(
    'report_id', report_id,
    'summary', summary,
    'total_items', total_items,
    'alerts_generated', array_length(item_alerts, 1)
  );
END;
$$;