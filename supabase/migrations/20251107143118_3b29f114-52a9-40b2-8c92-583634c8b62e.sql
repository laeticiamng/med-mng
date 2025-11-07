-- Create helper functions for RLS documentation

-- Function to get all RLS policies
CREATE OR REPLACE FUNCTION public.get_rls_policies()
RETURNS TABLE(
  tablename text,
  policyname text,
  cmd text,
  roles text[],
  qual text,
  with_check text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.tablename::text,
    p.policyname::text,
    p.cmd::text,
    p.roles::text[],
    p.qual::text,
    p.with_check::text
  FROM pg_policies p
  WHERE p.schemaname = 'public'
  ORDER BY p.tablename, p.policyname;
END;
$$;

-- Function to get table summaries with policy counts
CREATE OR REPLACE FUNCTION public.get_rls_table_summaries()
RETURNS TABLE(
  tablename text,
  policy_count bigint,
  commands text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.tablename::text,
    COUNT(*)::bigint as policy_count,
    array_agg(DISTINCT p.cmd::text) as commands
  FROM pg_policies p
  WHERE p.schemaname = 'public'
  GROUP BY p.tablename
  ORDER BY p.tablename;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_rls_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rls_table_summaries() TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.get_rls_policies() IS 'Returns all RLS policies for documentation purposes';
COMMENT ON FUNCTION public.get_rls_table_summaries() IS 'Returns table summaries with policy counts for RLS documentation';
