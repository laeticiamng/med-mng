-- Add unique constraints to existing tables (7-15)

-- user_global_state
ALTER TABLE public.user_global_state DROP CONSTRAINT IF EXISTS user_global_state_user_id_key;
ALTER TABLE public.user_global_state ADD CONSTRAINT user_global_state_user_id_key UNIQUE (user_id);

-- user_personalization_settings
ALTER TABLE public.user_personalization_settings DROP CONSTRAINT IF EXISTS user_personalization_settings_user_id_key;
ALTER TABLE public.user_personalization_settings ADD CONSTRAINT user_personalization_settings_user_id_key UNIQUE (user_id);

-- user_preferences
ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_key;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);

-- user_preferences_extended
ALTER TABLE public.user_preferences_extended DROP CONSTRAINT IF EXISTS user_preferences_extended_user_id_key;
ALTER TABLE public.user_preferences_extended ADD CONSTRAINT user_preferences_extended_user_id_key UNIQUE (user_id);

-- srs_card_data
ALTER TABLE public.srs_card_data DROP CONSTRAINT IF EXISTS srs_card_data_user_card_key;
ALTER TABLE public.srs_card_data ADD CONSTRAINT srs_card_data_user_card_key UNIQUE (user_id, card_id);

-- push_subscriptions
ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_endpoint_key;
ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);

-- unified_alerts
ALTER TABLE public.unified_alerts DROP CONSTRAINT IF EXISTS unified_alerts_external_id_key;
ALTER TABLE public.unified_alerts ADD CONSTRAINT unified_alerts_external_id_key UNIQUE (external_id);

-- med_mng_synchronized_lyrics
ALTER TABLE public.med_mng_synchronized_lyrics DROP CONSTRAINT IF EXISTS med_mng_synchronized_lyrics_song_id_key;
ALTER TABLE public.med_mng_synchronized_lyrics ADD CONSTRAINT med_mng_synchronized_lyrics_song_id_key UNIQUE (song_id);