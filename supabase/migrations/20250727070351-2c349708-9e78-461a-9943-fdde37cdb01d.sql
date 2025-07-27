-- Créer les tables pour la génération de contenu musical

-- Table pour les pistes musicales générées
CREATE TABLE IF NOT EXISTS public.generated_music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  audio_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  generation_status TEXT DEFAULT 'pending'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les pistes vocales générées
CREATE TABLE IF NOT EXISTS public.generated_voice_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  model TEXT NOT NULL,
  audio_base64 TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  generation_status TEXT DEFAULT 'pending'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les images d'ambiance générées
CREATE TABLE IF NOT EXISTS public.generated_ambient_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  image_base64 TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  generation_status TEXT DEFAULT 'pending'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.generated_music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_voice_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_ambient_images ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour generated_music_tracks
CREATE POLICY "Users can view their own music tracks" 
ON public.generated_music_tracks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own music tracks" 
ON public.generated_music_tracks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music tracks" 
ON public.generated_music_tracks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music tracks" 
ON public.generated_music_tracks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Politiques RLS pour generated_voice_tracks
CREATE POLICY "Users can view their own voice tracks" 
ON public.generated_voice_tracks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice tracks" 
ON public.generated_voice_tracks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice tracks" 
ON public.generated_voice_tracks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice tracks" 
ON public.generated_voice_tracks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Politiques RLS pour generated_ambient_images
CREATE POLICY "Users can view their own ambient images" 
ON public.generated_ambient_images 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ambient images" 
ON public.generated_ambient_images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ambient images" 
ON public.generated_ambient_images 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ambient images" 
ON public.generated_ambient_images 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fonctions pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour l'auto-update des timestamps
CREATE TRIGGER update_generated_music_tracks_updated_at
  BEFORE UPDATE ON public.generated_music_tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_voice_tracks_updated_at
  BEFORE UPDATE ON public.generated_voice_tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_ambient_images_updated_at
  BEFORE UPDATE ON public.generated_ambient_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();