-- =====================================================
-- 🔐 MIGRATION SÉCURITÉ - DROP + RECREATE
-- =====================================================

-- Drop existing functions with conflicting signatures
DROP FUNCTION IF EXISTS public.get_rls_policies();
DROP FUNCTION IF EXISTS public.get_rls_table_summaries();
DROP FUNCTION IF EXISTS public.list_rls_policies();

-- 1. Recréer get_rls_policies avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.get_rls_policies()
RETURNS TABLE (
  table_schema text,
  table_name text,
  policy_name text,
  policy_cmd text,
  policy_roles text[],
  policy_qual text,
  policy_with_check text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    n.nspname::text AS table_schema,
    c.relname::text AS table_name,
    pol.polname::text AS policy_name,
    CASE pol.polcmd 
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END AS policy_cmd,
    pol.polroles::regrole[]::text[] AS policy_roles,
    pg_get_expr(pol.polqual, pol.polrelid)::text AS policy_qual,
    pg_get_expr(pol.polwithcheck, pol.polrelid)::text AS policy_with_check
  FROM pg_policy pol
  JOIN pg_class c ON c.oid = pol.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  ORDER BY n.nspname, c.relname, pol.polname;
$$;

-- 2. Recréer get_rls_table_summaries
CREATE OR REPLACE FUNCTION public.get_rls_table_summaries()
RETURNS TABLE (
  table_name text,
  rls_enabled boolean,
  policy_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.relname::text AS table_name,
    c.relrowsecurity AS rls_enabled,
    COUNT(pol.polname) AS policy_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname;
$$;

-- 3. Créer list_rls_policies pour audit script
CREATE OR REPLACE FUNCTION public.list_rls_policies()
RETURNS TABLE (
  schema_name text,
  table_name text,
  policy_name text,
  command text,
  roles text[],
  using_expr text,
  with_check_expr text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    n.nspname::text,
    c.relname::text,
    pol.polname::text,
    CASE pol.polcmd 
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END,
    pol.polroles::regrole[]::text[],
    pg_get_expr(pol.polqual, pol.polrelid)::text,
    pg_get_expr(pol.polwithcheck, pol.polrelid)::text
  FROM pg_policy pol
  JOIN pg_class c ON c.oid = pol.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  ORDER BY n.nspname, c.relname;
$$;

-- 4. Sécuriser has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role::text = _role
  );
$$;

-- 5. Sécuriser handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 6. Sécuriser update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;