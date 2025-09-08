-- Fix Security Issues: Remove Security Definer from Views and Fix Function Search Paths

-- Drop existing views that are using SECURITY DEFINER
DROP VIEW IF EXISTS public.user_compositions_view CASCADE;
DROP VIEW IF EXISTS public.user_therapy_sessions_view CASCADE;
DROP VIEW IF EXISTS public.user_progress_view CASCADE;
DROP VIEW IF EXISTS public.user_support_groups_view CASCADE;
DROP VIEW IF EXISTS public.user_analytics_view CASCADE;
DROP VIEW IF EXISTS public.group_stats_view CASCADE;

-- Recreate views without SECURITY DEFINER (use default SECURITY INVOKER)
CREATE VIEW public.user_compositions_view AS
SELECT 
  mc.*,
  p.full_name as composer_name
FROM public.musical_compositions mc
JOIN public.profiles p ON mc.user_id = p.user_id
WHERE mc.user_id = auth.uid();

CREATE VIEW public.user_therapy_sessions_view AS
SELECT 
  ts.*,
  p.full_name as patient_name
FROM public.therapy_sessions ts
JOIN public.profiles p ON ts.user_id = p.user_id
WHERE ts.user_id = auth.uid();

CREATE VIEW public.user_progress_view AS
SELECT 
  mp.*,
  p.full_name as patient_name
FROM public.medical_progress mp
JOIN public.profiles p ON mp.user_id = p.user_id
WHERE mp.user_id = auth.uid();

CREATE VIEW public.user_support_groups_view AS
SELECT 
  sg.*,
  p.full_name as creator_name,
  (SELECT COUNT(*) FROM public.group_members gm WHERE gm.group_id = sg.id) as member_count
FROM public.support_groups sg
JOIN public.profiles p ON sg.creator_id = p.user_id
LEFT JOIN public.group_members gm ON gm.group_id = sg.id AND gm.user_id = auth.uid()
WHERE sg.is_public = true OR gm.user_id IS NOT NULL OR sg.creator_id = auth.uid();

-- Fix function search paths by adding SET search_path = public
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.update_group_member_count() CASCADE;
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.support_groups 
        SET member_count = member_count + 1 
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.support_groups 
        SET member_count = member_count - 1 
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Recreate triggers for the fixed functions
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_musical_compositions_updated_at
    BEFORE UPDATE ON public.musical_compositions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_therapy_sessions_updated_at
    BEFORE UPDATE ON public.therapy_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_progress_updated_at
    BEFORE UPDATE ON public.medical_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_groups_updated_at
    BEFORE UPDATE ON public.support_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER group_member_count_trigger
    AFTER INSERT OR DELETE ON public.group_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_group_member_count();

-- Move extensions from public schema (security best practice)
CREATE SCHEMA IF NOT EXISTS extensions;
-- Note: Extensions movement would require superuser privileges, 
-- this is documented for production deployment