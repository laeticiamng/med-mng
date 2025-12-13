-- Create user_feature_tracking table for AdaptiveTooltip & ContextualHelp
CREATE TABLE IF NOT EXISTS public.user_feature_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  visit_count INTEGER DEFAULT 0,
  first_visited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_visited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_dismissed BOOLEAN DEFAULT false,
  UNIQUE(user_id, feature_key)
);

-- Create user_personalization_settings table
CREATE TABLE IF NOT EXISTS public.user_personalization_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_search_history table if not exists
CREATE TABLE IF NOT EXISTS public.user_search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, query)
);

-- Create user_saved_searches table if not exists
CREATE TABLE IF NOT EXISTS public.user_saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  name TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, query)
);

-- Enable RLS on all tables
ALTER TABLE public.user_feature_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_personalization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_feature_tracking
CREATE POLICY "Users can view own feature tracking" ON public.user_feature_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feature tracking" ON public.user_feature_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feature tracking" ON public.user_feature_tracking
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own feature tracking" ON public.user_feature_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_personalization_settings
CREATE POLICY "Users can view own personalization" ON public.user_personalization_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own personalization" ON public.user_personalization_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own personalization" ON public.user_personalization_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_search_history
CREATE POLICY "Users can view own search history" ON public.user_search_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own search history" ON public.user_search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own search history" ON public.user_search_history
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_saved_searches
CREATE POLICY "Users can view own saved searches" ON public.user_saved_searches
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved searches" ON public.user_saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved searches" ON public.user_saved_searches
  FOR DELETE USING (auth.uid() = user_id);