-- 1. Harmoniser l'orthographe du statut
UPDATE public.user_subscriptions
   SET status = 'canceled'
 WHERE status = 'cancelled';

INSERT INTO public.subscription_plans (id, name, price, monthly_music_quota, features)
VALUES (
  'premium', 'MED MNG Premium', 69.00, 30,
  '{"tableaux": true, "quiz": true, "bande_dessinee": true, "save_music": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      price = EXCLUDED.price,
      monthly_music_quota = EXCLUDED.monthly_music_quota,
      features = EXCLUDED.features,
      updated_at = now();

UPDATE public.subscription_plans
   SET name = 'Gratuit',
       monthly_music_quota = 0,
       features = '{"tableaux": true, "quiz": false, "bande_dessinee": false, "save_music": false}'::jsonb,
       updated_at = now()
 WHERE id = 'free';

CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  plan_id TEXT,
  plan_name TEXT,
  monthly_quota INTEGER,
  features JSONB,
  status TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> user_uuid
     AND COALESCE(auth.role(), '') <> 'service_role' THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH abonnement AS (
    SELECT us.plan_id, us.status
      FROM public.user_subscriptions us
     WHERE us.user_id = user_uuid
       AND us.status IN ('active', 'trialing')
       AND (us.current_period_end IS NULL OR us.current_period_end > now())
     ORDER BY us.current_period_end DESC NULLS FIRST, us.updated_at DESC
     LIMIT 1
  )
  SELECT
    COALESCE(a.plan_id, 'free')::TEXT,
    COALESCE(sp.name, CASE WHEN a.plan_id IS NULL THEN 'Gratuit' ELSE 'MED MNG Premium' END)::TEXT,
    COALESCE(sp.monthly_music_quota, 0)::INTEGER,
    COALESCE(sp.features, '{"quiz": false, "tableaux": true, "save_music": false, "bande_dessinee": false}'::jsonb),
    COALESCE(a.status, 'free')::TEXT
  FROM (SELECT 1) AS une_ligne
  LEFT JOIN abonnement a ON TRUE
  LEFT JOIN public.subscription_plans sp ON sp.id = COALESCE(a.plan_id, 'free');
END;
$$;

COMMENT ON FUNCTION public.get_user_subscription(UUID) IS
'MED MNG : abonnement actif (status active/trialing, période non échue) de l''utilisateur, sinon ligne « free » (status = ''free''). Un utilisateur ne peut lire que le sien.';

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status
  ON public.user_subscriptions (user_id, status, current_period_end DESC);