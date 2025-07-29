-- Création de la table enhanced_chat_logs pour le monitoring du Point IX
CREATE TABLE IF NOT EXISTS public.enhanced_chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  edn_context_items TEXT[] NOT NULL DEFAULT '{}',
  web_fallback_used BOOLEAN NOT NULL DEFAULT false,
  response_source TEXT NOT NULL CHECK (response_source IN ('edn_local', 'web_fallback', 'edn_limited')),
  response_quality_score INTEGER CHECK (response_quality_score >= 1 AND response_quality_score <= 5),
  conversation_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances de requête
CREATE INDEX IF NOT EXISTS idx_enhanced_chat_logs_user_id ON public.enhanced_chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_chat_logs_created_at ON public.enhanced_chat_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_enhanced_chat_logs_conversation_id ON public.enhanced_chat_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_chat_logs_response_source ON public.enhanced_chat_logs(response_source);

-- RLS (Row Level Security) pour la sécurité
ALTER TABLE public.enhanced_chat_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs : peuvent voir uniquement leurs propres logs
CREATE POLICY "Users can view own chat logs" ON public.enhanced_chat_logs
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Politique pour les utilisateurs : peuvent créer leurs propres logs
CREATE POLICY "Users can create own chat logs" ON public.enhanced_chat_logs
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Politique pour les admins : peuvent tout voir et gérer
CREATE POLICY "Admins can manage all chat logs" ON public.enhanced_chat_logs
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Fonction pour nettoyer automatiquement les anciens logs (plus de 90 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_chat_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.enhanced_chat_logs 
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_enhanced_chat_logs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_enhanced_chat_logs_updated_at
  BEFORE UPDATE ON public.enhanced_chat_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_enhanced_chat_logs_updated_at();