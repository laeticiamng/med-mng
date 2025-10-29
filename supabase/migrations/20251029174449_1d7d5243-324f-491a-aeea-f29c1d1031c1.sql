-- Fonction pour synchroniser les quotas avec le plan d'abonnement
CREATE OR REPLACE FUNCTION public.sync_user_quota_with_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  plan_quota INTEGER;
BEGIN
  -- Récupérer le quota du plan
  SELECT monthly_music_quota INTO plan_quota
  FROM subscription_plans
  WHERE LOWER(name) = LOWER(NEW.subscription_type)
  OR id = NEW.subscription_type;
  
  -- Si le plan existe, appliquer son quota
  IF plan_quota IS NOT NULL THEN
    NEW.monthly_music_quota := plan_quota;
  ELSE
    -- Sinon, appliquer les quotas par défaut selon le type
    CASE LOWER(NEW.subscription_type)
      WHEN 'standard' THEN
        NEW.monthly_music_quota := 30;
      WHEN 'pro' THEN
        NEW.monthly_music_quota := 300;
      WHEN 'premium' THEN
        NEW.monthly_music_quota := 3000;
      WHEN 'free', 'gratuit' THEN
        NEW.monthly_music_quota := 3;
      ELSE
        NEW.monthly_music_quota := 10; -- Fallback par défaut
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour appliquer automatiquement lors de l'insertion/mise à jour
DROP TRIGGER IF EXISTS sync_quota_on_insert ON public.user_quotas;
CREATE TRIGGER sync_quota_on_insert
  BEFORE INSERT OR UPDATE OF subscription_type ON public.user_quotas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_quota_with_plan();

-- Corriger tous les quotas existants qui ne correspondent pas à leur plan
UPDATE user_quotas uq
SET monthly_music_quota = sp.monthly_music_quota
FROM subscription_plans sp
WHERE LOWER(uq.subscription_type) = LOWER(sp.name)
  OR uq.subscription_type = sp.id;