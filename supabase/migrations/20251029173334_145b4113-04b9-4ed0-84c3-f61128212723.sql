-- Fix get_user_quota function to use correct column name
DROP FUNCTION IF EXISTS public.get_user_quota(uuid);

CREATE OR REPLACE FUNCTION public.get_user_quota(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  remaining_credits integer,
  total_credits integer,
  credits_used_this_period integer,
  can_generate boolean,
  last_reset_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_quota_record RECORD;
  total_quota INTEGER;
  total_used INTEGER;
  remaining INTEGER;
BEGIN
  -- Get or create user quota record
  SELECT * INTO user_quota_record
  FROM public.user_quotas
  WHERE user_id = p_user_id;
  
  -- If no quota record exists, create one with defaults
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
      p_user_id,
      'standard',
      10,  -- music
      50,  -- qcm
      100, -- chat
      0,
      0,
      0,
      now()
    ) RETURNING * INTO user_quota_record;
  END IF;
  
  -- Calculate totals
  total_quota := user_quota_record.monthly_music_quota + 
                 user_quota_record.monthly_qcm_quota + 
                 user_quota_record.monthly_chat_quota;
  
  total_used := user_quota_record.monthly_music_used + 
                user_quota_record.monthly_qcm_used + 
                user_quota_record.monthly_chat_used;
  
  remaining := GREATEST(total_quota - total_used, 0);
  
  -- Return the complete quota information
  RETURN QUERY SELECT 
    remaining,
    total_quota,
    total_used,
    (remaining > 0) as can_generate,
    user_quota_record.quota_reset_date;
END;
$$;