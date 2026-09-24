-- ============================================================================
-- MED MNG — Abonnement : statut réel et offre unique « MED MNG Premium »
-- ============================================================================
-- P0-2 : get_user_subscription renvoyait l'abonnement quel que soit son
-- statut (FULL OUTER JOIN sans filtre, cf. 20251021183709) : un abonnement
-- résilié (« canceled ») ou échu restait actif à vie côté front.
--
-- Désormais : seul un abonnement status IN ('active','trialing') dont la
-- période n'est pas échue est renvoyé ; sinon, la ligne « free ».
--
-- Signature INCHANGÉE (plan_id, plan_name, monthly_quota, features, status) :
-- pas de DROP, check_music_generation_quota / increment_music_usage et
-- src/integrations/supabase/types.ts restent valides.
-- ============================================================================

-- 1. Harmoniser l'orthographe du statut (le webhook écrivait « cancelled »,
--    Stripe écrit « canceled »).
UPDATE public.user_subscriptions
   SET status = 'canceled'
 WHERE status = 'cancelled';

-- 2. Offre unique. user_subscriptions.plan_id référence subscription_plans(id) :
--    le webhook écrit plan_id = 'premium'. Les lignes 'standard' et 'pro' sont
--    conservées pour les abonnés des anciennes formules (clé étrangère).
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

-- Gratuit : fiches officielles pour tous les items + contenu immersif des
-- 10 items d'essai ; la génération audio est réservée à Premium.
UPDATE public.subscription_plans
   SET name = 'Gratuit',
       monthly_music_quota = 0,
       features = '{"tableaux": true, "quiz": false, "bande_dessinee": false, "save_music": false}'::jsonb,
       updated_at = now()
 WHERE id = 'free';

-- 3. get_user_subscription : uniquement un abonnement actif et non échu.
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
  -- Un utilisateur ne lit que son propre abonnement (la clé de service et les
  -- appels internes sans JWT, ex. check_music_generation_quota, passent).
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

-- 4. Index utile au filtre ci-dessus et aux contrôles des Edge Functions.
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status
  ON public.user_subscriptions (user_id, status, current_period_end DESC);
