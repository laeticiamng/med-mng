-- Add unique constraint to med_mng_user_settings
ALTER TABLE public.med_mng_user_settings DROP CONSTRAINT IF EXISTS med_mng_user_settings_user_id_key;
ALTER TABLE public.med_mng_user_settings ADD CONSTRAINT med_mng_user_settings_user_id_key UNIQUE (user_id);