-- Supprimer et recréer les fonctions pour les favoris et l'historique

DROP FUNCTION IF EXISTS public.med_mng_toggle_favorite(uuid);
DROP FUNCTION IF EXISTS public.med_mng_log_listen(uuid, integer, numeric, text);

-- Fonction pour toggle favoris
CREATE FUNCTION public.med_mng_toggle_favorite(
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
CREATE FUNCTION public.med_mng_log_listen(
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