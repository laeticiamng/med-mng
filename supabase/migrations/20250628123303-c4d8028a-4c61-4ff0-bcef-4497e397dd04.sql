
-- Créer la table pour stocker les musiques sauvegardées par les utilisateurs
CREATE TABLE public.user_generated_music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  music_style TEXT NOT NULL,
  rang TEXT NOT NULL,
  item_code TEXT,
  music_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.user_generated_music ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient seulement leurs musiques
CREATE POLICY "Users can view their own saved music" 
  ON public.user_generated_music 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent sauvegarder leurs musiques
CREATE POLICY "Users can save their own music" 
  ON public.user_generated_music 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent supprimer leurs musiques
CREATE POLICY "Users can delete their own music" 
  ON public.user_generated_music 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_user_generated_music_user_id ON public.user_generated_music(user_id);
CREATE INDEX idx_user_generated_music_created_at ON public.user_generated_music(created_at);
