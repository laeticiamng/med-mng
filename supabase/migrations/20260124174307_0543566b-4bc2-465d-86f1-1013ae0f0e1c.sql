-- Fix SECURITY DEFINER functions without search_path
-- Add SET search_path = 'public' to all security definer functions

CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO admin_changelog (
    table_name,
    record_id,
    action_type,
    admin_user_id,
    old_value,
    new_value
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_item_completeness_score(item_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  score integer := 0;
  item_record record;
BEGIN
  SELECT * INTO item_record FROM edn_items_complete WHERE id = item_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  
  IF item_record.title IS NOT NULL THEN score := score + 20; END IF;
  IF item_record.definition IS NOT NULL THEN score := score + 20; END IF;
  IF item_record.tableau_rang_a IS NOT NULL THEN score := score + 30; END IF;
  IF item_record.tableau_rang_b IS NOT NULL THEN score := score + 30; END IF;
  
  RETURN score;
END;
$$;