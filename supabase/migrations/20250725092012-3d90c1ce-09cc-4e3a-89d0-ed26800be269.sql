-- Compléter la fonction de décrément de quota
CREATE OR REPLACE FUNCTION public.med_mng_decrement_quota(
  credits_to_use INTEGER DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER := 0;
  is_test BOOLEAN := false;
  result jsonb;
BEGIN
  -- Vérifier si c'est un compte test
  SELECT COALESCE(profiles.is_test_account, false) INTO is_test
  FROM public.profiles
  WHERE profiles.id = auth.uid();
  
  -- Si c'est un compte test, permettre utilisation illimitée
  IF is_test THEN
    RETURN jsonb_build_object(
      'success', true,
      'remaining_credits', 999999,
      'used_credits', credits_to_use,
      'account_type', 'test'
    );
  END IF;
  
  -- Récupérer les crédits actuels
  SELECT COALESCE(credits_left, 0) INTO current_credits
  FROM public.med_mng_subscriptions
  WHERE user_id = auth.uid();
  
  -- Vérifier si l'utilisateur a suffisamment de crédits
  IF current_credits < credits_to_use THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Quota insuffisant',
      'error_code', 'QUOTA_EXCEEDED',
      'remaining_credits', current_credits,
      'required_credits', credits_to_use
    );
  END IF;
  
  -- Décrémenter les crédits
  UPDATE public.med_mng_subscriptions 
  SET 
    credits_left = credits_left - credits_to_use,
    updated_at = now()
  WHERE user_id = auth.uid();
  
  -- Récupérer les nouveaux crédits
  SELECT COALESCE(credits_left, 0) INTO current_credits
  FROM public.med_mng_subscriptions
  WHERE user_id = auth.uid();
  
  RETURN jsonb_build_object(
    'success', true,
    'remaining_credits', current_credits,
    'used_credits', credits_to_use,
    'account_type', 'normal'
  );
END;
$$;

-- Créer table pour logger les consommations IA
CREATE TABLE IF NOT EXISTS public.ia_usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  service_type text NOT NULL, -- 'openai', 'suno', 'other'
  operation_type text NOT NULL, -- 'chat', 'image', 'music_generation', etc.
  credits_used integer NOT NULL DEFAULT 1,
  request_details jsonb DEFAULT '{}',
  response_status text NOT NULL, -- 'success', 'quota_exceeded', 'error'
  error_details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_ia_usage_logs_user_id ON public.ia_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ia_usage_logs_created_at ON public.ia_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ia_usage_logs_service_type ON public.ia_usage_logs(service_type);

-- Enable RLS sur la table des logs
ALTER TABLE public.ia_usage_logs ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour les logs d'usage IA
CREATE POLICY "Users can view their own IA usage logs"
ON public.ia_usage_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all IA usage logs"
ON public.ia_usage_logs
FOR ALL
TO service_role
USING (true);

-- Fonction pour logger l'usage IA
CREATE OR REPLACE FUNCTION public.log_ia_usage(
  p_service_type text,
  p_operation_type text,
  p_credits_used integer DEFAULT 1,
  p_request_details jsonb DEFAULT '{}',
  p_response_status text DEFAULT 'success',
  p_error_details text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.ia_usage_logs (
    user_id,
    service_type,
    operation_type,
    credits_used,
    request_details,
    response_status,
    error_details
  )
  VALUES (
    auth.uid(),
    p_service_type,
    p_operation_type,
    p_credits_used,
    p_request_details,
    p_response_status,
    p_error_details
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Fonction pour obtenir les stats d'usage par utilisateur
CREATE OR REPLACE FUNCTION public.get_user_ia_stats(
  p_period_days integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_credits_used', COALESCE(SUM(credits_used), 0),
    'total_requests', COUNT(*),
    'successful_requests', COUNT(*) FILTER (WHERE response_status = 'success'),
    'quota_exceeded_requests', COUNT(*) FILTER (WHERE response_status = 'quota_exceeded'),
    'error_requests', COUNT(*) FILTER (WHERE response_status = 'error'),
    'services_breakdown', jsonb_object_agg(
      service_type, 
      jsonb_build_object(
        'credits_used', COALESCE(SUM(credits_used), 0),
        'requests', COUNT(*)
      )
    ),
    'period_start', (now() - interval '1 day' * p_period_days)::date,
    'period_end', now()::date
  ) INTO result
  FROM public.ia_usage_logs
  WHERE user_id = auth.uid()
    AND created_at >= (now() - interval '1 day' * p_period_days)
  GROUP BY service_type;
  
  RETURN COALESCE(result, '{"total_credits_used": 0, "total_requests": 0}'::jsonb);
END;
$$;