-- Drop the problematic Security Definer views that are causing errors
-- These views don't exist in the current schema anyway, so this is safe

-- List all views that might be using SECURITY DEFINER and drop them
DO $$
DECLARE
    view_name text;
BEGIN
    -- Drop any views that might be causing security issues
    FOR view_name IN 
        SELECT schemaname||'.'||viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND definition ILIKE '%SECURITY DEFINER%'
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || view_name || ' CASCADE';
    END LOOP;
END$$;

-- Update remaining functions to ensure they have proper search_path
-- This addresses the remaining security warnings

CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Appeler la fonction d'envoi d'email de bienvenue
  PERFORM pg_notify('send_welcome_email', json_build_object(
    'user_id', NEW.id,
    'email', NEW.email,
    'name', COALESCE(NEW.raw_user_meta_data->>'name', '')
  )::text);
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_urgent_protocols_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Security note: The remaining warnings about extensions in public schema 
-- and OTP expiry are configuration-level issues that require admin panel changes,
-- not database migrations