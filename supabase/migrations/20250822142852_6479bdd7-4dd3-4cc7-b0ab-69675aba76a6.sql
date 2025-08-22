-- Create rate_limit_counters table for distributed rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_counters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address, user ID, or other identifier
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  max_requests INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_counters_identifier_window 
ON public.rate_limit_counters(identifier, window_start, window_end);

-- Create index for cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limit_counters_window_end 
ON public.rate_limit_counters(window_end);

-- Enable RLS
ALTER TABLE public.rate_limit_counters ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage rate limit counters
CREATE POLICY "Service role can manage rate limit counters"
ON public.rate_limit_counters
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to increment rate limit counter
CREATE OR REPLACE FUNCTION public.increment_rate_limit_counter(
  p_identifier TEXT,
  p_window_duration_seconds INTEGER,
  p_max_requests INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  window_start_time TIMESTAMP WITH TIME ZONE;
  window_end_time TIMESTAMP WITH TIME ZONE;
  current_count INTEGER;
  counter_record RECORD;
BEGIN
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

-- Function to get current rate limit status
CREATE OR REPLACE FUNCTION public.get_rate_limit_status(
  p_identifier TEXT,
  p_window_duration_seconds INTEGER,
  p_max_requests INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Function to cleanup expired rate limit counters
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limit_counters()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.rate_limit_counters
  WHERE window_end < now() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;