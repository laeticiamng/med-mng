-- Création table monitoring_incidents pour suivi des incidents temps réel
CREATE TABLE public.monitoring_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('error', 'warning', 'critical')),
  service_name TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'investigating')),
  details JSONB DEFAULT '{}',
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.monitoring_incidents ENABLE ROW LEVEL SECURITY;

-- Policies pour admin seulement
CREATE POLICY "Admins can manage monitoring incidents" 
ON public.monitoring_incidents 
FOR ALL 
USING (true);

-- Index pour performances
CREATE INDEX idx_monitoring_incidents_severity ON public.monitoring_incidents(severity);
CREATE INDEX idx_monitoring_incidents_service ON public.monitoring_incidents(service_name);
CREATE INDEX idx_monitoring_incidents_status ON public.monitoring_incidents(status);
CREATE INDEX idx_monitoring_incidents_created_at ON public.monitoring_incidents(created_at);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_monitoring_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_monitoring_incidents_updated_at
BEFORE UPDATE ON public.monitoring_incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_monitoring_incidents_updated_at();

-- Fonction pour alertes critiques automatiques
CREATE OR REPLACE FUNCTION public.notify_critical_incident()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'critical' THEN
    -- Log urgent pour monitoring
    RAISE WARNING 'CRITICAL INCIDENT: % - %', NEW.service_name, NEW.message;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_critical_incident
AFTER INSERT ON public.monitoring_incidents
FOR EACH ROW
EXECUTE FUNCTION public.notify_critical_incident();