-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  monthly_music_quota INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert the subscription plans
INSERT INTO public.subscription_plans (id, name, price, monthly_music_quota, features) VALUES
('free', 'Gratuit', 0.00, 0, '{"tableaux": false, "quiz": false, "bande_dessinee": false, "save_music": false}'),
('standard', 'Standard', 19.00, 30, '{"tableaux": true, "quiz": false, "bande_dessinee": false, "save_music": true}'),
('pro', 'Pro', 29.00, 300, '{"tableaux": true, "quiz": true, "bande_dessinee": false, "save_music": true}'),
('premium', 'Premium', 39.00, 3000, '{"tableaux": true, "quiz": true, "bande_dessinee": true, "save_music": true}');

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.subscription_plans(id) NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create music generation usage tracking
CREATE TABLE public.music_generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: "2024-12"
  generated_count INTEGER NOT NULL DEFAULT 0,
  quota_limit INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_generation_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Everyone can view subscription plans" 
ON public.subscription_plans FOR SELECT USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage user subscriptions" 
ON public.user_subscriptions FOR ALL 
USING (true);

-- RLS Policies for music_generation_usage
CREATE POLICY "Users can view their own usage" 
ON public.music_generation_usage FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage" 
ON public.music_generation_usage FOR ALL 
USING (true);

-- Function to get user's current subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid UUID)
RETURNS TABLE(
  plan_id TEXT,
  plan_name TEXT,
  monthly_quota INTEGER,
  features JSONB,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id as plan_id,
    sp.name as plan_name,
    sp.monthly_music_quota as monthly_quota,
    sp.features,
    COALESCE(us.status, 'free') as status
  FROM public.subscription_plans sp
  LEFT JOIN public.user_subscriptions us ON sp.id = us.plan_id 
    AND us.user_id = user_uuid 
    AND us.status = 'active'
    AND (us.current_period_end IS NULL OR us.current_period_end > now())
  WHERE sp.id = COALESCE(us.plan_id, 'free')
  LIMIT 1;
END;
$$;

-- Function to check and update music generation quota
CREATE OR REPLACE FUNCTION public.check_music_generation_quota(user_uuid UUID)
RETURNS TABLE(
  can_generate BOOLEAN,
  current_usage INTEGER,
  quota_limit INTEGER,
  plan_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT := to_char(now(), 'YYYY-MM');
  user_plan RECORD;
  usage_record RECORD;
BEGIN
  -- Get user's current subscription
  SELECT * INTO user_plan FROM public.get_user_subscription(user_uuid);
  
  -- Get or create usage record for current month
  SELECT * INTO usage_record 
  FROM public.music_generation_usage 
  WHERE user_id = user_uuid AND month_year = current_month;
  
  -- Create usage record if it doesn't exist
  IF usage_record IS NULL THEN
    INSERT INTO public.music_generation_usage (user_id, month_year, generated_count, quota_limit)
    VALUES (user_uuid, current_month, 0, user_plan.monthly_quota)
    RETURNING * INTO usage_record;
  END IF;
  
  -- Check if user can generate more
  RETURN QUERY SELECT 
    (usage_record.generated_count < usage_record.quota_limit) as can_generate,
    usage_record.generated_count as current_usage,
    usage_record.quota_limit,
    user_plan.plan_name;
END;
$$;

-- Function to increment music generation usage
CREATE OR REPLACE FUNCTION public.increment_music_usage(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT := to_char(now(), 'YYYY-MM');
  quota_check RECORD;
BEGIN
  -- Check current quota
  SELECT * INTO quota_check FROM public.check_music_generation_quota(user_uuid);
  
  -- If can't generate, return false
  IF NOT quota_check.can_generate THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage
  UPDATE public.music_generation_usage 
  SET generated_count = generated_count + 1, updated_at = now()
  WHERE user_id = user_uuid AND month_year = current_month;
  
  RETURN TRUE;
END;
$$;