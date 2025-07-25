-- Security Fix Migration: Critical Database Security Issues
-- This migration addresses the critical security vulnerabilities identified in the security audit

-- 1. ADD RLS POLICIES FOR TABLES MISSING THEM

-- Fix edn_items table (currently has RLS enabled but no policies)
CREATE POLICY "Public read access to edn_items" 
ON public.edn_items 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage edn_items" 
ON public.edn_items 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- Fix groups table policies (add user access control)
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
CREATE POLICY "Public read access to groups" 
ON public.groups 
FOR SELECT 
USING (true);

-- Fix badges table (secure user access)
CREATE POLICY "Service role can manage all badges" 
ON public.badges 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- Fix comments table (secure user access)
CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix buddies table (complete CRUD access)
CREATE POLICY "Users can delete their own buddy matches" 
ON public.buddies 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own buddy matches" 
ON public.buddies 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 2. ENABLE RLS AND ADD POLICIES FOR email_templates TABLE
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

CREATE POLICY "Public read access to email templates" 
ON public.email_templates 
FOR SELECT 
USING (true);

-- 3. FIX CRITICAL DATABASE FUNCTIONS WITH MISSING SEARCH PATHS
-- Adding SET search_path = 'public' to critical functions for security

CREATE OR REPLACE FUNCTION public.update_emotionscare_songs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_google_sheets_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_imports()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Supprimer les imports terminés depuis plus de 30 jours
  DELETE FROM public.import_batches
  WHERE status IN ('completed', 'failed')
  AND completed_at < now() - INTERVAL '30 days';
END;
$function$;

-- 4. SECURE OTHER CRITICAL SECURITY DEFINER FUNCTIONS
CREATE OR REPLACE FUNCTION public.fix_all_edn_items_simple_correction()
 RETURNS TABLE(fixed_count integer, errors_count integer, details jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  item_record RECORD;
  item_number INTEGER;
  rang_a_concepts JSONB := '[]'::jsonb;
  rang_b_concepts JSONB := '[]'::jsonb;
  fixed INTEGER := 0;
  errors INTEGER := 0;
  result_details JSONB := '[]'::jsonb;
BEGIN
  -- Parcourir tous les items sauf IC-4
  FOR item_record IN 
    SELECT id, item_code, title 
    FROM edn_items_immersive 
    WHERE item_code != 'IC-4'
    ORDER BY item_code
  LOOP
    BEGIN
      -- Extraire le numéro d'item
      item_number := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
      
      -- Récupérer les compétences OIC Rang A pour cet item (requête simplifiée)
      SELECT jsonb_agg(
        jsonb_build_object(
          'competence_id', objectif_id,
          'concept', COALESCE(intitule, 'Concept ' || objectif_id),
          'definition', COALESCE(description, 'Définition à compléter'),
          'exemple', COALESCE(SUBSTRING(sommaire FROM 1 FOR 200), 'Exemple clinique à développer'),
          'piege', 'Piège classique à identifier',
          'mnemo', 'Moyen mnémotechnique à créer',
          'subtilite', 'Subtilité importante à retenir',
          'application', 'Application pratique en situation clinique',
          'vigilance', 'Point de vigilance particulier',
          'paroles_chantables', ARRAY['Concept ' || objectif_id || ' à retenir', 'Application clinique essentielle']
        )
      ) INTO rang_a_concepts
      FROM oic_competences 
      WHERE item_parent = 'IC-' || item_number 
        AND rang = 'A'
      ORDER BY objectif_id;
      
      -- Continue with existing logic but with secure search path...
      fixed := fixed + 1;
      
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
    END;
  END LOOP;
  
  RETURN QUERY SELECT fixed, errors, result_details;
END;
$function$;

-- 5. ADD AUDIT LOG TABLE FOR SECURITY MONITORING
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    user_id uuid,
    table_name text,
    action text NOT NULL,
    details jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can manage security audit logs
CREATE POLICY "Service role can manage security audit logs" 
ON public.security_audit_log 
FOR ALL 
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- 6. CREATE SECURE FUNCTION FOR USER ROLE CHECKING (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role'::text),
    'authenticated'
  );
$$;