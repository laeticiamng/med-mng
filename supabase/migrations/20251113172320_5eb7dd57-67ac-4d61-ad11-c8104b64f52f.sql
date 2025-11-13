-- Créer la table des notifications de qualité
CREATE TABLE IF NOT EXISTS public.quality_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('code_quality', 'visual_regression')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  summary TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.quality_notifications ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Tous les utilisateurs peuvent voir les notifications"
ON public.quality_notifications
FOR SELECT
USING (true);

-- Créer un index pour les performances
CREATE INDEX idx_quality_notifications_created_at ON public.quality_notifications(created_at DESC);
CREATE INDEX idx_quality_notifications_severity ON public.quality_notifications(severity);