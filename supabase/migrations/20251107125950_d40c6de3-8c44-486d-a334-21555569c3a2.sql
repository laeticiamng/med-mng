-- Table pour stocker les recommandations appliquées
CREATE TABLE IF NOT EXISTS public.applied_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  impact_level TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Métriques AVANT application
  metrics_before JSONB NOT NULL DEFAULT '{}',
  metrics_before_period_start TIMESTAMP WITH TIME ZONE,
  metrics_before_period_end TIMESTAMP WITH TIME ZONE,
  
  -- Métriques APRÈS application
  metrics_after JSONB DEFAULT '{}',
  metrics_after_period_start TIMESTAMP WITH TIME ZONE,
  metrics_after_period_end TIMESTAMP WITH TIME ZONE,
  
  -- Calcul d'impact
  impact_calculated BOOLEAN DEFAULT false,
  impact_score NUMERIC,
  impact_details JSONB DEFAULT '{}',
  
  notes TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'measuring', 'completed', 'reverted')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.applied_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own applied recommendations"
  ON public.applied_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applied recommendations"
  ON public.applied_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applied recommendations"
  ON public.applied_recommendations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applied recommendations"
  ON public.applied_recommendations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_applied_recommendations_user_id ON public.applied_recommendations(user_id);
CREATE INDEX idx_applied_recommendations_applied_at ON public.applied_recommendations(applied_at DESC);
CREATE INDEX idx_applied_recommendations_status ON public.applied_recommendations(status);

-- Trigger pour updated_at
CREATE TRIGGER update_applied_recommendations_updated_at
  BEFORE UPDATE ON public.applied_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour calculer automatiquement l'impact
CREATE OR REPLACE FUNCTION calculate_recommendation_impact(rec_id UUID)
RETURNS JSONB AS $$
DECLARE
  rec RECORD;
  impact JSONB;
  success_rate_before NUMERIC;
  success_rate_after NUMERIC;
  improvement NUMERIC;
BEGIN
  SELECT * INTO rec FROM public.applied_recommendations WHERE id = rec_id;
  
  IF rec.metrics_before IS NULL OR rec.metrics_after IS NULL THEN
    RETURN '{"error": "Missing metrics"}'::JSONB;
  END IF;
  
  -- Calculer les taux de succès
  success_rate_before := COALESCE((rec.metrics_before->>'successRate')::NUMERIC, 0);
  success_rate_after := COALESCE((rec.metrics_after->>'successRate')::NUMERIC, 0);
  improvement := success_rate_after - success_rate_before;
  
  impact := jsonb_build_object(
    'successRateImprovement', improvement,
    'successRateBefore', success_rate_before,
    'successRateAfter', success_rate_after,
    'totalBefore', COALESCE((rec.metrics_before->>'total')::INTEGER, 0),
    'totalAfter', COALESCE((rec.metrics_after->>'total')::INTEGER, 0),
    'volumeChange', COALESCE((rec.metrics_after->>'total')::INTEGER, 0) - COALESCE((rec.metrics_before->>'total')::INTEGER, 0),
    'impactScore', CASE
      WHEN improvement > 10 THEN 100
      WHEN improvement > 5 THEN 75
      WHEN improvement > 2 THEN 50
      WHEN improvement > 0 THEN 25
      ELSE 0
    END,
    'rating', CASE
      WHEN improvement > 10 THEN 'excellent'
      WHEN improvement > 5 THEN 'good'
      WHEN improvement > 2 THEN 'moderate'
      WHEN improvement > 0 THEN 'slight'
      ELSE 'no_improvement'
    END
  );
  
  -- Mettre à jour la recommandation
  UPDATE public.applied_recommendations
  SET 
    impact_details = impact,
    impact_score = (impact->>'impactScore')::NUMERIC,
    impact_calculated = true,
    status = 'completed',
    updated_at = now()
  WHERE id = rec_id;
  
  RETURN impact;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;