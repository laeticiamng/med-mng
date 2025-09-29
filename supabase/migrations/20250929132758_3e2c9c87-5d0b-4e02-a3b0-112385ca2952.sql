-- Migration simplifiée pour éviter les deadlocks
-- Tables pour enrichir le backend de l'application MED-MNG

-- Table pour les notifications utilisateur
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les préférences utilisateur étendues
CREATE TABLE IF NOT EXISTS public.user_preferences_extended (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  language TEXT NOT NULL DEFAULT 'fr',
  notification_email BOOLEAN NOT NULL DEFAULT true,
  notification_push BOOLEAN NOT NULL DEFAULT true,
  music_volume INTEGER NOT NULL DEFAULT 75,
  auto_play BOOLEAN NOT NULL DEFAULT true,
  binaural_enabled BOOLEAN NOT NULL DEFAULT false,
  study_reminders BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS pour les notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notifications" ON public.user_notifications
  FOR ALL USING (auth.uid() = user_id);

-- RLS pour les préférences
ALTER TABLE public.user_preferences_extended ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences" ON public.user_preferences_extended
  FOR ALL USING (auth.uid() = user_id);