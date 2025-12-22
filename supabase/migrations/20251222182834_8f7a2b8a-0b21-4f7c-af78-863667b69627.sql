-- Forcer la correction de la contrainte user_settings
-- D'abord supprimer l'index/contrainte existante qui pourrait bloquer
DROP INDEX IF EXISTS user_settings_user_key_unique;
DROP INDEX IF EXISTS user_settings_user_id_key_unique;

-- Supprimer la contrainte sur user_id seul
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_key;

-- Créer la contrainte correcte sur (user_id, key)
ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_user_key_unique UNIQUE (user_id, key);