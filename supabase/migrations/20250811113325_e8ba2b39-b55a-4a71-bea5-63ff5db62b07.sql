-- Ensure required extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper: create update_updated_at_column only if not present (fallback)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_updated_at_column'
      AND pg_function_is_visible(oid)
  ) THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public;
  END IF;
END $$;

-- med_mng_songs: songs catalog
CREATE TABLE IF NOT EXISTS public.med_mng_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  suno_audio_id text NOT NULL,
  lyrics jsonb DEFAULT '{}'::jsonb,
  meta jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_med_mng_songs_created_by ON public.med_mng_songs(created_by);
CREATE INDEX IF NOT EXISTS idx_med_mng_songs_suno_audio_id ON public.med_mng_songs(suno_audio_id);

-- RLS
ALTER TABLE public.med_mng_songs ENABLE ROW LEVEL SECURITY;
-- Allow public read (catalogue), adjust later if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'med_mng_songs' AND policyname = 'Public can view songs'
  ) THEN
    CREATE POLICY "Public can view songs"
    ON public.med_mng_songs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'med_mng_songs' AND policyname = 'Authenticated can insert songs'
  ) THEN
    CREATE POLICY "Authenticated can insert songs"
    ON public.med_mng_songs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'med_mng_songs' AND policyname = 'Owners can update songs'
  ) THEN
    CREATE POLICY "Owners can update songs"
    ON public.med_mng_songs FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'med_mng_songs' AND policyname = 'Owners can delete songs'
  ) THEN
    CREATE POLICY "Owners can delete songs"
    ON public.med_mng_songs FOR DELETE USING (created_by = auth.uid());
  END IF;
END $$;

-- Trigger to maintain updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_med_mng_songs_updated_at'
  ) THEN
    CREATE TRIGGER trg_med_mng_songs_updated_at
    BEFORE UPDATE ON public.med_mng_songs
    FOR EACH ROW EXECUTE FUNCTION public.med_mng_update_updated_at();
  END IF;
END $$;

-- med_mng_user_songs: user library
CREATE TABLE IF NOT EXISTS public.med_mng_user_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  song_id uuid NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

ALTER TABLE public.med_mng_user_songs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='med_mng_user_songs' AND policyname='Users manage their library'
  ) THEN
    CREATE POLICY "Users manage their library"
    ON public.med_mng_user_songs
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- med_mng_user_favorites: likes
CREATE TABLE IF NOT EXISTS public.med_mng_user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  song_id uuid NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

ALTER TABLE public.med_mng_user_favorites ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='med_mng_user_favorites' AND policyname='Users manage their favorites'
  ) THEN
    CREATE POLICY "Users manage their favorites"
    ON public.med_mng_user_favorites
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- med_mng_subscriptions
CREATE TABLE IF NOT EXISTS public.med_mng_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id text NOT NULL,
  gateway text NOT NULL,
  subscription_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subscription_id)
);

ALTER TABLE public.med_mng_subscriptions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='med_mng_subscriptions' AND policyname='Users manage their subscriptions'
  ) THEN
    CREATE POLICY "Users manage their subscriptions"
    ON public.med_mng_subscriptions
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_med_mng_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER trg_med_mng_subscriptions_updated_at
    BEFORE UPDATE ON public.med_mng_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- med_mng_listening_history (used by med_mng_log_listen)
CREATE TABLE IF NOT EXISTS public.med_mng_listening_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  song_id uuid NOT NULL REFERENCES public.med_mng_songs(id) ON DELETE CASCADE,
  listen_duration_seconds integer DEFAULT 0,
  completion_percentage numeric DEFAULT 0,
  device_type text DEFAULT 'web',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.med_mng_listening_history ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='med_mng_listening_history' AND policyname='Users view own listening history'
  ) THEN
    CREATE POLICY "Users view own listening history"
    ON public.med_mng_listening_history FOR SELECT
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='med_mng_listening_history' AND policyname='Users insert own listening history'
  ) THEN
    CREATE POLICY "Users insert own listening history"
    ON public.med_mng_listening_history FOR INSERT
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- user_quotas (used by med_mng_get_remaining_quota / med_mng_decrement_quota)
CREATE TABLE IF NOT EXISTS public.user_quotas (
  user_id uuid PRIMARY KEY,
  subscription_type text NOT NULL DEFAULT 'standard',
  monthly_music_quota integer NOT NULL DEFAULT 10,
  monthly_qcm_quota integer NOT NULL DEFAULT 50,
  monthly_chat_quota integer NOT NULL DEFAULT 100,
  monthly_music_used integer NOT NULL DEFAULT 0,
  monthly_qcm_used integer NOT NULL DEFAULT 0,
  monthly_chat_used integer NOT NULL DEFAULT 0,
  quota_reset_date timestamptz NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_quotas' AND policyname='Users manage own quotas'
  ) THEN
    CREATE POLICY "Users manage own quotas"
    ON public.user_quotas
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_quotas_updated_at'
  ) THEN
    CREATE TRIGGER trg_user_quotas_updated_at
    BEFORE UPDATE ON public.user_quotas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ia_usage_logs (used by log_ia_usage)
CREATE TABLE IF NOT EXISTS public.ia_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_type text NOT NULL,
  operation_type text NOT NULL,
  credits_used integer NOT NULL DEFAULT 0,
  request_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_status text NOT NULL DEFAULT 'success',
  response_time_ms integer,
  error_details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ia_usage_logs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ia_usage_logs' AND policyname='Users insert own ia usage logs'
  ) THEN
    CREATE POLICY "Users insert own ia usage logs"
    ON public.ia_usage_logs FOR INSERT
    WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ia_usage_logs' AND policyname='Users view own ia usage logs'
  ) THEN
    CREATE POLICY "Users view own ia usage logs"
    ON public.ia_usage_logs FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END $$;