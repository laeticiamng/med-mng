-- Table pour la configuration des emails automatiques
CREATE TABLE IF NOT EXISTS public.accessibility_report_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly')),
  recipients TEXT[] NOT NULL DEFAULT '{}',
  send_day INTEGER CHECK (send_day >= 1 AND send_day <= 31),
  send_hour INTEGER DEFAULT 9 CHECK (send_hour >= 0 AND send_hour <= 23),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  github_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accessibility_report_config ENABLE ROW LEVEL SECURITY;

-- Policies - Accessible par les utilisateurs authentifiés
CREATE POLICY "Users can view report config"
  ON public.accessibility_report_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update report config"
  ON public.accessibility_report_config
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert report config"
  ON public.accessibility_report_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_accessibility_report_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accessibility_report_config_updated_at
  BEFORE UPDATE ON public.accessibility_report_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_accessibility_report_config_updated_at();

-- Insérer une configuration par défaut
INSERT INTO public.accessibility_report_config (
  enabled,
  frequency,
  recipients,
  send_day,
  send_hour
) VALUES (
  false,
  'monthly',
  '{}',
  1,
  9
) ON CONFLICT DO NOTHING;

-- Table pour l'historique des envois
CREATE TABLE IF NOT EXISTS public.accessibility_report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.accessibility_report_config(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipients TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accessibility_report_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view report history"
  ON public.accessibility_report_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_report_history_sent_at 
  ON public.accessibility_report_history(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_report_config_enabled 
  ON public.accessibility_report_config(enabled) WHERE enabled = true;