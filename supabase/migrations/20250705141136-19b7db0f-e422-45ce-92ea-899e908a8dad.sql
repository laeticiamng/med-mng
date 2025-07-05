-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  monthly_music_quota INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{"tableaux": true, "quiz": true, "bande_dessinee": true, "save_music": true}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create music generation usage tracking
CREATE TABLE public.music_generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  month_year TEXT NOT NULL, -- Format: '2024-01'
  UNIQUE(user_id, generated_at)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_generation_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (true);

-- RLS Policies for music_generation_usage
CREATE POLICY "Users can view their own usage" ON public.music_generation_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own usage" ON public.music_generation_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage" ON public.music_generation_usage
  FOR ALL USING (true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, monthly_music_quota, features) VALUES
('Free', 'Plan gratuit avec fonctionnalités limitées', 0.00, 3, '{"tableaux": false, "quiz": false, "bande_dessinee": false, "save_music": false}'::jsonb),
('Basic', 'Plan de base pour étudiants', 9.99, 50, '{"tableaux": true, "quiz": true, "bande_dessinee": false, "save_music": true}'::jsonb),
('Premium', 'Plan complet pour professionnels', 19.99, 200, '{"tableaux": true, "quiz": true, "bande_dessinee": true, "save_music": true}'::jsonb),
('Enterprise', 'Plan entreprise avec accès illimité', 49.99, 1000, '{"tableaux": true, "quiz": true, "bande_dessinee": true, "save_music": true}'::jsonb);

-- Create functions for subscription management
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  plan_id UUID,
  plan_name TEXT,
  monthly_quota INTEGER,
  features JSONB,
  status TEXT,
  current_period_end TIMESTAMPTZ
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
    COALESCE(us.status, 'free') as status,
    us.current_period_end
  FROM public.subscription_plans sp
  LEFT JOIN public.user_subscriptions us ON us.plan_id = sp.id AND us.user_id = user_uuid AND us.status = 'active'
  WHERE sp.name = 'Free' OR us.user_id = user_uuid
  ORDER BY sp.price DESC
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_music_generation_quota(user_uuid UUID)
RETURNS TABLE (
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
  usage_count INTEGER;
BEGIN
  -- Get user's subscription plan
  SELECT * INTO user_plan FROM public.get_user_subscription(user_uuid);
  
  -- If no plan found, use free plan limits
  IF user_plan IS NULL THEN
    SELECT 3 INTO user_plan.monthly_quota;
    SELECT 'Free' INTO user_plan.plan_name;
  END IF;
  
  -- Count current month usage
  SELECT COUNT(*) INTO usage_count
  FROM public.music_generation_usage
  WHERE user_id = user_uuid 
    AND month_year = current_month;
  
  -- Return quota check result
  RETURN QUERY SELECT 
    (usage_count < user_plan.monthly_quota) as can_generate,
    usage_count as current_usage,
    user_plan.monthly_quota as quota_limit,
    user_plan.plan_name as plan_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_music_usage(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT := to_char(now(), 'YYYY-MM');
  can_gen BOOLEAN;
BEGIN
  -- Check if user can generate
  SELECT can_generate INTO can_gen 
  FROM public.check_music_generation_quota(user_uuid);
  
  IF NOT can_gen THEN
    RETURN FALSE;
  END IF;
  
  -- Insert usage record
  INSERT INTO public.music_generation_usage (user_id, month_year)
  VALUES (user_uuid, current_month);
  
  RETURN TRUE;
END;
$$;