-- Fonction pour calculer les scores d'efficacité historique par catégorie
CREATE OR REPLACE FUNCTION get_category_effectiveness_scores(p_user_id UUID)
RETURNS TABLE (
  category TEXT,
  avg_impact_score NUMERIC,
  total_applied INTEGER,
  total_measured INTEGER,
  avg_success_improvement NUMERIC,
  effectiveness_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ar.category,
    ROUND(AVG(ar.impact_score), 2) as avg_impact_score,
    COUNT(*) as total_applied,
    COUNT(*) FILTER (WHERE ar.status = 'completed') as total_measured,
    ROUND(AVG(
      CASE 
        WHEN ar.metrics_after IS NOT NULL AND ar.metrics_before IS NOT NULL
        THEN (ar.metrics_after->>'successRate')::numeric - (ar.metrics_before->>'successRate')::numeric
        ELSE 0
      END
    ), 2) as avg_success_improvement,
    -- Score d'efficacité composite (0-100)
    ROUND(
      COALESCE(AVG(ar.impact_score), 0) * 0.6 +  -- 60% basé sur impact_score
      COALESCE(AVG(
        CASE 
          WHEN ar.metrics_after IS NOT NULL AND ar.metrics_before IS NOT NULL
          THEN GREATEST(0, LEAST(100, (ar.metrics_after->>'successRate')::numeric - (ar.metrics_before->>'successRate')::numeric + 50))
          ELSE 50
        END
      ), 50) * 0.4,  -- 40% basé sur amélioration des métriques
      2
    ) as effectiveness_score
  FROM applied_recommendations ar
  WHERE ar.user_id = p_user_id
    AND ar.impact_score IS NOT NULL
  GROUP BY ar.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_applied_recommendations_user_category 
ON applied_recommendations(user_id, category) 
WHERE impact_score IS NOT NULL;