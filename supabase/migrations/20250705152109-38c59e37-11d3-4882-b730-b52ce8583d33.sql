-- Corriger le plan gratuit pour qu'il ait 3 générations par mois
UPDATE subscription_plans 
SET monthly_music_quota = 3,
    updated_at = now()
WHERE id = 'free';