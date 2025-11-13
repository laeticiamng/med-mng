-- ============================================
-- Table des Templates de Filtres
-- ============================================

-- Créer la table pour les templates de filtres sauvegardés
CREATE TABLE IF NOT EXISTS public.notification_filter_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_filter_templates_user_id ON public.notification_filter_templates(user_id);
CREATE INDEX idx_filter_templates_created_at ON public.notification_filter_templates(created_at DESC);

-- Activer RLS
ALTER TABLE public.notification_filter_templates ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres templates
CREATE POLICY "Users can view their own filter templates"
ON public.notification_filter_templates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent créer leurs propres templates
CREATE POLICY "Users can create their own filter templates"
ON public.notification_filter_templates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent modifier leurs propres templates
CREATE POLICY "Users can update their own filter templates"
ON public.notification_filter_templates
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres templates
CREATE POLICY "Users can delete their own filter templates"
ON public.notification_filter_templates
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION public.update_filter_template_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_filter_templates_updated_at
BEFORE UPDATE ON public.notification_filter_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_filter_template_updated_at();

-- Fonction pour s'assurer qu'un seul template est par défaut par utilisateur
CREATE OR REPLACE FUNCTION public.ensure_single_default_template()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si le nouveau template est marqué comme par défaut
  IF NEW.is_default = true THEN
    -- Désactiver tous les autres templates par défaut de cet utilisateur
    UPDATE public.notification_filter_templates
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour s'assurer qu'un seul template par défaut
CREATE TRIGGER ensure_single_default_before_insert
BEFORE INSERT ON public.notification_filter_templates
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION public.ensure_single_default_template();

CREATE TRIGGER ensure_single_default_before_update
BEFORE UPDATE ON public.notification_filter_templates
FOR EACH ROW
WHEN (NEW.is_default = true AND OLD.is_default = false)
EXECUTE FUNCTION public.ensure_single_default_template();

COMMENT ON TABLE public.notification_filter_templates IS 'Templates de filtres sauvegardés par les utilisateurs pour les notifications de sécurité';
COMMENT ON COLUMN public.notification_filter_templates.filters IS 'JSONB contenant la configuration des filtres (severity, type, dateFrom, dateTo, etc.)';
COMMENT ON COLUMN public.notification_filter_templates.is_default IS 'Indique si ce template doit être chargé par défaut';
