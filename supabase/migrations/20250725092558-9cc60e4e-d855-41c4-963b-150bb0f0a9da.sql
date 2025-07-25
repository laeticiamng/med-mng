-- Table pour les logs d'extraction batch
CREATE TABLE IF NOT EXISTS public.extraction_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id text NOT NULL,
  batch_type text NOT NULL, -- 'OIC', 'EDN', 'ECOS'
  status text NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed', 'paused'
  progress_percentage integer DEFAULT 0,
  total_items integer DEFAULT 0,
  processed_items integer DEFAULT 0,
  failed_items integer DEFAULT 0,
  error_message text,
  error_details jsonb DEFAULT '{}',
  performance_metrics jsonb DEFAULT '{}',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_by uuid,
  session_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_extraction_logs_batch_id ON public.extraction_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_status ON public.extraction_logs(status);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_type ON public.extraction_logs(batch_type);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_started_at ON public.extraction_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_created_by ON public.extraction_logs(created_by);

-- Table pour les événements détaillés d'extraction
CREATE TABLE IF NOT EXISTS public.extraction_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  extraction_log_id uuid NOT NULL REFERENCES public.extraction_logs(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'start', 'progress', 'item_processed', 'item_failed', 'warning', 'error', 'completed'
  event_message text NOT NULL,
  event_data jsonb DEFAULT '{}',
  item_reference text, -- référence item traité (IC-001, etc.)
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index pour les événements
CREATE INDEX IF NOT EXISTS idx_extraction_events_log_id ON public.extraction_events(extraction_log_id);
CREATE INDEX IF NOT EXISTS idx_extraction_events_type ON public.extraction_events(event_type);
CREATE INDEX IF NOT EXISTS idx_extraction_events_created_at ON public.extraction_events(created_at);

-- Enable RLS
ALTER TABLE public.extraction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extraction_events ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour extraction_logs
CREATE POLICY "Admins can view all extraction logs"
ON public.extraction_logs
FOR SELECT
TO authenticated
USING (true); -- À ajuster selon le système d'auth admin

CREATE POLICY "Service role can manage extraction logs"
ON public.extraction_logs
FOR ALL
TO service_role
USING (true);

-- Politiques RLS pour extraction_events
CREATE POLICY "Admins can view all extraction events"
ON public.extraction_events
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can manage extraction events"
ON public.extraction_events
FOR ALL
TO service_role
USING (true);

-- Fonction pour créer un nouveau batch d'extraction
CREATE OR REPLACE FUNCTION public.start_extraction_batch(
  p_batch_type text,
  p_total_items integer DEFAULT 0,
  p_session_data jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  batch_id text;
  log_id uuid;
BEGIN
  -- Générer un ID unique pour le batch
  batch_id := p_batch_type || '_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS') || '_' || 
              substring(gen_random_uuid()::text from 1 for 8);
  
  -- Créer le log d'extraction
  INSERT INTO public.extraction_logs (
    batch_id,
    batch_type,
    status,
    total_items,
    session_data,
    created_by
  )
  VALUES (
    batch_id,
    p_batch_type,
    'running',
    p_total_items,
    p_session_data,
    auth.uid()
  )
  RETURNING id INTO log_id;
  
  -- Créer l'événement de démarrage
  INSERT INTO public.extraction_events (
    extraction_log_id,
    event_type,
    event_message,
    event_data
  )
  VALUES (
    log_id,
    'start',
    'Extraction batch started: ' || batch_id,
    jsonb_build_object('total_items', p_total_items)
  );
  
  RETURN log_id;
END;
$$;

-- Fonction pour mettre à jour le progrès d'extraction
CREATE OR REPLACE FUNCTION public.update_extraction_progress(
  p_log_id uuid,
  p_processed_items integer,
  p_failed_items integer DEFAULT 0,
  p_event_message text DEFAULT NULL,
  p_event_data jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_items integer;
  progress_pct integer;
BEGIN
  -- Récupérer le total d'items
  SELECT extraction_logs.total_items INTO total_items
  FROM public.extraction_logs
  WHERE id = p_log_id;
  
  -- Calculer le pourcentage
  IF total_items > 0 THEN
    progress_pct := LEAST(100, (p_processed_items * 100) / total_items);
  ELSE
    progress_pct := 0;
  END IF;
  
  -- Mettre à jour le log
  UPDATE public.extraction_logs
  SET 
    processed_items = p_processed_items,
    failed_items = p_failed_items,
    progress_percentage = progress_pct,
    updated_at = now()
  WHERE id = p_log_id;
  
  -- Ajouter un événement si message fourni
  IF p_event_message IS NOT NULL THEN
    INSERT INTO public.extraction_events (
      extraction_log_id,
      event_type,
      event_message,
      event_data
    )
    VALUES (
      p_log_id,
      'progress',
      p_event_message,
      jsonb_build_object('processed_items', p_processed_items, 'failed_items', p_failed_items) || p_event_data
    );
  END IF;
END;
$$;

-- Fonction pour terminer une extraction
CREATE OR REPLACE FUNCTION public.complete_extraction_batch(
  p_log_id uuid,
  p_status text DEFAULT 'completed',
  p_error_message text DEFAULT NULL,
  p_error_details jsonb DEFAULT '{}',
  p_performance_metrics jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mettre à jour le statut final
  UPDATE public.extraction_logs
  SET 
    status = p_status,
    error_message = p_error_message,
    error_details = p_error_details,
    performance_metrics = p_performance_metrics,
    completed_at = now(),
    updated_at = now()
  WHERE id = p_log_id;
  
  -- Ajouter l'événement de fin
  INSERT INTO public.extraction_events (
    extraction_log_id,
    event_type,
    event_message,
    event_data
  )
  VALUES (
    p_log_id,
    p_status,
    CASE 
      WHEN p_status = 'completed' THEN 'Extraction completed successfully'
      WHEN p_status = 'failed' THEN 'Extraction failed: ' || COALESCE(p_error_message, 'Unknown error')
      ELSE 'Extraction ended with status: ' || p_status
    END,
    jsonb_build_object('final_status', p_status) || COALESCE(p_error_details, '{}')
  );
END;
$$;

-- Fonction pour obtenir le statut d'extraction
CREATE OR REPLACE FUNCTION public.get_extraction_status(p_batch_id text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  batch_id text,
  batch_type text,
  status text,
  progress_percentage integer,
  total_items integer,
  processed_items integer,
  failed_items integer,
  error_message text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  duration_minutes numeric,
  recent_events jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    el.id,
    el.batch_id,
    el.batch_type,
    el.status,
    el.progress_percentage,
    el.total_items,
    el.processed_items,
    el.failed_items,
    el.error_message,
    el.started_at,
    el.completed_at,
    CASE 
      WHEN el.completed_at IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (el.completed_at - el.started_at)) / 60
      ELSE 
        EXTRACT(EPOCH FROM (now() - el.started_at)) / 60
    END as duration_minutes,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'event_type', ee.event_type,
          'event_message', ee.event_message,
          'created_at', ee.created_at
        ) ORDER BY ee.created_at DESC
      )
      FROM public.extraction_events ee 
      WHERE ee.extraction_log_id = el.id 
      LIMIT 10), 
      '[]'::jsonb
    ) as recent_events
  FROM public.extraction_logs el
  WHERE (p_batch_id IS NULL OR el.batch_id = p_batch_id)
  ORDER BY el.started_at DESC;
END;
$$;

-- Trigger pour auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_extraction_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_extraction_logs_updated_at
  BEFORE UPDATE ON public.extraction_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_extraction_logs_updated_at();