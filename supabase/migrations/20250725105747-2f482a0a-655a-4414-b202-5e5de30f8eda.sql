-- Table pour l'aide contextuelle et l'onboarding dynamique
CREATE TABLE IF NOT EXISTS public.onboarding_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE, -- Identifiant unique pour le tip
  title JSONB NOT NULL DEFAULT '{}'::jsonb, -- Titre avec traductions {"fr": "Titre", "en": "Title"}
  body JSONB NOT NULL DEFAULT '{}'::jsonb, -- Contenu avec traductions
  type TEXT NOT NULL DEFAULT 'onboarding', -- Type: onboarding, tooltip, help, etc.
  version INTEGER NOT NULL DEFAULT 1, -- Numéro de version
  is_active BOOLEAN NOT NULL DEFAULT true, -- Actif ou non
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS pour l'aide contextuelle
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique (tout le monde peut lire l'aide)
CREATE POLICY "Allow public read access to onboarding steps" 
ON public.onboarding_steps 
FOR SELECT 
USING (is_active = true);

-- Politique de gestion pour service role
CREATE POLICY "Service role can manage onboarding steps" 
ON public.onboarding_steps 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_key ON public.onboarding_steps(key);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_type_active ON public.onboarding_steps(type, is_active);

-- Table pour logs d'activité avec structure JSON
CREATE TABLE IF NOT EXISTS public.operation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- Type d'opération: song_creation, payment, library_action, etc.
  message TEXT NOT NULL, -- Message descriptif
  meta JSONB DEFAULT '{}'::jsonb, -- Métadonnées structurées
  user_id UUID, -- ID utilisateur si disponible
  endpoint TEXT, -- Endpoint appelé
  status_code INTEGER, -- Code de statut HTTP
  duration_ms INTEGER, -- Durée en millisecondes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS pour les logs
ALTER TABLE public.operation_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour service role seulement
CREATE POLICY "Service role can manage operation logs" 
ON public.operation_logs 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- Index pour les performances des logs
CREATE INDEX IF NOT EXISTS idx_operation_logs_type_created ON public.operation_logs(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_created ON public.operation_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operation_logs_endpoint ON public.operation_logs(endpoint, created_at DESC);

-- Fonction pour nettoyer les anciens logs automatiquement (garder 6 mois)
CREATE OR REPLACE FUNCTION public.cleanup_old_operation_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.operation_logs 
  WHERE created_at < (NOW() - INTERVAL '6 months');
END;
$$;

-- Insérer quelques données d'exemple pour l'onboarding
INSERT INTO public.onboarding_steps (key, title, body, type, version) VALUES
('welcome', 
 '{"fr": "Bienvenue dans MED-MNG!", "en": "Welcome to MED-MNG!"}',
 '{"fr": "Découvrez comment générer vos premières chansons médicales personnalisées.", "en": "Learn how to generate your first personalized medical songs."}',
 'onboarding', 1),
('first_song', 
 '{"fr": "Créer votre première chanson", "en": "Create your first song"}',
 '{"fr": "Cliquez sur le bouton de génération et laissez l''IA créer votre musique.", "en": "Click the generation button and let AI create your music."}',
 'onboarding', 1),
('library_tip', 
 '{"fr": "Gérer votre bibliothèque", "en": "Manage your library"}',
 '{"fr": "Ajoutez vos chansons favorites à votre bibliothèque personnelle.", "en": "Add your favorite songs to your personal library."}',
 'tooltip', 1)
ON CONFLICT (key) DO NOTHING;