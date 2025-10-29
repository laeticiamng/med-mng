-- Corriger le quota de musique pour le plan Standard (devrait être 30, pas 10)
UPDATE user_quotas 
SET monthly_music_quota = 30, 
    updated_at = now()
WHERE subscription_type = 'standard' AND monthly_music_quota = 10;