-- Tables pour l'analyse qualité par IA

-- Table pour les rapports de qualité de code
CREATE TABLE IF NOT EXISTS code_quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  bugs INTEGER DEFAULT 0,
  vulnerabilities INTEGER DEFAULT 0,
  code_smells INTEGER DEFAULT 0,
  coverage NUMERIC DEFAULT 0,
  duplications NUMERIC DEFAULT 0,
  maintainability_rating TEXT,
  security_rating TEXT,
  issues JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les rapports visuels
CREATE TABLE IF NOT EXISTS visual_quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL,
  has_regressions BOOLEAN DEFAULT false,
  changes JSONB,
  accessibility_issues JSONB,
  design_consistency NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  screenshot TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_code_quality_analyzed_at ON code_quality_reports(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_visual_quality_analyzed_at ON visual_quality_reports(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_code_quality_file_path ON code_quality_reports(file_path);
CREATE INDEX IF NOT EXISTS idx_visual_quality_component ON visual_quality_reports(component_name);

-- Fonction pour récupérer les dernières métriques
CREATE OR REPLACE FUNCTION get_latest_quality_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'bugs', COALESCE(SUM(bugs), 0),
    'vulnerabilities', COALESCE(SUM(vulnerabilities), 0),
    'codeSmells', COALESCE(SUM(code_smells), 0),
    'coverage', COALESCE(AVG(coverage), 0),
    'duplications', COALESCE(AVG(duplications), 0),
    'maintainabilityRating', (
      SELECT maintainability_rating 
      FROM code_quality_reports 
      ORDER BY analyzed_at DESC 
      LIMIT 1
    ),
    'securityRating', (
      SELECT security_rating 
      FROM code_quality_reports 
      ORDER BY analyzed_at DESC 
      LIMIT 1
    ),
    'visualRegressions', (
      SELECT COUNT(*) 
      FROM visual_quality_reports 
      WHERE has_regressions = true 
        AND analyzed_at > NOW() - INTERVAL '7 days'
    ),
    'accessibilityScore', COALESCE((
      SELECT AVG(overall_score) 
      FROM visual_quality_reports 
      WHERE analyzed_at > NOW() - INTERVAL '7 days'
    ), 0)
  ) INTO result
  FROM code_quality_reports
  WHERE analyzed_at > NOW() - INTERVAL '7 days';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies pour les tables de qualité (lecture publique pour les badges)
ALTER TABLE code_quality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_quality_reports ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture publique pour les métriques
CREATE POLICY "Public read access for quality metrics" 
ON code_quality_reports FOR SELECT 
USING (true);

CREATE POLICY "Public read access for visual metrics" 
ON visual_quality_reports FOR SELECT 
USING (true);

-- Seul le service role peut insérer/modifier
CREATE POLICY "Service role only for quality inserts" 
ON code_quality_reports FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Service role only for visual inserts" 
ON visual_quality_reports FOR INSERT 
WITH CHECK (false);