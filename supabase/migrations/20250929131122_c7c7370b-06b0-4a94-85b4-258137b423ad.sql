-- Créer une edge function pour gérer les quotas IA
CREATE OR REPLACE FUNCTION public.get_user_ai_quota(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  remaining_credits integer,
  total_credits integer,
  credits_used integer,
  reset_date timestamp with time zone,
  subscription_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  quota_record RECORD;
  current_user_id UUID;
BEGIN
  -- Get current authenticated user
  current_user_id := COALESCE(p_user_id, auth.uid());
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get or create user quota record
  SELECT * INTO quota_record
  FROM public.user_quotas 
  WHERE user_id = current_user_id;
  
  -- If no quota record exists, create one with default values
  IF NOT FOUND THEN
    INSERT INTO public.user_quotas (
      user_id,
      subscription_type,
      monthly_music_quota,
      monthly_qcm_quota,
      monthly_chat_quota,
      monthly_music_used,
      monthly_qcm_used,
      monthly_chat_used,
      quota_reset_date
    ) VALUES (
      current_user_id,
      'free',
      5,   -- 5 music generations for free tier
      25,  -- 25 QCM generations for free tier  
      50,  -- 50 chat interactions for free tier
      0,
      0,
      0,
      date_trunc('month', now()) + interval '1 month'
    )
    RETURNING * INTO quota_record;
  END IF;
  
  -- Reset quotas if it's a new month
  IF quota_record.quota_reset_date <= now() THEN
    UPDATE public.user_quotas
    SET 
      monthly_music_used = 0,
      monthly_qcm_used = 0,
      monthly_chat_used = 0,
      quota_reset_date = date_trunc('month', now()) + interval '1 month',
      updated_at = now()
    WHERE user_id = current_user_id
    RETURNING * INTO quota_record;
  END IF;
  
  -- Calculate totals
  DECLARE
    total_quota integer := quota_record.monthly_music_quota + 
                          quota_record.monthly_qcm_quota + 
                          quota_record.monthly_chat_quota;
    total_used integer := quota_record.monthly_music_used + 
                         quota_record.monthly_qcm_used + 
                         quota_record.monthly_chat_used;
    remaining integer := GREATEST(0, total_quota - total_used);
  BEGIN
    RETURN QUERY SELECT 
      remaining,
      total_quota,
      total_used,
      quota_record.quota_reset_date,
      quota_record.subscription_type;
  END;
END;
$$;