-- Table pour stocker l'onboarding et l'aide contextuelle
CREATE TABLE public.onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL,
  body JSONB NOT NULL,
  type TEXT NOT NULL DEFAULT 'onboarding',
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer la RLS
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Public can read onboarding" ON public.onboarding_steps
  FOR SELECT USING (true);

-- Gestion complète pour le service role
CREATE POLICY "Service role manages onboarding" ON public.onboarding_steps
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Index de filtrage
CREATE INDEX idx_onboarding_steps_active ON public.onboarding_steps(is_active);
