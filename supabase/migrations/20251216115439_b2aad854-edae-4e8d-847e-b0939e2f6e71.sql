-- Create missing tables FIRST (without constraints on existing tables)

-- 1. Create pwa_metrics table
CREATE TABLE IF NOT EXISTS public.pwa_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fcp NUMERIC,
  lcp NUMERIC,
  cls NUMERIC,
  ttfb NUMERIC,
  inp NUMERIC,
  device_type TEXT,
  connection_type TEXT,
  is_pwa BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create error_patterns table
CREATE TABLE IF NOT EXISTS public.error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_key TEXT NOT NULL UNIQUE,
  error_category TEXT,
  error_message TEXT,
  severity TEXT,
  occurrence_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  unique_urls INTEGER DEFAULT 0,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create csrf_tokens table
CREATE TABLE IF NOT EXISTS public.csrf_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create med_mng_listening_modes table
CREATE TABLE IF NOT EXISTS public.med_mng_listening_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode_id TEXT NOT NULL,
  mode_config JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mode_id)
);

-- 5. Create med_mng_recommendations table
CREATE TABLE IF NOT EXISTS public.med_mng_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT,
  content_id TEXT,
  priority INTEGER DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- 6. Create med_mng_user_preferences table
CREATE TABLE IF NOT EXISTS public.med_mng_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_genres TEXT[],
  preferred_moods TEXT[],
  medical_specialties TEXT[],
  study_schedule JSONB,
  learning_style TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pwa_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csrf_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_listening_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_user_preferences ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "pwa_metrics_insert" ON public.pwa_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "pwa_metrics_select" ON public.pwa_metrics FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "error_patterns_all" ON public.error_patterns FOR ALL USING (true);
CREATE POLICY "csrf_tokens_all" ON public.csrf_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "listening_modes_all" ON public.med_mng_listening_modes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "recommendations_select" ON public.med_mng_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recommendations_insert" ON public.med_mng_recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "user_preferences_all" ON public.med_mng_user_preferences FOR ALL USING (auth.uid() = user_id);