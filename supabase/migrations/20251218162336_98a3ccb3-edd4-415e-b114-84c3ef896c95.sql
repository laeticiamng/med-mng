-- Fix 1: pwa_metrics RLS - Allow anonymous inserts
DROP POLICY IF EXISTS "pwa_metrics_insert" ON pwa_metrics;
DROP POLICY IF EXISTS "pwa_metrics_select" ON pwa_metrics;

CREATE POLICY "pwa_metrics_insert_all" ON pwa_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "pwa_metrics_select_own" ON pwa_metrics
  FOR SELECT USING (true);

-- Fix 2-6: Add missing UNIQUE constraints for upsert operations
DO $$
BEGIN
  -- user_global_state
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_global_state_user_id_unique') THEN
    CREATE UNIQUE INDEX user_global_state_user_id_unique ON user_global_state(user_id);
  END IF;
  
  -- user_personalization_settings
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_personalization_settings_user_id_unique') THEN
    CREATE UNIQUE INDEX user_personalization_settings_user_id_unique ON user_personalization_settings(user_id);
  END IF;
  
  -- free_trial_usage
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'free_trial_usage_user_id_unique') THEN
    CREATE UNIQUE INDEX free_trial_usage_user_id_unique ON free_trial_usage(user_id);
  END IF;
  
  -- user_cart
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_cart_user_id_unique') THEN
    CREATE UNIQUE INDEX user_cart_user_id_unique ON user_cart(user_id);
  END IF;
  
  -- user_onboarding
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_onboarding_user_id_unique') THEN
    CREATE UNIQUE INDEX user_onboarding_user_id_unique ON user_onboarding(user_id);
  END IF;
  
  -- user_feature_tracking
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_feature_tracking_user_feature_unique') THEN
    CREATE UNIQUE INDEX user_feature_tracking_user_feature_unique ON user_feature_tracking(user_id, feature_key);
  END IF;
  
  -- exam_paused_sessions
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'exam_paused_sessions_user_id_unique') THEN
    CREATE UNIQUE INDEX exam_paused_sessions_user_id_unique ON exam_paused_sessions(user_id);
  END IF;
END $$;