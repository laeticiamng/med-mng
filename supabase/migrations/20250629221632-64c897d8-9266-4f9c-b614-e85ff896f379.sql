
-- Renommer les fonctions existantes pour ajouter le préfixe MED MNG
-- Si elles existent déjà avec le bon préfixe, ces commandes ne feront rien

-- Fonction pour créer un log d'activité utilisateur
CREATE OR REPLACE FUNCTION public.med_mng_log_user_activity(
  activity_type_param text,
  activity_details_param jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    activity_details,
    timestamp
  ) VALUES (
    auth.uid(),
    activity_type_param,
    activity_details_param,
    now()
  );
END;
$function$;

-- Fonction pour obtenir les statistiques d'activité MED MNG
CREATE OR REPLACE FUNCTION public.med_mng_get_activity_stats(
  p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, 
  p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone
)
RETURNS TABLE(activity_type text, total_count bigint, percentage numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_total BIGINT;
BEGIN
  -- Get the total count of activities for MED MNG platform
  SELECT COUNT(*) INTO v_total
  FROM user_activity_logs
  WHERE 
    (p_start_date IS NULL OR timestamp >= p_start_date) AND
    (p_end_date IS NULL OR timestamp <= p_end_date) AND
    (activity_details->>'platform' = 'med-mng' OR activity_details->>'platform' IS NULL);

  -- Return statistics
  RETURN QUERY
  SELECT
    activity_type,
    COUNT(*) as total_count,
    CASE 
      WHEN v_total > 0 THEN (COUNT(*)::NUMERIC / v_total) * 100
      ELSE 0
    END as percentage
  FROM
    user_activity_logs
  WHERE 
    (p_start_date IS NULL OR timestamp >= p_start_date) AND
    (p_end_date IS NULL OR timestamp <= p_end_date) AND
    (activity_details->>'platform' = 'med-mng' OR activity_details->>'platform' IS NULL)
  GROUP BY
    activity_type
  ORDER BY
    total_count DESC;
END;
$function$;

-- Fonction pour obtenir les logs d'activité anonymes MED MNG
CREATE OR REPLACE FUNCTION public.med_mng_get_anonymous_activity_logs(
  p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, 
  p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, 
  p_activity_type text DEFAULT NULL::text, 
  p_search_term text DEFAULT NULL::text, 
  p_page integer DEFAULT 1, 
  p_page_size integer DEFAULT 20
)
RETURNS TABLE(id uuid, activity_type text, category text, count bigint, timestamp_day date)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_offset INTEGER;
  v_total_count INTEGER;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  RETURN QUERY
  WITH filtered_logs AS (
    SELECT 
      user_activity_logs.activity_type,
      COALESCE(user_activity_logs.activity_details->>'category', 'Non catégorisé') as category,
      DATE_TRUNC('day', user_activity_logs.timestamp)::DATE as day,
      COUNT(*) as activity_count
    FROM 
      user_activity_logs
    WHERE 
      (p_start_date IS NULL OR user_activity_logs.timestamp >= p_start_date) AND
      (p_end_date IS NULL OR user_activity_logs.timestamp <= p_end_date) AND
      (p_activity_type IS NULL OR user_activity_logs.activity_type = p_activity_type) AND
      (p_search_term IS NULL OR 
        user_activity_logs.activity_type ILIKE '%' || p_search_term || '%' OR
        user_activity_logs.activity_details::TEXT ILIKE '%' || p_search_term || '%') AND
      (user_activity_logs.activity_details->>'platform' = 'med-mng' OR user_activity_logs.activity_details->>'platform' IS NULL)
    GROUP BY 
      user_activity_logs.activity_type, 
      category,
      DATE_TRUNC('day', user_activity_logs.timestamp)::DATE
  )
  SELECT
    gen_random_uuid() as id,
    activity_type,
    category,
    activity_count as count,
    day as timestamp_day
  FROM
    filtered_logs
  ORDER BY
    day DESC,
    activity_count DESC
  LIMIT p_page_size
  OFFSET v_offset;
END;
$function$;

-- Fonction pour nettoyer les anciens logs MED MNG
CREATE OR REPLACE FUNCTION public.med_mng_delete_old_activity_logs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Delete MED MNG activity logs older than 12 months
  DELETE FROM public.user_activity_logs
  WHERE timestamp < (NOW() - INTERVAL '12 months')
  AND (activity_details->>'platform' = 'med-mng' OR activity_details->>'platform' IS NULL);
  
  RETURN NULL;
END;
$function$;

-- Fonction pour créer le job de nettoyage des logs MED MNG
CREATE OR REPLACE FUNCTION public.med_mng_create_activity_log_cleanup_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Upsert the scheduled job for MED MNG
  PERFORM cron.schedule(
    'med-mng-activity-logs-cleanup',
    '0 0 * * *',
    'SELECT public.med_mng_delete_old_activity_logs()'
  );
END;
$function$;

-- Fonction pour gérer les nouveaux utilisateurs MED MNG
CREATE OR REPLACE FUNCTION public.med_mng_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, is_test_account)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    CASE WHEN new.email = 'test@medmng.com' THEN true ELSE false END
  );
  
  -- Log l'activité de création de compte pour MED MNG
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    activity_details,
    timestamp
  ) VALUES (
    new.id,
    'account_created',
    jsonb_build_object('platform', 'med-mng', 'email', new.email),
    now()
  );
  
  RETURN new;
END;
$function$;

-- Fonction pour déclencher l'email de bienvenue MED MNG
CREATE OR REPLACE FUNCTION public.med_mng_trigger_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Appeler la fonction d'envoi d'email de bienvenue pour MED MNG
  PERFORM pg_notify('med_mng_send_welcome_email', json_build_object(
    'user_id', NEW.id,
    'email', NEW.email,
    'name', COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'platform', 'med-mng'
  )::text);
  
  RETURN NEW;
END;
$function$;
