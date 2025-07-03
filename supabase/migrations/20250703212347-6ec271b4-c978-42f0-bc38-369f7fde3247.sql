-- Créer les tables pour le système d'import des fiches EDN
CREATE TABLE public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  success_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  mapping_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  file_url TEXT
);

-- Table pour stocker les données brutes avant traitement
CREATE TABLE public.import_raw_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.import_batches(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  raw_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les webhooks Google Sheets
CREATE TABLE public.google_sheets_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sheet_id TEXT NOT NULL,
  sheet_name TEXT NOT NULL,
  webhook_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  mapping_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sync TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_sheets_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour import_batches
CREATE POLICY "Users can view their own import batches"
ON public.import_batches FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own import batches"
ON public.import_batches FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own import batches"
ON public.import_batches FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies pour import_raw_data
CREATE POLICY "Users can view their own import raw data"
ON public.import_raw_data FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.import_batches 
  WHERE import_batches.id = import_raw_data.batch_id 
  AND import_batches.user_id = auth.uid()
));

CREATE POLICY "System can manage import raw data"
ON public.import_raw_data FOR ALL
USING (true);

-- RLS Policies pour google_sheets_integrations
CREATE POLICY "Users can manage their own Google Sheets integrations"
ON public.google_sheets_integrations FOR ALL
USING (user_id = auth.uid());

-- Fonction pour nettoyer les anciens imports
CREATE OR REPLACE FUNCTION public.cleanup_old_imports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer les imports terminés depuis plus de 30 jours
  DELETE FROM public.import_batches
  WHERE status IN ('completed', 'failed')
  AND completed_at < now() - INTERVAL '30 days';
END;
$$;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_google_sheets_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_google_sheets_integrations_updated_at
BEFORE UPDATE ON public.google_sheets_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_google_sheets_updated_at();