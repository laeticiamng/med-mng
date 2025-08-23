-- Remove SECURITY DEFINER from additional functions that don't require elevated privileges
-- Focus on user-scoped and validation functions

-- Simple validation functions don't need SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.calculate_completeness_score(item_data jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  score INTEGER := 0;
  total_fields INTEGER := 8;
BEGIN
  -- Check each required field and add to score
  IF item_data ? 'title' AND item_data->>'title' != '' THEN
    score := score + 1;
  END IF;
  
  IF item_data ? 'subtitle' AND item_data->>'subtitle' != '' THEN
    score := score + 1;
  END IF;
  
  IF item_data ? 'tableau_rang_a' AND item_data->'tableau_rang_a' != 'null'::jsonb THEN
    score := score + 1;
  END IF;
  
  IF item_data ? 'tableau_rang_b' AND item_data->'tableau_rang_b' != 'null'::jsonb THEN
    score := score + 1;
  END IF;
  
  IF item_data ? 'paroles_musicales' AND jsonb_array_length(COALESCE(item_data->'paroles_musicales', '[]'::jsonb)) > 0 THEN
    score := score + 1;
  END IF;
  
  IF item_data ? 'quiz_questions' AND item_data->'quiz_questions' != 'null'::jsonb THEN
    score := score + 1;
  END IF;
  
  IF item_data ? 'scene_immersive' AND item_data->'scene_immersive' != 'null'::jsonb THEN
    score := score + 1;
  END IF;
  
  IF item_data ? 'interaction_config' AND item_data->'interaction_config' != 'null'::jsonb THEN
    score := score + 1;
  END IF;
  
  -- Return percentage
  RETURN (score * 100) / total_fields;
END;
$function$;

-- User-scoped functions that use auth.uid() don't need SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_user_session(session_data jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  session_id uuid;
BEGIN
  INSERT INTO public.user_sessions (
    user_id,
    session_data,
    is_active
  ) VALUES (
    auth.uid(),
    session_data,
    true
  ) RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$function$;

-- Simple counting functions don't need SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.count_all_invitations()
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM public.invitations;
  
  RETURN count_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.count_invitations_by_status(status_param invitation_status)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM public.invitations
  WHERE status = status_param;
  
  RETURN count_result;
END;
$function$;

-- Keep essential administrative functions with SECURITY DEFINER but ensure they're properly secured
-- Update accept_invitation to ensure it's secure but keep SECURITY DEFINER as it needs to modify invitation status
CREATE OR REPLACE FUNCTION public.accept_invitation(token_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record public.invitations;
BEGIN
  -- Validate input
  IF token_param IS NULL OR LENGTH(token_param) < 10 THEN
    RETURN false;
  END IF;
  
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE token = token_param;
  
  IF invitation_record IS NULL OR 
     invitation_record.status != 'pending' OR 
     invitation_record.expires_at < now() THEN
    RETURN false;
  END IF;
  
  UPDATE public.invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = invitation_record.id;
  
  RETURN true;
END;
$function$;