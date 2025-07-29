-- Supprimer les fonctions existantes et les recréer
DROP FUNCTION IF EXISTS public.med_mng_decrement_quota(integer);
DROP FUNCTION IF EXISTS public.med_mng_get_remaining_quota();
DROP FUNCTION IF EXISTS public.log_ia_usage(text, text, integer, jsonb, text, integer, text);
DROP FUNCTION IF EXISTS public.get_user_ia_stats(integer);

-- Fonction pour obtenir les quotas restants
CREATE FUNCTION public.med_mng_get_remaining_quota()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Fonction pour décrémenter les quotas
CREATE FUNCTION public.med_mng_decrement_quota(credits_to_use integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Fonction pour logger l'usage IA
CREATE FUNCTION public.log_ia_usage(
  p_service_type text,
  p_operation_type text,
  p_credits_used integer DEFAULT 0,
  p_request_details jsonb DEFAULT '{}',
  p_response_status text DEFAULT 'success',
  p_response_time_ms integer DEFAULT NULL,
  p_error_details text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.ia_usage_logs (
    user_id,
    service_type,
    operation_type,
    credits_used,
    request_details,
    response_status,
    response_time_ms,
    error_details
  ) VALUES (
    auth.uid(),
    p_service_type,
    p_operation_type,
    p_credits_used,
    p_request_details,
    p_response_status,
    p_response_time_ms,
    p_error_details
  );
END;
$$;

-- Fonction pour obtenir les stats d'usage IA
CREATE FUNCTION public.get_user_ia_stats(p_period_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stats_result jsonb;
BEGIN
  WITH usage_stats AS (
    SELECT 
      service_type,
      COUNT(*) as total_operations,
      SUM(credits_used) as total_credits,
      AVG(response_time_ms) as avg_response_time,
      COUNT(CASE WHEN response_status = 'error' THEN 1 END) as error_count
    FROM public.ia_usage_logs
    WHERE user_id = auth.uid()
    AND created_at >= now() - (p_period_days || ' days')::interval
    GROUP BY service_type
  ),
  daily_usage AS (
    SELECT 
      DATE(created_at) as usage_date,
      SUM(credits_used) as daily_credits
    FROM public.ia_usage_logs
    WHERE user_id = auth.uid()
    AND created_at >= now() - (p_period_days || ' days')::interval
    GROUP BY DATE(created_at)
    ORDER BY usage_date DESC
  )
  SELECT jsonb_build_object(
    'by_service', COALESCE(jsonb_agg(to_jsonb(usage_stats)), '[]'::jsonb),
    'daily_usage', COALESCE((SELECT jsonb_agg(to_jsonb(daily_usage)) FROM daily_usage), '[]'::jsonb),
    'period_days', p_period_days,
    'total_operations', COALESCE((SELECT SUM(total_operations) FROM usage_stats), 0),
    'total_credits_used', COALESCE((SELECT SUM(total_credits) FROM usage_stats), 0)
  ) INTO stats_result;
  
  RETURN stats_result;
END;
$$;