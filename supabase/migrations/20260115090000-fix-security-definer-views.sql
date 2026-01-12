-- Identify views defined with SECURITY DEFINER via pg_views
-- Recreate them using SECURITY INVOKER to preserve RLS behavior
DO $$
DECLARE
  view_record RECORD;
  view_definition TEXT;
BEGIN
  FOR view_record IN
    SELECT schemaname, viewname
    FROM pg_views
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      AND definition ILIKE '%security definer%'
  LOOP
    RAISE NOTICE 'Recreating view %.% as SECURITY INVOKER', view_record.schemaname, view_record.viewname;

    view_definition := pg_get_viewdef(format('%I.%I', view_record.schemaname, view_record.viewname), true);

    EXECUTE format(
      'CREATE OR REPLACE VIEW %I.%I WITH (security_invoker = true) AS %s',
      view_record.schemaname,
      view_record.viewname,
      view_definition
    );
  END LOOP;
END $$;

-- Verify no SECURITY DEFINER views remain
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO remaining_count
  FROM pg_views
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    AND definition ILIKE '%security definer%';

  IF remaining_count > 0 THEN
    RAISE EXCEPTION 'Remaining SECURITY DEFINER views detected: %', remaining_count;
  END IF;
END $$;
