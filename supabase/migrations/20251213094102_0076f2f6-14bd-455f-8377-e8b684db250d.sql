-- Gamification stats table for longest streak
CREATE TABLE IF NOT EXISTS public.user_gamification_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feature usage tracking for adaptive tooltips
CREATE TABLE IF NOT EXISTS public.user_feature_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  first_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_name)
);

-- Help dismissals for contextual help
CREATE TABLE IF NOT EXISTS public.user_help_dismissals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  help_key TEXT NOT NULL,
  dismissed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, help_key)
);

-- Enable RLS
ALTER TABLE public.user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_help_dismissals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their gamification stats" ON public.user_gamification_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their feature usage" ON public.user_feature_usage FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their help dismissals" ON public.user_help_dismissals FOR ALL USING (auth.uid() = user_id);