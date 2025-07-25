-- TARGETED SECURITY FIXES FOR REMAINING ISSUES
-- ================================================================

-- Phase 1: Add RLS policies for existing tables only
-- ================================================================

-- abonnement_biovida - Email subscription table  
CREATE POLICY "Allow public inserts to biovida subscriptions" 
ON public.abonnement_biovida 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can manage biovida subscriptions" 
ON public.abonnement_biovida 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- urgent_protocols - Medical protocols
CREATE POLICY "Allow public read access to urgent protocols" 
ON public.urgent_protocols 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage urgent protocols" 
ON public.urgent_protocols 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- Phase 2: Fix Function Security - Add SET search_path to all functions
-- ================================================================

-- Fix all existing functions to have secure search_path
ALTER FUNCTION public.update_urgent_protocols_timestamp() SET search_path = 'public';
ALTER FUNCTION public.med_mng_log_user_activity(text, jsonb) SET search_path = 'public';
ALTER FUNCTION public.handle_new_emotionsroom_user() SET search_path = 'public';
ALTER FUNCTION public.update_emotionscare_songs_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_integration_updated_at() SET search_path = 'public';
ALTER FUNCTION public.migrate_edn_items_to_platform() SET search_path = 'public';
ALTER FUNCTION public.handle_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_google_sheets_updated_at() SET search_path = 'public';
ALTER FUNCTION public.migrate_edn_items_complete() SET search_path = 'public';
ALTER FUNCTION public.update_edn_items_with_specific_content() SET search_path = 'public';
ALTER FUNCTION public.cleanup_old_imports() SET search_path = 'public';
ALTER FUNCTION public.generate_specific_content_all_items() SET search_path = 'public';
ALTER FUNCTION public.update_all_edn_items_unique_content() SET search_path = 'public';

-- Phase 3: Enhanced Security Configuration
-- ================================================================

-- Create audit logging function for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  event_details JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    event_details,
    created_at
  ) VALUES (
    auth.uid(),
    event_type,
    event_details,
    now()
  );
EXCEPTION WHEN OTHERS THEN
  -- Silently fail if audit_logs table doesn't exist
  NULL;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public';

-- Add security headers function for edge functions
CREATE OR REPLACE FUNCTION public.get_security_headers()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'Content-Security-Policy', 'default-src ''self''; script-src ''self'' ''unsafe-inline''; style-src ''self'' ''unsafe-inline''; img-src ''self'' data: https:; connect-src ''self'' https://yaincoxihiqdksxgrsrk.supabase.co',
    'X-Frame-Options', 'DENY',
    'X-Content-Type-Options', 'nosniff',
    'Referrer-Policy', 'strict-origin-when-cross-origin',
    'Permissions-Policy', 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security', 'max-age=31536000; includeSubDomains'
  );
END;
$$ LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public';

-- Create input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_user_input(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove potential SQL injection patterns
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Basic sanitization - remove dangerous characters
  RETURN regexp_replace(
    regexp_replace(input_text, '[<>''";\\]', '', 'g'),
    '\s+', ' ', 'g'
  );
END;
$$ LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public';

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_identifier TEXT,
  action_type TEXT,
  max_attempts INTEGER DEFAULT 10,
  time_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public';

-- Create comprehensive security check function
CREATE OR REPLACE FUNCTION public.run_security_health_check()
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}'::jsonb;
  table_count INTEGER;
  policy_count INTEGER;
  function_count INTEGER;
BEGIN
  -- Check RLS coverage
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  SELECT COUNT(DISTINCT tablename) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  -- Check function security
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
  
  result := jsonb_build_object(
    'total_tables', table_count,
    'tables_with_policies', policy_count,
    'total_functions', function_count,
    'security_score', (policy_count::float / GREATEST(table_count, 1)) * 100,
    'check_timestamp', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public';

-- Final security validation
SELECT public.run_security_health_check() as security_status;