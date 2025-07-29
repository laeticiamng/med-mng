-- Table pour stocker les abonnements des utilisateurs
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- RLS (Row Level Security)
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres abonnements
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Politique pour que les services puissent gérer tous les abonnements
CREATE POLICY "Service role can manage all subscriptions" ON public.user_subscriptions
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_user_subscriptions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_subscriptions_updated_at();

-- Fonction pour récupérer l'abonnement d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  plan_id TEXT,
  plan_name TEXT,
  monthly_quota INTEGER,
  features JSONB,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(us.plan_id, 'free') as plan_id,
    COALESCE(sp.name, 'Gratuit') as plan_name,
    COALESCE(sp.monthly_music_quota, 3) as monthly_quota,
    COALESCE(sp.features, '{"quiz": false, "tableaux": false, "save_music": false, "bande_dessinee": false}'::jsonb) as features,
    COALESCE(us.status, 'free') as status
  FROM subscription_plans sp
  FULL OUTER JOIN user_subscriptions us ON sp.id = us.plan_id AND us.user_id = user_uuid
  WHERE sp.id = COALESCE(us.plan_id, 'free')
  OR (us.plan_id IS NULL AND sp.id = 'free')
  LIMIT 1;
END;
$$;