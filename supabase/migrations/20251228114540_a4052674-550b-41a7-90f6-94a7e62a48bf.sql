-- Table pour l'historique des sessions de révision
CREATE TABLE IF NOT EXISTS public.revision_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_code TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_revision_history_user_date ON public.revision_history(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_revision_history_item ON public.revision_history(item_code);

-- Enable RLS
ALTER TABLE public.revision_history ENABLE ROW LEVEL SECURITY;

-- Policy: les utilisateurs ne voient que leur propre historique
CREATE POLICY "Users can view own revision history"
ON public.revision_history
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: les utilisateurs peuvent insérer leur propre historique
CREATE POLICY "Users can insert own revision history"
ON public.revision_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: les utilisateurs peuvent supprimer leur propre historique
CREATE POLICY "Users can delete own revision history"
ON public.revision_history
FOR DELETE
USING (auth.uid() = user_id);