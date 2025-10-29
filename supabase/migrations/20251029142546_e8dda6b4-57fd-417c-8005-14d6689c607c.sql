
-- ============================================
-- 🔒 CORRECTION CRITIQUE : Table Monitoring + Fonction Trigger
-- ============================================

-- 1. Créer la fonction de trigger si elle n'existe pas
CREATE OR REPLACE FUNCTION update_music_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Auto-calculer la durée si completed_at ou failed_at est défini
  IF NEW.completed_at IS NOT NULL AND NEW.duration_seconds IS NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.initiated_at))::INTEGER;
  ELSIF NEW.failed_at IS NOT NULL AND NEW.duration_seconds IS NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.failed_at - NEW.initiated_at))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Créer la table si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'music_generation_metrics'
  ) THEN
    
    CREATE TABLE public.music_generation_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      track_id TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('edn', 'ecos', 'oic')),
      item_code TEXT NOT NULL,
      rang TEXT NOT NULL CHECK (rang IN ('A', 'B', 'AB')),
      style TEXT NOT NULL,
      initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      completed_at TIMESTAMPTZ,
      failed_at TIMESTAMPTZ,
      duration_seconds INTEGER,
      status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'generating', 'completed', 'failed', 'timeout')),
      error_message TEXT,
      error_code TEXT,
      api_response_time_ms INTEGER,
      polling_attempts INTEGER DEFAULT 0,
      audio_generated BOOLEAN DEFAULT false,
      audio_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_music_metrics_track_id ON public.music_generation_metrics(track_id);
    CREATE INDEX idx_music_metrics_user_id ON public.music_generation_metrics(user_id);
    CREATE INDEX idx_music_metrics_status ON public.music_generation_metrics(status);
    CREATE INDEX idx_music_metrics_created_at ON public.music_generation_metrics(created_at DESC);
    CREATE INDEX idx_music_metrics_content_type ON public.music_generation_metrics(content_type);

    ALTER TABLE public.music_generation_metrics ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view their own metrics"
      ON public.music_generation_metrics FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own metrics"
      ON public.music_generation_metrics FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

    CREATE POLICY "Users can update their own metrics"
      ON public.music_generation_metrics FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Service role can manage all metrics"
      ON public.music_generation_metrics FOR ALL
      USING (auth.jwt()->>'role' = 'service_role');

    CREATE TRIGGER music_metrics_updated_at
      BEFORE UPDATE ON public.music_generation_metrics
      FOR EACH ROW
      EXECUTE FUNCTION update_music_metrics_updated_at();

    RAISE NOTICE '✅ Table music_generation_metrics créée avec succès';
  END IF;
END $$;

COMMENT ON TABLE public.music_generation_metrics IS 'Métriques détaillées de génération musicale pour monitoring';
COMMENT ON FUNCTION update_music_metrics_updated_at() IS 'Trigger pour auto-update updated_at et calcul duration_seconds';
