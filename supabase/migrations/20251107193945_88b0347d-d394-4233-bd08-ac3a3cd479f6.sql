-- ============================================
-- MIGRATION: Système d'Alertes Unifiées
-- Description: Tables de persistance pour alertes PagerDuty + NVD
-- ============================================

-- Table des alertes unifiées
CREATE TABLE IF NOT EXISTS public.unified_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('pagerduty', 'nvd')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT,
  cvss_score DECIMAL(3,1),
  unified_score DECIMAL(5,2), -- Score calculé (0-100)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  occurrence_count INTEGER DEFAULT 1
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.unified_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_score ON public.unified_alerts(unified_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_alerts_source ON public.unified_alerts(source);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.unified_alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON public.unified_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_external_id ON public.unified_alerts(external_id);

-- Table d'historique des scores
CREATE TABLE IF NOT EXISTS public.alert_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES public.unified_alerts(id) ON DELETE CASCADE,
  unified_score DECIMAL(5,2) NOT NULL,
  pagerduty_score DECIMAL(5,2),
  cvss_normalized_score DECIMAL(5,2),
  age_score DECIMAL(5,2),
  frequency_score DECIMAL(5,2),
  factors JSONB DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score_history_alert ON public.alert_score_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_score_history_date ON public.alert_score_history(calculated_at DESC);

-- Table de configuration du cache
CREATE TABLE IF NOT EXISTS public.cache_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  ttl_seconds INTEGER NOT NULL,
  description TEXT,
  last_invalidated_at TIMESTAMPTZ,
  hit_count INTEGER DEFAULT 0,
  miss_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_config_key ON public.cache_config(cache_key);

-- Table des métriques de cache
CREATE TABLE IF NOT EXISTS public.cache_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('hit', 'miss', 'set', 'invalidate')),
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_metrics_key ON public.cache_metrics(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_metrics_date ON public.cache_metrics(created_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers pour updated_at
CREATE TRIGGER update_unified_alerts_updated_at
  BEFORE UPDATE ON public.unified_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cache_config_updated_at
  BEFORE UPDATE ON public.cache_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer la configuration de cache par défaut
INSERT INTO public.cache_config (cache_key, ttl_seconds, description)
VALUES 
  ('alerts:pagerduty', 120, 'Cache PagerDuty incidents (2 minutes)'),
  ('alerts:nvd', 3600, 'Cache NVD CVEs (1 heure)'),
  ('alerts:combined', 120, 'Cache alertes combinées (2 minutes)')
ON CONFLICT (cache_key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.unified_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_metrics ENABLE ROW LEVEL SECURITY;

-- Policies: Lecture publique, écriture service role uniquement
CREATE POLICY "Allow public read access to unified_alerts"
  ON public.unified_alerts FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access to unified_alerts"
  ON public.unified_alerts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow public read access to alert_score_history"
  ON public.alert_score_history FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access to alert_score_history"
  ON public.alert_score_history FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow public read access to cache_config"
  ON public.cache_config FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access to cache_config"
  ON public.cache_config FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow public read access to cache_metrics"
  ON public.cache_metrics FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access to cache_metrics"
  ON public.cache_metrics FOR ALL
  USING (auth.role() = 'service_role');