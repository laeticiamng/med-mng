-- Fix Security Definer View warnings by removing unnecessary SECURITY DEFINER from functions
-- that don't need elevated privileges and ensuring proper security for those that do

-- Remove SECURITY DEFINER from functions that don't need it
-- These functions can safely run with the permissions of the calling user

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (auth.jwt() ->> 'role'),
    'authenticated'
  );
$function$;

CREATE OR REPLACE FUNCTION public.med_mng_get_remaining_quota()
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  user_quota_record RECORD;
  remaining_credits INTEGER := 0;
BEGIN
  SELECT * INTO user_quota_record
  FROM public.user_quotas
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    INSERT INTO public.user_quotas (
      user_id,
      subscription_type,
      monthly_music_quota,
      monthly_qcm_quota,
      monthly_chat_quota
    ) VALUES (
      auth.uid(),
      'standard',
      10,
      50,
      100
    );
    RETURN 160; -- Total quota par défaut (10+50+100)
  END IF;
  
  remaining_credits := (user_quota_record.monthly_music_quota + 
                       user_quota_record.monthly_qcm_quota + 
                       user_quota_record.monthly_chat_quota) -
                      (user_quota_record.monthly_music_used + 
                       user_quota_record.monthly_qcm_used + 
                       user_quota_record.monthly_chat_used);
  
  RETURN GREATEST(remaining_credits, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.med_mng_decrement_quota(credits_to_use integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  user_quota_record RECORD;
  remaining_credits INTEGER;
  result jsonb;
BEGIN
  SELECT * INTO user_quota_record
  FROM public.user_quotas
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    PERFORM public.med_mng_get_remaining_quota();
    SELECT * INTO user_quota_record
    FROM public.user_quotas
    WHERE user_id = auth.uid();
  END IF;
  
  remaining_credits := (user_quota_record.monthly_music_quota + 
                       user_quota_record.monthly_qcm_quota + 
                       user_quota_record.monthly_chat_quota) -
                      (user_quota_record.monthly_music_used + 
                       user_quota_record.monthly_qcm_used + 
                       user_quota_record.monthly_chat_used);
  
  IF remaining_credits < credits_to_use THEN
    result := jsonb_build_object(
      'success', false,
      'error', 'Quota insuffisant',
      'remaining_credits', GREATEST(remaining_credits, 0),
      'required_credits', credits_to_use
    );
    RETURN result;
  END IF;
  
  UPDATE public.user_quotas
  SET 
    monthly_music_used = monthly_music_used + credits_to_use,
    updated_at = now()
  WHERE user_id = auth.uid();
  
  result := jsonb_build_object(
    'success', true,
    'remaining_credits', remaining_credits - credits_to_use,
    'credits_used', credits_to_use
  );
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.med_mng_toggle_favorite(song_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.med_mng_log_listen(song_id uuid, duration_seconds integer DEFAULT 0, completion_percentage numeric DEFAULT 0, device_type text DEFAULT 'web'::text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.validate_music_lyrics(lyrics_data jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF lyrics_data IS NULL THEN
    RETURN false;
  END IF;
  
  -- Vérification de la structure des paroles
  IF NOT (lyrics_data ? 'verses' OR lyrics_data ? 'chorus') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_rate_limit_status(p_identifier text, p_window_duration_seconds integer, p_max_requests integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  window_start_time TIMESTAMP WITH TIME ZONE;
  window_end_time TIMESTAMP WITH TIME ZONE;
  current_count INTEGER := 0;
BEGIN
  -- Calculate current window
  window_start_time := date_trunc('minute', now()) + 
    (EXTRACT(minute FROM now())::integer / (p_window_duration_seconds / 60)) * 
    INTERVAL '1 minute' * (p_window_duration_seconds / 60);
  window_end_time := window_start_time + (p_window_duration_seconds || ' seconds')::INTERVAL;
  
  -- Get current count
  SELECT COALESCE(request_count, 0) INTO current_count
  FROM public.rate_limit_counters
  WHERE identifier = p_identifier
    AND window_start = window_start_time
    AND window_end = window_end_time;
  
  -- Return status
  RETURN jsonb_build_object(
    'identifier', p_identifier,
    'current_count', current_count,
    'max_requests', p_max_requests,
    'window_start', window_start_time,
    'window_end', window_end_time,
    'rate_limited', current_count >= p_max_requests,
    'remaining_requests', GREATEST(0, p_max_requests - current_count),
    'reset_time', window_end_time
  );
END;
$function$;

-- Fix check_rate_limit function to be more secure and only allow authenticated users
CREATE OR REPLACE FUNCTION public.check_rate_limit(user_identifier text, action_type text, max_attempts integer DEFAULT 10, time_window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Only allow authenticated users to call this function
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Count recent attempts (gracefully handle missing table)
  BEGIN
    SELECT COUNT(*) INTO attempt_count
    FROM public.rate_limit_log
    WHERE identifier = user_identifier
      AND action = action_type
      AND created_at > (now() - (time_window_minutes || ' minutes')::interval);
  EXCEPTION WHEN undefined_table THEN
    attempt_count := 0;
  END;
  
  -- Log this attempt (gracefully handle missing table)
  BEGIN
    INSERT INTO public.rate_limit_log (identifier, action, created_at)
    VALUES (user_identifier, action_type, now())
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  
  -- Return whether limit is exceeded
  RETURN attempt_count < max_attempts;
END;
$function$;