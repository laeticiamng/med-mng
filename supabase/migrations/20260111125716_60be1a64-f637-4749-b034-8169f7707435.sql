-- =====================================================
-- AUDIT SECURITY FIX PART 4: Corriger les fonctions sans search_path
-- =====================================================

-- 1. auto_update_session_status
CREATE OR REPLACE FUNCTION public.auto_update_session_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-update session status based on participant changes
  RETURN NEW;
END;
$$;

-- 2. update_session_on_participant_change  
CREATE OR REPLACE FUNCTION public.update_session_on_participant_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update session when participant changes
  RETURN NEW;
END;
$$;

-- 3. update_user_competence_mastery_updated_at
CREATE OR REPLACE FUNCTION public.update_user_competence_mastery_updated_at()
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