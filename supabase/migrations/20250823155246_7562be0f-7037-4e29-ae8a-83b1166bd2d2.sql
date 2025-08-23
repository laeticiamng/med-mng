-- Fix Security Definer Functions - Convert user-facing functions to SECURITY INVOKER where appropriate
-- and add proper permission checks to maintain security

-- 1. Fix accept_invitation function - should use SECURITY INVOKER with proper checks
CREATE OR REPLACE FUNCTION public.accept_invitation(token_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record RECORD;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Find and validate invitation
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE token = token_param
    AND status = 'pending'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Update invitation
  UPDATE public.invitations
  SET 
    status = 'accepted',
    accepted_by = current_user_id,
    accepted_at = now()
  WHERE token = token_param;
  
  RETURN true;
END;
$$;

-- 2. Fix check_music_generation_quota - add user validation
CREATE OR REPLACE FUNCTION public.check_music_generation_quota(user_uuid uuid)
RETURNS TABLE(can_generate boolean, current_usage integer, quota_limit integer, plan_name text)
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_month TEXT := to_char(now(), 'YYYY-MM');
  user_plan RECORD;
  usage_record RECORD;
  current_user_id UUID;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Security check: users can only check their own quota or service role can check any
  IF current_user_id != user_uuid AND (auth.jwt() ->> 'role') != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: can only check own quota';
  END IF;
  
  -- Get user's current subscription
  SELECT * INTO user_plan FROM public.get_user_subscription(user_uuid);
  
  -- Get or create usage record for current month
  SELECT * INTO usage_record 
  FROM public.music_generation_usage 
  WHERE user_id = user_uuid AND month_year = current_month;
  
  -- Create usage record if it doesn't exist
  IF usage_record IS NULL THEN
    INSERT INTO public.music_generation_usage (user_id, month_year, generated_count, quota_limit)
    VALUES (user_uuid, current_month, 0, user_plan.monthly_quota)
    RETURNING * INTO usage_record;
  END IF;
  
  -- Check if user can generate more
  RETURN QUERY SELECT 
    (usage_record.generated_count < usage_record.quota_limit) as can_generate,
    usage_record.generated_count as current_usage,
    usage_record.quota_limit,
    user_plan.plan_name;
END;
$$;

-- 3. Fix rate limiting function - add user validation
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_identifier text, 
  action_type text, 
  max_attempts integer DEFAULT 10, 
  time_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
  attempt_count INTEGER;
  window_start TIMESTAMP;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- For non-service roles, ensure they can only check their own identifier
  IF (auth.jwt() ->> 'role') != 'service_role' THEN
    IF current_user_id IS NULL THEN
      RAISE EXCEPTION 'Authentication required for rate limit check';
    END IF;
    
    -- Ensure user can only check rates for their own user_id
    IF user_identifier != current_user_id::text THEN
      RAISE EXCEPTION 'Unauthorized: can only check own rate limits';
    END IF;
  END IF;
  
  window_start := now() - (time_window_minutes || ' minutes')::interval;
  
  SELECT COUNT(*)
  INTO attempt_count
  FROM public.rate_limit_logs
  WHERE identifier = user_identifier
    AND action = action_type
    AND created_at >= window_start;
  
  RETURN attempt_count < max_attempts;
END;
$$;

-- 4. Create a secure wrapper for increment_rate_limit_counter
CREATE OR REPLACE FUNCTION public.increment_rate_limit_counter(
  p_identifier text, 
  p_window_duration_seconds integer, 
  p_max_requests integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  window_start_time TIMESTAMP WITH TIME ZONE;
  window_end_time TIMESTAMP WITH TIME ZONE;
  current_count INTEGER;
  counter_record RECORD;
  current_user_id UUID;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- For non-service roles, ensure they can only increment their own counter
  IF (auth.jwt() ->> 'role') != 'service_role' THEN
    IF current_user_id IS NULL THEN
      RAISE EXCEPTION 'Authentication required for rate limiting';
    END IF;
    
    -- Ensure user can only increment rates for their own user_id
    IF p_identifier != current_user_id::text THEN
      RAISE EXCEPTION 'Unauthorized: can only increment own rate limit counter';
    END IF;
  END IF;
  
  -- Calculate current window
  window_start_time := date_trunc('minute', now()) + 
    (EXTRACT(minute FROM now())::integer / (p_window_duration_seconds / 60)) * 
    INTERVAL '1 minute' * (p_window_duration_seconds / 60);
  window_end_time := window_start_time + (p_window_duration_seconds || ' seconds')::INTERVAL;
  
  -- Try to get existing counter for this window
  SELECT * INTO counter_record
  FROM public.rate_limit_counters
  WHERE identifier = p_identifier
    AND window_start = window_start_time
    AND window_end = window_end_time;
  
  IF FOUND THEN
    -- Update existing counter
    UPDATE public.rate_limit_counters
    SET request_count = request_count + 1,
        updated_at = now()
    WHERE id = counter_record.id;
    
    current_count := counter_record.request_count + 1;
  ELSE
    -- Create new counter
    INSERT INTO public.rate_limit_counters (
      identifier,
      window_start,
      window_end,
      request_count,
      max_requests
    ) VALUES (
      p_identifier,
      window_start_time,
      window_end_time,
      1,
      p_max_requests
    );
    
    current_count := 1;
  END IF;
  
  -- Return result
  RETURN jsonb_build_object(
    'identifier', p_identifier,
    'current_count', current_count,
    'max_requests', p_max_requests,
    'window_start', window_start_time,
    'window_end', window_end_time,
    'rate_limited', current_count > p_max_requests,
    'remaining_requests', GREATEST(0, p_max_requests - current_count),
    'reset_time', window_end_time
  );
END;
$$;

-- 5. Add comments to remaining SECURITY DEFINER functions that legitimately need elevated privileges
COMMENT ON FUNCTION public.audit_and_correct_edn_content() IS 
'SECURITY DEFINER justified: Administrative function for data correction that needs to bypass RLS';

COMMENT ON FUNCTION public.cleanup_duplicates() IS 
'SECURITY DEFINER justified: Administrative cleanup function that needs elevated privileges';

COMMENT ON FUNCTION public.backup_critical_data() IS 
'SECURITY DEFINER justified: Backup function that needs to access all data regardless of RLS';

COMMENT ON FUNCTION public.auto_security_maintenance() IS 
'SECURITY DEFINER justified: Automated security maintenance function run by system cron';

-- 6. Create audit log entry for this security fix (with correct severity value)
INSERT INTO public.security_audit_log (
  audit_type,
  finding_type,
  severity,
  description,
  location,
  action_taken,
  metadata
) VALUES (
  'SECURITY_FIX',
  'SECURITY_DEFINER_FIXED',
  'LOW',  -- Using valid severity value
  'Converted user-facing SECURITY DEFINER functions to SECURITY INVOKER with proper permission checks',
  'Database functions',
  'MIGRATION_APPLIED',
  jsonb_build_object(
    'functions_fixed', jsonb_build_array(
      'accept_invitation',
      'check_music_generation_quota', 
      'check_rate_limit',
      'increment_rate_limit_counter'
    ),
    'security_improvement', 'Added user authentication and authorization checks',
    'migration_date', now()
  )
);