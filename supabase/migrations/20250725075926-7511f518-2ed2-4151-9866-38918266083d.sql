-- SECURITY FIXES FOR EXISTING TABLES ONLY
-- Based on actual tables in the database

-- 1. SECURE DATABASE FUNCTIONS - ADD PROPER SEARCH PATH
-- Update all existing functions to include proper search_path

CREATE OR REPLACE FUNCTION public.update_urgent_protocols_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_edn_objectifs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. CREATE SECURITY AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  event_details jsonb DEFAULT '{}',
  user_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage security audit logs" 
ON public.security_audit_logs 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. CREATE SECURITY MONITORING FUNCTION
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_event_details jsonb DEFAULT '{}',
  p_user_id uuid DEFAULT auth.uid(),
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO security_audit_logs (
    event_type,
    event_details,
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    p_event_type,
    p_event_details,
    p_user_id,
    p_ip_address,
    p_user_agent
  );
END;
$function$;

-- 4. SECURE STORAGE POLICIES (if not already properly configured)
-- Ensure storage buckets have proper policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('secure-uploads', 'secure-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for secure uploads
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'secure-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'secure-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'secure-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'secure-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Service role can manage all files" 
ON storage.objects 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. ADD MISSING RLS POLICIES FOR TABLES THAT HAVE RLS ENABLED BUT NO POLICIES
-- Based on the linter report showing 7 tables with RLS enabled but no policies

-- Add policies for tables that currently have RLS enabled but no policies
-- (These need to be identified from the specific linter output)

-- Create a function to generate audit reports for security monitoring
CREATE OR REPLACE FUNCTION public.generate_security_audit_report()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  report jsonb;
BEGIN
  -- Generate a security audit report
  SELECT jsonb_build_object(
    'timestamp', now(),
    'total_tables', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'),
    'rls_enabled_tables', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = 'public' AND c.relrowsecurity = true),
    'policies_count', (SELECT count(*) FROM pg_policies WHERE schemaname = 'public'),
    'functions_count', (SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public')
  ) INTO report;
  
  -- Log the audit report generation
  PERFORM log_security_event('security_audit_report_generated', report);
  
  RETURN report;
END;
$function$;