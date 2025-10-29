-- Ajouter une contrainte d'unicité sur user_id dans user_quotas
-- D'abord supprimer les doublons potentiels en gardant le plus récent
DELETE FROM public.user_quotas a
USING public.user_quotas b
WHERE a.id < b.id 
AND a.user_id = b.user_id;

-- Puis ajouter la contrainte d'unicité
ALTER TABLE public.user_quotas
ADD CONSTRAINT user_quotas_user_id_unique UNIQUE (user_id);