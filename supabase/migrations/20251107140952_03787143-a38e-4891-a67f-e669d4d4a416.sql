-- Table pour les alertes de dégradation de performance
CREATE TABLE IF NOT EXISTS public.performance_degradation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  previous_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  previous_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  previous_score INTEGER NOT NULL,
  current_score INTEGER NOT NULL,
  degradation_percentage DECIMAL NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_perf_alerts_user_id ON public.performance_degradation_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_perf_alerts_category ON public.performance_degradation_alerts(category);
CREATE INDEX IF NOT EXISTS idx_perf_alerts_acknowledged ON public.performance_degradation_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_perf_alerts_dismissed ON public.performance_degradation_alerts(dismissed);
CREATE INDEX IF NOT EXISTS idx_perf_alerts_created_at ON public.performance_degradation_alerts(created_at);

-- Activer RLS
ALTER TABLE public.performance_degradation_alerts ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : les utilisateurs ne peuvent voir que leurs propres alertes
CREATE POLICY "Users can view their own performance alerts"
ON public.performance_degradation_alerts
FOR SELECT
USING (auth.uid() = user_id);

-- Politique d'insertion : les utilisateurs peuvent créer leurs propres alertes
CREATE POLICY "Users can create their own performance alerts"
ON public.performance_degradation_alerts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique de mise à jour : les utilisateurs peuvent mettre à jour leurs propres alertes
CREATE POLICY "Users can update their own performance alerts"
ON public.performance_degradation_alerts
FOR UPDATE
USING (auth.uid() = user_id);

-- Politique de suppression : les utilisateurs peuvent supprimer leurs propres alertes
CREATE POLICY "Users can delete their own performance alerts"
ON public.performance_degradation_alerts
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger pour mettre à jour le updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_performance_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_performance_alerts_updated_at
BEFORE UPDATE ON public.performance_degradation_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_performance_alerts_updated_at();