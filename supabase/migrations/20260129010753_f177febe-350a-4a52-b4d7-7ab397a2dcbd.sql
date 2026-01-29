-- =============================================
-- CORRECTIONS CRITIQUES - AUDIT COMPLET
-- =============================================

-- 1. Ajouter contrainte unique sur user_onboarding pour éviter les erreurs d'upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_onboarding_user_id_key'
  ) THEN
    ALTER TABLE public.user_onboarding ADD CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 2. Créer la table pwa_metrics si elle n'existe pas avec RLS pour anonymous
CREATE TABLE IF NOT EXISTS public.pwa_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metric_type TEXT NOT NULL,
  metric_value JSONB NOT NULL DEFAULT '{}',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pwa_metrics ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre les insertions anonymes (métriques PWA)
DROP POLICY IF EXISTS "Anyone can insert PWA metrics" ON public.pwa_metrics;
CREATE POLICY "Anyone can insert PWA metrics" 
ON public.pwa_metrics 
FOR INSERT 
WITH CHECK (true);

-- Users can view their own metrics
DROP POLICY IF EXISTS "Users can view their own PWA metrics" ON public.pwa_metrics;
CREATE POLICY "Users can view their own PWA metrics" 
ON public.pwa_metrics 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

-- 3. Ajouter contrainte unique sur user_gamification_stats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_gamification_stats_user_id_key'
  ) THEN
    ALTER TABLE public.user_gamification_stats ADD CONSTRAINT user_gamification_stats_user_id_key UNIQUE (user_id);
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- Table doesn't exist, create it
  CREATE TABLE public.user_gamification_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    longest_streak INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE public.user_gamification_stats ENABLE ROW LEVEL SECURITY;
END $$;

-- RLS for user_gamification_stats
DROP POLICY IF EXISTS "Users can manage their own gamification stats" ON public.user_gamification_stats;
CREATE POLICY "Users can manage their own gamification stats" 
ON public.user_gamification_stats 
FOR ALL 
USING (auth.uid() = user_id);

-- 4. Ajouter contrainte unique sur user_item_progress pour upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_item_progress_user_item_key'
  ) THEN
    ALTER TABLE public.user_item_progress ADD CONSTRAINT user_item_progress_user_item_key UNIQUE (user_id, item_code);
  END IF;
END $$;

-- 5. Créer table error_patterns pour le monitoring
CREATE TABLE IF NOT EXISTS public.error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name TEXT NOT NULL,
  error_type TEXT NOT NULL,
  message_pattern TEXT,
  occurrence_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  is_resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.error_patterns ENABLE ROW LEVEL SECURITY;

-- Admins only for error patterns
DROP POLICY IF EXISTS "Only admins can manage error patterns" ON public.error_patterns;
CREATE POLICY "Only admins can manage error patterns" 
ON public.error_patterns 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Améliorer la table review_sessions pour persistence
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'review_sessions' AND column_name = 'session_state'
  ) THEN
    ALTER TABLE public.review_sessions ADD COLUMN session_state JSONB DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'review_sessions' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE public.review_sessions ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- 7. Index pour améliorer les performances des queries fréquentes
CREATE INDEX IF NOT EXISTS idx_user_item_progress_next_review 
ON public.user_item_progress (user_id, next_review_date);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_date 
ON public.user_activity_log (user_id, activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_gamification_activities_user 
ON public.gamification_activities (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_date 
ON public.flashcard_reviews (reviewed_at DESC);

-- 8. Ajouter timezone_offset aux user preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'timezone_offset'
  ) THEN
    ALTER TABLE public.user_preferences ADD COLUMN timezone_offset INTEGER DEFAULT 0;
  END IF;
END $$;