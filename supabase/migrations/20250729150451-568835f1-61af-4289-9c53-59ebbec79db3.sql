-- Créer les tables et fonctions pour favoris et historique d'écoute

-- Table pour les favoris utilisateur
CREATE TABLE IF NOT EXISTS public.med_mng_user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id uuid REFERENCES public.med_mng_songs(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Table pour l'historique d'écoute
CREATE TABLE IF NOT EXISTS public.med_mng_listening_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id uuid REFERENCES public.med_mng_songs(id) ON DELETE CASCADE NOT NULL,
  listen_date timestamp with time zone DEFAULT now(),
  listen_duration_seconds integer DEFAULT 0,
  completion_percentage numeric(5,2) DEFAULT 0,
  device_type text DEFAULT 'web',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.med_mng_user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_mng_listening_history ENABLE ROW LEVEL SECURITY;

-- Fonctions pour favoris et historique

-- Fonction pour toggle favoris
CREATE OR REPLACE FUNCTION public.med_mng_toggle_favorite(
  song_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_favorite boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.med_mng_user_favorites 
    WHERE user_id = auth.uid() AND song_id = med_mng_toggle_favorite.song_id
  ) INTO is_favorite;
  
  IF is_favorite THEN
    DELETE FROM public.med_mng_user_favorites 
    WHERE user_id = auth.uid() AND song_id = med_mng_toggle_favorite.song_id;
    RETURN false;
  ELSE
    INSERT INTO public.med_mng_user_favorites (user_id, song_id)
    VALUES (auth.uid(), med_mng_toggle_favorite.song_id);
    RETURN true;
  END IF;
END;
$$;

-- Fonction pour enregistrer l'historique d'écoute
CREATE OR REPLACE FUNCTION public.med_mng_log_listen(
  song_id uuid,
  duration_seconds integer DEFAULT 0,
  completion_percentage numeric DEFAULT 0,
  device_type text DEFAULT 'web'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.med_mng_listening_history (
    user_id,
    song_id,
    listen_duration_seconds,
    completion_percentage,
    device_type
  ) VALUES (
    auth.uid(),
    med_mng_log_listen.song_id,
    duration_seconds,
    completion_percentage,
    device_type
  );
END;
$$;