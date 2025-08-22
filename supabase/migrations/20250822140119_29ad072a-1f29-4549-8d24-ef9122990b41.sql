-- Création de la table quiz_sessions pour persister les sessions de quiz
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  rang TEXT NOT NULL CHECK (rang IN ('A', 'B', 'mix')),
  score NUMERIC NOT NULL DEFAULT 0,
  questions_count INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER,
  session_data JSONB NOT NULL DEFAULT '{}',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_item_code ON public.quiz_sessions(item_code);
CREATE INDEX idx_quiz_sessions_created_at ON public.quiz_sessions(created_at);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_quiz_sessions_updated_at
  BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour que les utilisateurs ne voient que leurs propres sessions
CREATE POLICY "Users can view their own quiz sessions"
  ON public.quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz sessions"
  ON public.quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions"
  ON public.quiz_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique pour le service role (pour l'administration)
CREATE POLICY "Service role can manage all quiz sessions"
  ON public.quiz_sessions FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);