-- Add SET search_path = public to functions flagged by Supabase linter
DO $$
DECLARE
  target_functions text[] := ARRAY[
    'create_unique_slug_edn',
    'get_random_edn_item',
    'get_edn_item_by_code',
    'search_edn_items',
    'get_user_music_tracks'
  ];
  func_record record;
BEGIN
  FOR func_record IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS function_args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY(target_functions)
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public',
      func_record.schema_name,
      func_record.function_name,
      func_record.function_args
    );
  END LOOP;
END $$;
