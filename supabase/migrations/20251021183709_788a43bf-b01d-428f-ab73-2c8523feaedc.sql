-- 🔧 CORRECTION DÉFINITIVE DES FONCTIONS RPC
-- Drop et recréation des fonctions avec les bonnes signatures

-- 1. Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS public.get_user_subscription(UUID);
DROP FUNCTION IF EXISTS public.check_music_generation_quota(UUID);
DROP FUNCTION IF EXISTS public.increment_music_usage(UUID);

-- 2. Recréer get_user_subscription avec signature complète
CREATE FUNCTION public.get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  plan_id TEXT,
  plan_name TEXT,
  monthly_quota INTEGER,
  features JSONB,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(us.plan_id, 'free')::TEXT as plan_id,
    COALESCE(sp.name, 'Gratuit')::TEXT as plan_name,
    COALESCE(sp.monthly_music_quota, 3)::INTEGER as monthly_quota,
    COALESCE(sp.features, '{"quiz": false, "tableaux": false, "save_music": false, "bande_dessinee": false}'::jsonb) as features,
    COALESCE(us.status, 'free')::TEXT as status
  FROM public.subscription_plans sp
  FULL OUTER JOIN public.user_subscriptions us ON sp.id = us.plan_id AND us.user_id = user_uuid
  WHERE sp.id = COALESCE(us.plan_id, 'free')
  OR (us.plan_id IS NULL AND sp.id = 'free')
  LIMIT 1;
END;
$$;

-- 3. Recréer check_music_generation_quota
CREATE FUNCTION public.check_music_generation_quota(user_uuid UUID)
RETURNS TABLE (
  can_generate BOOLEAN,
  current_usage INTEGER,
  quota_limit INTEGER,
  plan_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT := to_char(now(), 'YYYY-MM');
  user_plan RECORD;
  usage_count INTEGER := 0;
BEGIN
  -- Get user's subscription plan
  SELECT * INTO user_plan FROM public.get_user_subscription(user_uuid);
  
  -- Count current month usage from music_tracks table
  SELECT COUNT(*) INTO usage_count
  FROM public.music_tracks
  WHERE user_id = user_uuid
  AND to_char(created_at, 'YYYY-MM') = current_month;
  
  -- Return quota info
  RETURN QUERY
  SELECT 
    (usage_count < COALESCE(user_plan.monthly_quota, 3))::BOOLEAN as can_generate,
    usage_count::INTEGER as current_usage,
    COALESCE(user_plan.monthly_quota, 3)::INTEGER as quota_limit,
    COALESCE(user_plan.plan_name, 'Gratuit')::TEXT as plan_name;
END;
$$;

-- 4. Recréer increment_music_usage
CREATE FUNCTION public.increment_music_usage(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  can_gen BOOLEAN;
BEGIN
  -- Check if user can generate
  SELECT can_generate INTO can_gen 
  FROM public.check_music_generation_quota(user_uuid);
  
  RETURN can_gen;
END;
$$;

-- Commentaires de documentation
COMMENT ON FUNCTION public.get_user_subscription(UUID) IS 
'Retourne plan_id, plan_name, monthly_quota, features, status. Sécurisé avec SET search_path.';

COMMENT ON FUNCTION public.check_music_generation_quota(UUID) IS 
'Retourne can_generate, current_usage, quota_limit, plan_name. Sécurisé avec SET search_path.';

COMMENT ON FUNCTION public.increment_music_usage(UUID) IS 
'Vérifie si l''utilisateur peut générer de la musique. Sécurisé avec SET search_path.';