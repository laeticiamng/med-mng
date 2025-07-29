-- Point 6: Monitoring & Performance Analytics - Database Schema

-- Table pour stocker les métriques de performance
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  metric_type TEXT NOT NULL, -- 'web_vital', 'api_call', 'database_query', 'custom'
  metric_name TEXT NOT NULL, -- 'LCP', 'FID', 'CLS', 'TTFB', etc.
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL, -- 'ms', 'score', 'bytes', etc.
  url TEXT,
  user_agent TEXT,
  connection_type TEXT,
  device_type TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les budgets de performance
CREATE TABLE IF NOT EXISTS public.performance_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  warning_threshold NUMERIC NOT NULL,
  critical_threshold NUMERIC NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les SLA et leur tracking
CREATE TABLE IF NOT EXISTS public.sla_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  metric_name TEXT NOT NULL, -- 'availability', 'response_time', 'error_rate'
  target_value NUMERIC NOT NULL, -- 99.9 pour availability, 200ms pour response_time
  current_value NUMERIC,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'measuring', -- 'measuring', 'met', 'warning', 'breach'
  breach_count INTEGER NOT NULL DEFAULT 0,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les alertes de performance
CREATE TABLE IF NOT EXISTS public.performance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'budget_exceeded', 'sla_breach', 'performance_degradation'
  severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metric_data JSONB NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes de performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_name ON public.performance_metrics(metric_type, metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session ON public.performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_sla_metrics_service ON public.sla_metrics(service_name, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_created ON public.performance_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON public.performance_alerts(severity, acknowledged, resolved);

-- Activer RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour performance_metrics
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres métriques" 
ON public.performance_metrics FOR INSERT 
WITH CHECK (true); -- Permet l'insertion anonyme pour les métriques de performance

CREATE POLICY "Les admins peuvent voir toutes les métriques" 
ON public.performance_metrics FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Les utilisateurs peuvent voir leurs propres métriques" 
ON public.performance_metrics FOR SELECT 
USING (auth.uid() = user_id);

-- Politiques RLS pour performance_budgets
CREATE POLICY "Les admins peuvent gérer les budgets de performance" 
ON public.performance_budgets FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Lecture publique des budgets actifs" 
ON public.performance_budgets FOR SELECT 
USING (active = true);

-- Politiques RLS pour sla_metrics
CREATE POLICY "Les admins peuvent gérer les SLA" 
ON public.sla_metrics FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Lecture publique des SLA" 
ON public.sla_metrics FOR SELECT 
USING (true);

-- Politiques RLS pour performance_alerts
CREATE POLICY "Les admins peuvent gérer les alertes de performance" 
ON public.performance_alerts FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Lecture publique des alertes non résolues" 
ON public.performance_alerts FOR SELECT 
USING (resolved = false);

-- Fonction pour calculer les métriques SLA
CREATE OR REPLACE FUNCTION public.calculate_sla_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sla_record RECORD;
  calculated_value NUMERIC;
  new_status TEXT;
BEGIN
  -- Parcourir tous les SLA actifs
  FOR sla_record IN 
    SELECT * FROM sla_metrics 
    WHERE period_end > now() 
    AND status = 'measuring'
  LOOP
    -- Calculer la valeur selon le type de métrique
    CASE sla_record.metric_name
      WHEN 'availability' THEN
        -- Calculer le pourcentage de disponibilité
        SELECT COALESCE(
          100.0 * COUNT(*) FILTER (WHERE status_code < 500) / NULLIF(COUNT(*), 0),
          0
        ) INTO calculated_value
        FROM operation_logs 
        WHERE type = 'api_call' 
        AND created_at BETWEEN sla_record.period_start AND now()
        AND meta->>'service' = sla_record.service_name;
        
      WHEN 'response_time' THEN
        -- Calculer le temps de réponse médian
        SELECT COALESCE(
          percentile_cont(0.5) WITHIN GROUP (ORDER BY (meta->>'duration')::numeric),
          0
        ) INTO calculated_value
        FROM operation_logs 
        WHERE type = 'api_call' 
        AND created_at BETWEEN sla_record.period_start AND now()
        AND meta->>'service' = sla_record.service_name;
        
      WHEN 'error_rate' THEN
        -- Calculer le taux d'erreur
        SELECT COALESCE(
          100.0 * COUNT(*) FILTER (WHERE status_code >= 400) / NULLIF(COUNT(*), 0),
          0
        ) INTO calculated_value
        FROM operation_logs 
        WHERE type = 'api_call' 
        AND created_at BETWEEN sla_record.period_start AND now()
        AND meta->>'service' = sla_record.service_name;
        
      ELSE
        calculated_value := 0;
    END CASE;
    
    -- Déterminer le nouveau statut
    IF calculated_value >= sla_record.target_value THEN
      new_status := 'met';
    ELSIF calculated_value >= sla_record.target_value * 0.9 THEN
      new_status := 'warning';
    ELSE
      new_status := 'breach';
    END IF;
    
    -- Mettre à jour la métrique SLA
    UPDATE sla_metrics 
    SET 
      current_value = calculated_value,
      status = new_status,
      breach_count = CASE WHEN new_status = 'breach' THEN breach_count + 1 ELSE breach_count END,
      last_calculated = now(),
      updated_at = now()
    WHERE id = sla_record.id;
    
    -- Créer une alerte si nécessaire
    IF new_status IN ('warning', 'breach') THEN
      INSERT INTO performance_alerts (
        alert_type,
        severity,
        title,
        description,
        metric_data
      ) VALUES (
        'sla_breach',
        CASE WHEN new_status = 'breach' THEN 'critical' ELSE 'warning' END,
        'SLA ' || new_status || ' - ' || sla_record.service_name,
        'SLA ' || sla_record.metric_name || ' pour ' || sla_record.service_name || 
        ' est ' || new_status || ': ' || calculated_value || ' (target: ' || sla_record.target_value || ')',
        jsonb_build_object(
          'service_name', sla_record.service_name,
          'metric_name', sla_record.metric_name,
          'current_value', calculated_value,
          'target_value', sla_record.target_value,
          'status', new_status
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- Fonction pour nettoyer les anciennes métriques de performance
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Supprimer les métriques de plus de 90 jours
  DELETE FROM performance_metrics 
  WHERE created_at < now() - INTERVAL '90 days';
  
  -- Supprimer les alertes résolues de plus de 30 jours
  DELETE FROM performance_alerts 
  WHERE resolved = true 
  AND resolved_at < now() - INTERVAL '30 days';
END;
$$;

-- Triggers pour mettre à jour les timestamps
CREATE TRIGGER update_performance_budgets_updated_at
  BEFORE UPDATE ON public.performance_budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_sla_metrics_updated_at
  BEFORE UPDATE ON public.sla_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insérer des budgets de performance par défaut
INSERT INTO public.performance_budgets (name, metric_type, metric_name, target_value, warning_threshold, critical_threshold) VALUES
('LCP Budget', 'web_vital', 'LCP', 2500, 3000, 4000),
('FID Budget', 'web_vital', 'FID', 100, 200, 300),
('CLS Budget', 'web_vital', 'CLS', 0.1, 0.2, 0.25),
('TTFB Budget', 'web_vital', 'TTFB', 600, 1000, 1500),
('API Response Time', 'api_call', 'response_time', 200, 500, 1000),
('Database Query Time', 'database_query', 'execution_time', 50, 100, 200)
ON CONFLICT DO NOTHING;

-- Insérer des SLA par défaut
INSERT INTO public.sla_metrics (service_name, metric_name, target_value, period_start, period_end) VALUES
('API', 'availability', 99.9, date_trunc('month', now()), date_trunc('month', now() + INTERVAL '1 month')),
('API', 'response_time', 200, date_trunc('month', now()), date_trunc('month', now() + INTERVAL '1 month')),
('API', 'error_rate', 1.0, date_trunc('month', now()), date_trunc('month', now() + INTERVAL '1 month')),
('Database', 'availability', 99.95, date_trunc('month', now()), date_trunc('month', now() + INTERVAL '1 month')),
('Database', 'response_time', 50, date_trunc('month', now()), date_trunc('month', now() + INTERVAL '1 month'))
ON CONFLICT DO NOTHING;