-- TOP 15 FIX: Add missing unique constraints for upsert operations

-- 1. med_mng_recommendations: unique on user_id + content_id to allow updates
ALTER TABLE public.med_mng_recommendations DROP CONSTRAINT IF EXISTS med_mng_recommendations_user_content_key;
ALTER TABLE public.med_mng_recommendations ADD CONSTRAINT med_mng_recommendations_user_content_key UNIQUE (user_id, content_id);

-- 2. user_modules: unique on user_id + module_name (if not already exists)
ALTER TABLE public.user_modules DROP CONSTRAINT IF EXISTS user_modules_user_module_key;
ALTER TABLE public.user_modules ADD CONSTRAINT user_modules_user_module_key UNIQUE (user_id, module_name);

-- 3. generated_ambient_images: unique on user_id + prompt for caching
ALTER TABLE public.generated_ambient_images DROP CONSTRAINT IF EXISTS generated_ambient_images_user_prompt_key;
ALTER TABLE public.generated_ambient_images ADD CONSTRAINT generated_ambient_images_user_prompt_key UNIQUE (user_id, prompt);

-- 4. generated_voice_tracks: unique on user_id + text + voice_id for caching  
ALTER TABLE public.generated_voice_tracks DROP CONSTRAINT IF EXISTS generated_voice_tracks_user_text_voice_key;
ALTER TABLE public.generated_voice_tracks ADD CONSTRAINT generated_voice_tracks_user_text_voice_key UNIQUE (user_id, text, voice_id);