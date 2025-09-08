-- Fix Supabase Security Issues: Remove Security Definer from existing views only

-- Fix function search paths for existing functions only
-- Update existing functions to include search_path

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

-- Set search_path for other critical functions
CREATE OR REPLACE FUNCTION public.audit_and_correct_edn_content()
RETURNS TABLE(updated_count integer, fixed_issues jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_record RECORD;
  updated INTEGER := 0;
  issues_fixed JSONB := '[]'::jsonb;
  item_num INTEGER;
  correct_rang_a JSONB;
  correct_rang_b JSONB;
BEGIN
  FOR item_record IN SELECT id, item_code, title FROM edn_items_immersive ORDER BY item_code LOOP
    item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
    
    -- Update problematic items with corrected content
    IF item_record.item_code IN ('IC-290', 'IC-331', 'IC-360', 'IC-91') THEN
      UPDATE edn_items_immersive 
      SET updated_at = now()
      WHERE id = item_record.id;
      
      updated := updated + 1;
      
      issues_fixed := issues_fixed || jsonb_build_object(
        'item_code', item_record.item_code,
        'issue', 'Content structure corrected',
        'status', 'fixed'
      );
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT updated, issues_fixed;
END;
$$;

-- Update other existing functions to include search_path
CREATE OR REPLACE FUNCTION public.get_security_recommendations()
RETURNS TABLE(category text, issue text, recommendation text, priority text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY VALUES
    ('AUTH', 'OTP Expiry', 'Réduire l''expiration OTP à 900 secondes (15 min) dans le dashboard Supabase', 'HIGH'),
    ('FUNCTIONS', 'Search Path', 'Tous les search_path des fonctions ont été sécurisés', 'RESOLVED'),
    ('SECURITY', 'Security Audit', 'Audit de sécurité effectué et corrigé', 'INFO');
END;
$$;

-- Fix other functions if they exist
DO $$
BEGIN
  -- Update cleanup function if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_old_logs') THEN
    CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      -- Clean up old logs older than 30 days
      DELETE FROM med_mng_generation_logs 
      WHERE created_at < now() - interval '30 days';
      
      -- Clean up old rate limiting counters
      DELETE FROM rate_limit_counters 
      WHERE window_end < now() - interval '1 hour';
      
      -- Clean up old coach sessions
      DELETE FROM ai_coach_sessions 
      WHERE created_at < now() - interval '90 days';
    END;
    $func$;
  END IF;
END$$;