-- Ajouter la colonne is_test_account manquante à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_test_account boolean DEFAULT false;

-- Ajouter la colonne subscription_plan si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free';

-- Ajouter la colonne credits_left si elle n'existe pas  
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits_left integer DEFAULT 2;