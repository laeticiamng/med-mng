-- =============================================
-- MIGRATION: Fix critical database issues
-- =============================================

-- 1. Create missing tables

-- listening_sessions table for music listening tracking
CREATE TABLE IF NOT EXISTS public.listening_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_code VARCHAR(20),
  track_id UUID,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 1,
  skip_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- emotion_scan_results table for AI emotion analysis
CREATE TABLE IF NOT EXISTS public.emotion_scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scan_type VARCHAR(50) NOT NULL,
  emotion_data JSONB DEFAULT '{}',
  confidence_score NUMERIC(5,4),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- user_onboarding table for tracking onboarding completion
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  onboarding_completed BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  skipped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Add missing column to user_stats if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_stats' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'total_sessions' AND table_schema = 'public') THEN
      ALTER TABLE public.user_stats ADD COLUMN total_sessions INTEGER DEFAULT 0;
    END IF;
  END IF;
END $$;

-- 3. Enable RLS on new tables
ALTER TABLE public.listening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for listening_sessions
DROP POLICY IF EXISTS "Users can view their own listening sessions" ON public.listening_sessions;
CREATE POLICY "Users can view their own listening sessions"
  ON public.listening_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own listening sessions" ON public.listening_sessions;
CREATE POLICY "Users can insert their own listening sessions"
  ON public.listening_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own listening sessions" ON public.listening_sessions;
CREATE POLICY "Users can update their own listening sessions"
  ON public.listening_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to listening_sessions" ON public.listening_sessions;
CREATE POLICY "Service role full access to listening_sessions"
  ON public.listening_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Create RLS policies for emotion_scan_results
DROP POLICY IF EXISTS "Users can view their own emotion scans" ON public.emotion_scan_results;
CREATE POLICY "Users can view their own emotion scans"
  ON public.emotion_scan_results FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own emotion scans" ON public.emotion_scan_results;
CREATE POLICY "Users can insert their own emotion scans"
  ON public.emotion_scan_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to emotion_scan_results" ON public.emotion_scan_results;
CREATE POLICY "Service role full access to emotion_scan_results"
  ON public.emotion_scan_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Create RLS policies for user_onboarding
DROP POLICY IF EXISTS "Users can view their own onboarding" ON public.user_onboarding;
CREATE POLICY "Users can view their own onboarding"
  ON public.user_onboarding FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own onboarding" ON public.user_onboarding;
CREATE POLICY "Users can insert their own onboarding"
  ON public.user_onboarding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own onboarding" ON public.user_onboarding;
CREATE POLICY "Users can update their own onboarding"
  ON public.user_onboarding FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to user_onboarding" ON public.user_onboarding;
CREATE POLICY "Service role full access to user_onboarding"
  ON public.user_onboarding FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listening_sessions_user_id ON public.listening_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_item_code ON public.listening_sessions(item_code);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_started_at ON public.listening_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_emotion_scan_results_user_id ON public.emotion_scan_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON public.user_onboarding(user_id);

-- 8. Add unique constraint on user_gamification_stats if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_gamification_stats_user_id_key'
  ) THEN
    ALTER TABLE public.user_gamification_stats 
    ADD CONSTRAINT user_gamification_stats_user_id_key UNIQUE (user_id);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;