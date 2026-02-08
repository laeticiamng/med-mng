-- Supprimer le trigger concurrent qui crée le profil SANS le nom
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Supprimer la fonction associée si elle existe
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Vérifier que le trigger on_auth_user_created_profiles existe toujours
-- (celui qui insère correctement le nom) - on ne le touche pas