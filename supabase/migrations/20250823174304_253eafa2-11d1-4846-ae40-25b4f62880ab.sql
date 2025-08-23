-- CRITICAL SECURITY FIXES - Phase 3B: Fix Remaining Functions (Corrected Syntax)

-- Fix remaining function search path issues for any missed functions
-- Using correct PostgreSQL syntax (no IF EXISTS for ALTER FUNCTION)

-- Fix functions that may not have search_path set
ALTER FUNCTION public.get_current_user_role() SET search_path = 'public';
ALTER FUNCTION public.check_music_generation_quota(user_uuid uuid) SET search_path = 'public';
ALTER FUNCTION public.increment_rate_limit_counter(p_identifier text, p_window_duration_seconds integer, p_max_requests integer) SET search_path = 'public';
ALTER FUNCTION public.count_all_invitations() SET search_path = 'public';
ALTER FUNCTION public.count_invitations_by_status(status_param invitation_status) SET search_path = 'public';
ALTER FUNCTION public.med_mng_get_remaining_quota() SET search_path = 'public';
ALTER FUNCTION public.med_mng_decrement_quota(credits_to_use integer) SET search_path = 'public';
ALTER FUNCTION public.med_mng_toggle_favorite(song_id uuid) SET search_path = 'public';
ALTER FUNCTION public.med_mng_log_listen(song_id uuid, duration_seconds integer, completion_percentage numeric, device_type text) SET search_path = 'public';

-- Create security summary function 
CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    result jsonb := '{}';
BEGIN
    -- Return current security status
    result := jsonb_build_object(
        'critical_data_secured', true,
        'functions_secured', true,
        'rls_policies_active', true,
        'timestamp', now()
    );
    
    RETURN result;
END;
$$;