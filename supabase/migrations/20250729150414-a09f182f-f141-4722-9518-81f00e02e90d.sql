-- Créer uniquement les nouvelles tables et fonctions manquantes

-- Table pour les favoris utilisateur (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS public.med_mng_user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id uuid REFERENCES public.med_mng_songs(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Table pour l'historique d'écoute (si elle n'existe pas)
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

-- Enable RLS uniquement si les tables n'ont pas déjà RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'med_mng_user_favorites' 
    AND hasrls
  ) THEN
    ALTER TABLE public.med_mng_user_favorites ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'med_mng_listening_history' 
    AND hasrls
  ) THEN
    ALTER TABLE public.med_mng_listening_history ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- RLS Policies pour med_mng_user_favorites (créer seulement si n'existent pas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'med_mng_user_favorites' 
    AND policyname = 'Users can manage their own favorites'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can manage their own favorites"
    ON public.med_mng_user_favorites
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;

-- RLS Policies pour med_mng_listening_history (créer seulement si n'existent pas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'med_mng_listening_history' 
    AND policyname = 'Users can manage their own listening history'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can manage their own listening history"
    ON public.med_mng_listening_history
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;

-- Fonction pour ajouter aux favoris
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
  -- Vérifier si déjà en favoris
  SELECT EXISTS (
    SELECT 1 FROM public.med_mng_user_favorites 
    WHERE user_id = auth.uid() AND song_id = med_mng_toggle_favorite.song_id
  ) INTO is_favorite;
  
  IF is_favorite THEN
    -- Retirer des favoris
    DELETE FROM public.med_mng_user_favorites 
    WHERE user_id = auth.uid() AND song_id = med_mng_toggle_favorite.song_id;
    RETURN false;
  ELSE
    -- Ajouter aux favoris
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