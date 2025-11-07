-- Fix Function Search Path Mutable: Add SET search_path = public to remaining functions
-- This migration addresses the 2 remaining Function Search Path Mutable warnings

-- 1. Fix calculate_risk_score function
CREATE OR REPLACE FUNCTION public.calculate_risk_score()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_score DECIMAL := 0;
  violation_count INTEGER;
  critical_count INTEGER;
  high_count INTEGER;
BEGIN
  -- Compter les violations actives
  SELECT COUNT(*) INTO violation_count
  FROM public.gdpr_violations
  WHERE status IN ('detected', 'investigating')
  AND detected_at > NOW() - INTERVAL '7 days';

  SELECT COUNT(*) INTO critical_count
  FROM public.gdpr_violations
  WHERE status IN ('detected', 'investigating')
  AND severity = 'critical'
  AND detected_at > NOW() - INTERVAL '7 days';

  SELECT COUNT(*) INTO high_count
  FROM public.gdpr_violations
  WHERE status IN ('detected', 'investigating')
  AND severity = 'high'
  AND detected_at > NOW() - INTERVAL '7 days';

  -- Calculer le score (0-100)
  total_score := LEAST(100, (critical_count * 25) + (high_count * 10) + (violation_count * 5));

  RETURN total_score;
END;
$$;

-- 2. Fix get_violation_stats function
CREATE OR REPLACE FUNCTION public.get_violation_stats(days integer DEFAULT 30)
RETURNS TABLE(
  total_violations bigint,
  critical_violations bigint,
  high_violations bigint,
  resolved_violations bigint,
  avg_resolution_time interval,
  trend_direction text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_violations,
    COUNT(*) FILTER (WHERE severity = 'critical')::BIGINT as critical_violations,
    COUNT(*) FILTER (WHERE severity = 'high')::BIGINT as high_violations,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_violations,
    AVG(resolved_at - detected_at) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_time,
    CASE
      WHEN COUNT(*) FILTER (WHERE detected_at > NOW() - INTERVAL '7 days') >
           COUNT(*) FILTER (WHERE detected_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days')
      THEN 'increasing'
      WHEN COUNT(*) FILTER (WHERE detected_at > NOW() - INTERVAL '14 days') <
           COUNT(*) FILTER (WHERE detected_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days')
      THEN 'decreasing'
      ELSE 'stable'
    END as trend_direction
  FROM public.gdpr_violations
  WHERE detected_at > NOW() - (days || ' days')::INTERVAL;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION public.calculate_risk_score() IS 'Calculate risk score based on GDPR violations with secure search_path';
COMMENT ON FUNCTION public.get_violation_stats(integer) IS 'Get violation statistics with secure search_path';