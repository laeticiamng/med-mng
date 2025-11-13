-- ============================================
-- Table des Notifications en Temps Réel
-- ============================================

-- Créer la table des notifications de sécurité
CREATE TABLE IF NOT EXISTS public.security_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  type TEXT NOT NULL CHECK (type IN ('mass_deletion', 'unauthorized_access', 'suspicious_activity', 'system_alert')),
  details JSONB,
  related_user_id UUID,
  related_resource_type TEXT,
  related_resource_id TEXT,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Index pour améliorer les performances
CREATE INDEX idx_security_notifications_created_at ON public.security_notifications(created_at DESC);
CREATE INDEX idx_security_notifications_severity ON public.security_notifications(severity);
CREATE INDEX idx_security_notifications_read_by ON public.security_notifications USING GIN(read_by);

-- Activer RLS
ALTER TABLE public.security_notifications ENABLE ROW LEVEL SECURITY;

-- Politique : Les admins et security_analysts peuvent voir toutes les notifications
CREATE POLICY "Admins and analysts can view notifications"
ON public.security_notifications
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'security_analyst')
);

-- Politique : Seuls les admins peuvent créer des notifications
CREATE POLICY "Admins can create notifications"
ON public.security_notifications
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Politique : Les utilisateurs peuvent marquer leurs notifications comme lues
CREATE POLICY "Users can update their read status"
ON public.security_notifications
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'security_analyst')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'security_analyst')
);

-- Politique : Seuls les admins peuvent supprimer
CREATE POLICY "Only admins can delete notifications"
ON public.security_notifications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Activer Realtime pour cette table
ALTER TABLE public.security_notifications REPLICA IDENTITY FULL;

-- Fonction pour nettoyer les notifications expirées automatiquement
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.security_notifications
  WHERE expires_at < NOW();
END;
$$;

-- Créer une fonction pour marquer une notification comme lue
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(notification_id UUID, user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.security_notifications
  SET read_by = array_append(read_by, user_id)
  WHERE id = notification_id
  AND NOT (user_id = ANY(read_by));
END;
$$;

COMMENT ON TABLE public.security_notifications IS 'Notifications de sécurité en temps réel pour les administrateurs et analystes';
COMMENT ON FUNCTION public.mark_notification_as_read IS 'Marque une notification comme lue par un utilisateur';
COMMENT ON FUNCTION public.cleanup_expired_notifications IS 'Nettoie les notifications expirées';
