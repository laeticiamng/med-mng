-- TOP 15 FIX: Ajouter les contraintes UNIQUE manquantes pour les upserts

-- 1. user_global_state - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_global_state_user_id_key') THEN
    ALTER TABLE public.user_global_state ADD CONSTRAINT user_global_state_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 2. free_trial_usage - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'free_trial_usage_user_id_key') THEN
    ALTER TABLE public.free_trial_usage ADD CONSTRAINT free_trial_usage_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 3. user_onboarding - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_onboarding_user_id_key') THEN
    ALTER TABLE public.user_onboarding ADD CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 4. user_personalization_settings - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_personalization_settings_user_id_key') THEN
    ALTER TABLE public.user_personalization_settings ADD CONSTRAINT user_personalization_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 5. user_cart - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_cart_user_id_key') THEN
    ALTER TABLE public.user_cart ADD CONSTRAINT user_cart_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 6. user_feature_tracking - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_feature_tracking_user_id_key') THEN
    ALTER TABLE public.user_feature_tracking ADD CONSTRAINT user_feature_tracking_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 7. exam_paused_sessions - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exam_paused_sessions_user_id_key') THEN
    ALTER TABLE public.exam_paused_sessions ADD CONSTRAINT exam_paused_sessions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 8. user_gamification_stats - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_gamification_stats_user_id_key') THEN
    ALTER TABLE public.user_gamification_stats ADD CONSTRAINT user_gamification_stats_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 9. webhook_settings - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webhook_settings_user_id_key') THEN
    ALTER TABLE public.webhook_settings ADD CONSTRAINT webhook_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 10. user_preferences_extended - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_extended_user_id_key') THEN
    ALTER TABLE public.user_preferences_extended ADD CONSTRAINT user_preferences_extended_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 11. user_consent_preferences - UNIQUE sur user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_consent_preferences_user_id_key') THEN
    ALTER TABLE public.user_consent_preferences ADD CONSTRAINT user_consent_preferences_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 12. pwa_metrics - UNIQUE sur session_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pwa_metrics_session_id_key') THEN
    ALTER TABLE public.pwa_metrics ADD CONSTRAINT pwa_metrics_session_id_key UNIQUE (session_id);
  END IF;
END $$;

-- 13. med_mng_synchronized_lyrics - UNIQUE sur song_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'med_mng_synchronized_lyrics_song_id_key') THEN
    ALTER TABLE public.med_mng_synchronized_lyrics ADD CONSTRAINT med_mng_synchronized_lyrics_song_id_key UNIQUE (song_id);
  END IF;
END $$;

-- 14. learning_analytics - UNIQUE sur (user_id, week_start)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'learning_analytics_user_id_week_start_key') THEN
    ALTER TABLE public.learning_analytics ADD CONSTRAINT learning_analytics_user_id_week_start_key UNIQUE (user_id, week_start);
  END IF;
END $$;

-- 15. med_mng_content_ai - UNIQUE sur item_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'med_mng_content_ai_item_id_key') THEN
    ALTER TABLE public.med_mng_content_ai ADD CONSTRAINT med_mng_content_ai_item_id_key UNIQUE (item_id);
  END IF;
END $$;