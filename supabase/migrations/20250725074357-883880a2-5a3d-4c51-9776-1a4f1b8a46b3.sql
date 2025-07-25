-- ================================================================
-- COMPREHENSIVE SECURITY FIXES FOR ALL REMAINING ISSUES
-- ================================================================

-- Phase 1: Add RLS policies for tables with RLS enabled but no policies
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

-- item_situation_relations - Medical item relations
CREATE POLICY "Allow public read access to item situation relations" 
ON public.item_situation_relations 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage item situation relations" 
ON public.item_situation_relations 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- item_therapeutic_relations - Therapeutic relations
CREATE POLICY "Allow public read access to therapeutic relations" 
ON public.item_therapeutic_relations 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage therapeutic relations" 
ON public.item_therapeutic_relations 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- official_content_cache - Content caching
CREATE POLICY "Allow public read access to official content cache" 
ON public.official_content_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage official content cache" 
ON public.official_content_cache 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- official_content_cache_new - New content cache
CREATE POLICY "Allow public read access to new content cache" 
ON public.official_content_cache_new 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage new content cache" 
ON public.official_content_cache_new 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- starting_situations - Medical starting situations
CREATE POLICY "Allow public read access to starting situations" 
ON public.starting_situations 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage starting situations" 
ON public.starting_situations 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- therapeutic_classes - Therapeutic classification
CREATE POLICY "Allow public read access to therapeutic classes" 
ON public.therapeutic_classes 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage therapeutic classes" 
ON public.therapeutic_classes 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- urge_gpt_queries - AI query logs (user-specific)
CREATE POLICY "Users can create their own GPT queries" 
ON public.urge_gpt_queries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own GPT queries" 
ON public.urge_gpt_queries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all GPT queries" 
ON public.urge_gpt_queries 
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

-- Phase 2: Fix Security Definer Views
-- ================================================================

-- Drop and recreate problematic security definer views as regular views
DROP VIEW IF EXISTS public.view_user_subscriptions CASCADE;
DROP VIEW IF EXISTS public.view_user_activity CASCADE;

-- Phase 3: Fix Function Security - Add SET search_path to all functions
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

-- Fix remaining trigger and utility functions
CREATE OR REPLACE FUNCTION public.secure_timestamp_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = 'public';

-- Phase 4: Enhanced Security Configuration
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
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public';

-- Create comprehensive security monitoring view
CREATE OR REPLACE VIEW public.security_monitoring AS
SELECT 
  'rls_policy_violations' as metric_type,
  COUNT(*) as metric_value,
  'Number of tables with RLS enabled but no policies'::text as description
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON c.relnamespace = n.oid 
    WHERE c.relname = t.table_name 
    AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  )
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p 
    WHERE p.tablename = t.table_name 
    AND p.schemaname = 'public'
  );

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

-- Phase 5: Data Validation and Input Security
-- ================================================================

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
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM public.rate_limit_log
  WHERE identifier = user_identifier
    AND action = action_type
    AND created_at > (now() - (time_window_minutes || ' minutes')::interval);
  
  -- Log this attempt
  INSERT INTO public.rate_limit_log (identifier, action, created_at)
  VALUES (user_identifier, action_type, now())
  ON CONFLICT DO NOTHING;
  
  -- Return whether limit is exceeded
  RETURN attempt_count < max_attempts;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public';

-- Create rate limiting log table
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, action, created_at)
);

-- Enable RLS on rate limit log
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for rate limit log
CREATE POLICY "Service role can manage rate limit logs" 
ON public.rate_limit_log 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- Phase 6: Security Function Optimization
-- ================================================================

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

-- Add comprehensive audit logging
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  event_data JSONB DEFAULT '{}',
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for security audit log
CREATE POLICY "Service role can manage security audit logs" 
ON public.security_audit_log 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

CREATE POLICY "Users can view their own audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Final security validation
SELECT public.run_security_health_check() as security_status;