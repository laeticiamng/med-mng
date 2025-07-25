-- Création table data_integrity_reports pour stocker les rapports d'intégrité
CREATE TABLE public.data_integrity_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('passed', 'warnings', 'critical')),
  summary JSONB NOT NULL DEFAULT '{}',
  tables_scanned TEXT[] NOT NULL DEFAULT '{}',
  total_records INTEGER NOT NULL DEFAULT 0,
  issues_count INTEGER NOT NULL DEFAULT 0,
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  full_report JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.data_integrity_reports ENABLE ROW LEVEL SECURITY;

-- Policies pour admin seulement
CREATE POLICY "Admins can manage data integrity reports" 
ON public.data_integrity_reports 
FOR ALL 
USING (true);

-- Index pour performances
CREATE INDEX idx_data_integrity_reports_status ON public.data_integrity_reports(status);
CREATE INDEX idx_data_integrity_reports_scan_id ON public.data_integrity_reports(scan_id);
CREATE INDEX idx_data_integrity_reports_created_at ON public.data_integrity_reports(created_at);
CREATE INDEX idx_data_integrity_reports_issues_count ON public.data_integrity_reports(issues_count);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_data_integrity_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_data_integrity_reports_updated_at
BEFORE UPDATE ON public.data_integrity_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_data_integrity_reports_updated_at();

-- Fonction pour nettoyage automatique des anciens rapports (garder 30 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_integrity_reports()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.data_integrity_reports
  WHERE created_at < (now() - INTERVAL '30 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Cleaned up % old integrity reports', deleted_count;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;