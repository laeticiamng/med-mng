-- Supprimer la fonction existante d'abord
DROP FUNCTION IF EXISTS public.med_mng_decrement_quota(integer);

-- Fonctions pour la gestion des quotas IA
CREATE OR REPLACE FUNCTION public.med_mng_get_remaining_quota()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_quota_record RECORD;
  remaining_credits INTEGER := 0;
BEGIN
  -- Récupérer les quotas de l'utilisateur
  SELECT * INTO user_quota_record
  FROM public.user_quotas
  WHERE user_id = auth.uid();
  
  -- Si pas de quota configuré, créer un quota par défaut
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
    RETURN 10; -- Quota par défaut
  END IF;
  
  -- Calculer les crédits restants (total des quotas - utilisés)
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
CREATE OR REPLACE FUNCTION public.med_mng_decrement_quota(credits_to_use integer)
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
  -- Récupérer les quotas actuels
  SELECT * INTO user_quota_record
  FROM public.user_quotas
  WHERE user_id = auth.uid();
  
  -- Si pas de quota, créer par défaut
  IF NOT FOUND THEN
    PERFORM public.med_mng_get_remaining_quota(); -- Cela va créer le quota
    SELECT * INTO user_quota_record
    FROM public.user_quotas
    WHERE user_id = auth.uid();
  END IF;
  
  -- Calculer les crédits restants
  remaining_credits := (user_quota_record.monthly_music_quota + 
                       user_quota_record.monthly_qcm_quota + 
                       user_quota_record.monthly_chat_quota) -
                      (user_quota_record.monthly_music_used + 
                       user_quota_record.monthly_qcm_used + 
                       user_quota_record.monthly_chat_used);
  
  -- Vérifier si assez de crédits
  IF remaining_credits < credits_to_use THEN
    result := jsonb_build_object(
      'success', false,
      'error', 'Quota insuffisant',
      'remaining_credits', GREATEST(remaining_credits, 0),
      'required_credits', credits_to_use
    );
    RETURN result;
  END IF;
  
  -- Décrémenter les crédits (on utilise music_used comme crédits généraux)
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

-- Table pour logger l'usage IA
CREATE TABLE public.ia_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL, -- 'music', 'qcm', 'chat', 'bd', 'roman'
  operation_type text NOT NULL, -- 'generation', 'consumption', 'stream'
  credits_used integer DEFAULT 0,
  request_details jsonb DEFAULT '{}',
  response_status text NOT NULL, -- 'success', 'error', 'quota_exceeded'
  response_time_ms integer,
  error_details text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS pour ia_usage_logs
ALTER TABLE public.ia_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy pour ia_usage_logs
CREATE POLICY "Users can view their own IA usage logs"
ON public.ia_usage_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert IA usage logs"
ON public.ia_usage_logs
FOR INSERT
WITH CHECK (true);

-- Fonction pour logger l'usage IA
CREATE OR REPLACE FUNCTION public.log_ia_usage(
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
CREATE OR REPLACE FUNCTION public.get_user_ia_stats(p_period_days integer DEFAULT 30)
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