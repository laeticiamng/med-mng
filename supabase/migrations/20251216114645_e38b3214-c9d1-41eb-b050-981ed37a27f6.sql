-- Create user_onboarding table for onboarding status
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT false,
  preferred_deadline TEXT,
  last_state TEXT,
  completed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 0,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  is_seen BOOLEAN DEFAULT false,
  seen_tooltips JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id)
);

-- Create music_feedback table for user feedback on generated music
CREATE TABLE IF NOT EXISTS public.music_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  style TEXT,
  rating INTEGER CHECK (rating >= -1 AND rating <= 1),
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT music_feedback_user_item_key UNIQUE (user_id, item_code)
);

-- Create user_notification_settings table
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_notification_settings_user_id_key UNIQUE (user_id)
);

-- Create free_trial_usage table
CREATE TABLE IF NOT EXISTS public.free_trial_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generations_used INTEGER DEFAULT 0,
  last_generation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT free_trial_usage_user_id_key UNIQUE (user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_trial_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_onboarding
CREATE POLICY "Users can view their own onboarding" ON public.user_onboarding
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own onboarding" ON public.user_onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own onboarding" ON public.user_onboarding
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for music_feedback
CREATE POLICY "Users can view their own music feedback" ON public.music_feedback
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own music feedback" ON public.music_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own music feedback" ON public.music_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for user_notification_settings
CREATE POLICY "Users can view their own notification settings" ON public.user_notification_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification settings" ON public.user_notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification settings" ON public.user_notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for free_trial_usage
CREATE POLICY "Users can view their own trial usage" ON public.free_trial_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trial usage" ON public.free_trial_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trial usage" ON public.free_trial_usage
  FOR UPDATE USING (auth.uid() = user_id);