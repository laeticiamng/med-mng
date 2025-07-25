-- Création table security_incidents pour traçabilité sécurité
CREATE TABLE public.security_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('secret_detected', 'suspicious_pattern', 'build_scan')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  file_path TEXT NOT NULL,
  line_number INTEGER,
  pattern_matched TEXT NOT NULL,
  content_preview TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'resolved', 'false_positive')),
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

-- Policies pour admin seulement
CREATE POLICY "Admins can manage security incidents" 
ON public.security_incidents 
FOR ALL 
USING (true);

-- Index pour performances
CREATE INDEX idx_security_incidents_severity ON public.security_incidents(severity);
CREATE INDEX idx_security_incidents_type ON public.security_incidents(type);
CREATE INDEX idx_security_incidents_created_at ON public.security_incidents(created_at);
CREATE INDEX idx_security_incidents_status ON public.security_incidents(status);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_security_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_incidents_updated_at
BEFORE UPDATE ON public.security_incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_security_incidents_updated_at();

-- Fonction pour alertes critiques automatiques
CREATE OR REPLACE FUNCTION public.notify_critical_security_incident()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'critical' THEN
    -- Log urgent pour monitoring
    RAISE WARNING 'CRITICAL SECURITY INCIDENT: % in file %', NEW.pattern_matched, NEW.file_path;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_critical_security_incident
AFTER INSERT ON public.security_incidents
FOR EACH ROW
EXECUTE FUNCTION public.notify_critical_security_incident();