
-- ===============================================
-- MED-MNG: Schéma complet avec préfixe med_mng_
-- ===============================================

-- Table des chansons générées
CREATE TABLE public.med_mng_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  suno_audio_id TEXT NOT NULL UNIQUE,
  meta JSONB DEFAULT '{}',
  lyrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table liaison utilisateur-chanson (bibliothèque)
CREATE TABLE public.med_mng_user_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES med_mng_songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Table des likes
CREATE TABLE public.med_mng_song_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES med_mng_songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Table des abonnements
CREATE TABLE public.med_mng_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('standard', 'pro', 'premium')),
  credits_left INTEGER NOT NULL DEFAULT 0,
  renews_at TIMESTAMPTZ NOT NULL,
  gateway TEXT NOT NULL CHECK (gateway IN ('stripe', 'paypal')),
  stripe_subscription_id TEXT,
  paypal_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des paramètres utilisateur
CREATE TABLE public.med_mng_user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_json JSONB DEFAULT '{"primary": "#3b82f6", "mode": "light"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===============================================
-- ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.med_mng_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_user_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_song_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_user_settings ENABLE ROW LEVEL SECURITY;

-- Policies pour med_mng_songs (lecture publique, pas d'écriture directe)
CREATE POLICY "Public can view songs" ON public.med_mng_songs
  FOR SELECT USING (true);

-- Policies pour med_mng_user_songs
CREATE POLICY "Users can view own library" ON public.med_mng_user_songs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to library" ON public.med_mng_user_songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from library" ON public.med_mng_user_songs
  FOR DELETE USING (auth.uid() = user_id);

-- Policies pour med_mng_song_likes
CREATE POLICY "Users can view own likes" ON public.med_mng_song_likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own likes" ON public.med_mng_song_likes
  FOR ALL USING (auth.uid() = user_id);

-- Policies pour med_mng_subscriptions
CREATE POLICY "Users can view own subscription" ON public.med_mng_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policies pour med_mng_user_settings
CREATE POLICY "Users can manage own settings" ON public.med_mng_user_settings
  FOR ALL USING (auth.uid() = user_id);

-- ===============================================
-- FONCTIONS RPC
-- ===============================================

-- Fonction: Créer/MAJ abonnement utilisateur
CREATE OR REPLACE FUNCTION public.med_mng_create_user_sub(
  plan_name TEXT,
  gateway_name TEXT,
  subscription_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  credits_amount INTEGER;
  renewal_date TIMESTAMPTZ;
BEGIN
  -- Définir les crédits selon le plan
  CASE plan_name
    WHEN 'standard' THEN credits_amount := 60;
    WHEN 'pro' THEN credits_amount := 2500;
    WHEN 'premium' THEN credits_amount := 5000;
    ELSE RAISE EXCEPTION 'Plan invalide: %', plan_name;
  END CASE;
  
  renewal_date := now() + INTERVAL '1 month';
  
  -- Upsert subscription
  INSERT INTO public.med_mng_subscriptions (
    user_id, plan, credits_left, renews_at, gateway,
    stripe_subscription_id, paypal_subscription_id
  )
  VALUES (
    auth.uid(), plan_name, credits_amount, renewal_date, gateway_name,
    CASE WHEN gateway_name = 'stripe' THEN subscription_id ELSE NULL END,
    CASE WHEN gateway_name = 'paypal' THEN subscription_id ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    credits_left = EXCLUDED.credits_left,
    renews_at = EXCLUDED.renews_at,
    gateway = EXCLUDED.gateway,
    stripe_subscription_id = CASE WHEN gateway_name = 'stripe' THEN subscription_id ELSE med_mng_subscriptions.stripe_subscription_id END,
    paypal_subscription_id = CASE WHEN gateway_name = 'paypal' THEN subscription_id ELSE med_mng_subscriptions.paypal_subscription_id END,
    updated_at = now();
END;
$$;

-- Fonction: Ajouter à la bibliothèque
CREATE OR REPLACE FUNCTION public.med_mng_add_to_library(song_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.med_mng_user_songs (user_id, song_id)
  VALUES (auth.uid(), song_id)
  ON CONFLICT (user_id, song_id) DO NOTHING;
END;
$$;

-- Fonction: Retirer de la bibliothèque
CREATE OR REPLACE FUNCTION public.med_mng_remove_from_library(song_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.med_mng_user_songs 
  WHERE user_id = auth.uid() AND song_id = med_mng_remove_from_library.song_id;
END;
$$;

-- Fonction: Toggle like
CREATE OR REPLACE FUNCTION public.med_mng_toggle_like(song_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.med_mng_song_likes 
    WHERE user_id = auth.uid() AND song_id = med_mng_toggle_like.song_id
  ) INTO like_exists;
  
  IF like_exists THEN
    DELETE FROM public.med_mng_song_likes 
    WHERE user_id = auth.uid() AND song_id = med_mng_toggle_like.song_id;
    RETURN false;
  ELSE
    INSERT INTO public.med_mng_song_likes (user_id, song_id)
    VALUES (auth.uid(), song_id);
    RETURN true;
  END IF;
END;
$$;

-- Fonction: Obtenir quota restant
CREATE OR REPLACE FUNCTION public.med_mng_get_remaining_quota()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  remaining_credits INTEGER := 0;
BEGIN
  SELECT COALESCE(credits_left, 0) INTO remaining_credits
  FROM public.med_mng_subscriptions
  WHERE user_id = auth.uid();
  
  RETURN remaining_credits;
END;
$$;

-- Fonction: Sauvegarder thème
CREATE OR REPLACE FUNCTION public.med_mng_save_theme(theme_json JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.med_mng_user_settings (user_id, theme_json)
  VALUES (auth.uid(), theme_json)
  ON CONFLICT (user_id) DO UPDATE SET
    theme_json = EXCLUDED.theme_json,
    updated_at = now();
END;
$$;

-- Fonction: Décrémenter quota (trigger)
CREATE OR REPLACE FUNCTION public.med_mng_decrement_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.med_mng_subscriptions
  SET credits_left = GREATEST(0, credits_left - 1),
      updated_at = now()
  WHERE user_id = auth.uid();
  
  RETURN NEW;
END;
$$;

-- Fonction: Reset quota mensuel (cron)
CREATE OR REPLACE FUNCTION public.med_mng_refresh_monthly_quota()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub_record RECORD;
  new_credits INTEGER;
BEGIN
  FOR sub_record IN SELECT * FROM public.med_mng_subscriptions WHERE renews_at <= now() LOOP
    CASE sub_record.plan
      WHEN 'standard' THEN new_credits := 60;
      WHEN 'pro' THEN new_credits := 2500;
      WHEN 'premium' THEN new_credits := 5000;
      ELSE new_credits := 0;
    END CASE;
    
    UPDATE public.med_mng_subscriptions
    SET credits_left = new_credits,
        renews_at = renews_at + INTERVAL '1 month',
        updated_at = now()
    WHERE id = sub_record.id;
  END LOOP;
END;
$$;

-- ===============================================
-- TRIGGERS
-- ===============================================

-- Trigger pour décrémenter le quota à chaque nouvelle chanson
CREATE TRIGGER med_mng_decrement_quota_trigger
  AFTER INSERT ON public.med_mng_songs
  FOR EACH ROW
  EXECUTE FUNCTION public.med_mng_decrement_quota();

-- Trigger pour MAJ updated_at
CREATE OR REPLACE FUNCTION public.med_mng_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER med_mng_songs_updated_at
  BEFORE UPDATE ON public.med_mng_songs
  FOR EACH ROW
  EXECUTE FUNCTION public.med_mng_update_updated_at();

CREATE TRIGGER med_mng_subscriptions_updated_at
  BEFORE UPDATE ON public.med_mng_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.med_mng_update_updated_at();

CREATE TRIGGER med_mng_user_settings_updated_at
  BEFORE UPDATE ON public.med_mng_user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.med_mng_update_updated_at();

-- ===============================================
-- VUES UTILITAIRES
-- ===============================================

-- Vue sécurisée pour la bibliothèque utilisateur
CREATE OR REPLACE VIEW public.med_mng_view_library AS
SELECT 
  s.id,
  s.title,
  s.suno_audio_id,
  s.meta,
  s.created_at,
  us.created_at as added_to_library_at,
  EXISTS(SELECT 1 FROM med_mng_song_likes sl WHERE sl.user_id = auth.uid() AND sl.song_id = s.id) as is_liked
FROM public.med_mng_songs s
INNER JOIN public.med_mng_user_songs us ON s.id = us.song_id
WHERE us.user_id = auth.uid()
ORDER BY us.created_at DESC;

-- ===============================================
-- INDICES POUR PERFORMANCE
-- ===============================================

CREATE INDEX idx_med_mng_user_songs_user_id ON public.med_mng_user_songs(user_id);
CREATE INDEX idx_med_mng_song_likes_user_id ON public.med_mng_song_likes(user_id);
CREATE INDEX idx_med_mng_subscriptions_user_id ON public.med_mng_subscriptions(user_id);
CREATE INDEX idx_med_mng_subscriptions_renews_at ON public.med_mng_subscriptions(renews_at);
CREATE INDEX idx_med_mng_songs_suno_audio_id ON public.med_mng_songs(suno_audio_id);
