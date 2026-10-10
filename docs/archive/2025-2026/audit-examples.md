# Supabase Audit & Logging Examples

This document provides minimal SQL snippets to help administrators audit Row Level Security (RLS) policies and log privileged access.

## Audit existing policies

List all policies defined on tables in the `public` schema:

```sql
SELECT table_schema,
       table_name,
       policy_name,
       command,
       using_clause
FROM pg_policies
WHERE schemaname = 'public';
```

Identify tables that have RLS disabled:

```sql
SELECT n.nspname AS schema,
       c.relname  AS table,
       c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = false;
```

These queries can be used in a scheduled job or script (see `scripts/auditRls.ts`) to ensure every critical table is protected.

## Log privileged operations

Create a dedicated table to track administrative or service role actions:

```sql
CREATE TABLE IF NOT EXISTS public.admin_access_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  text NOT NULL,
  operation   text NOT NULL,
  user_id     uuid,
  executed_at timestamp with time zone DEFAULT now()
);
```

Add a trigger that records any data change performed by a privileged user:

```sql
CREATE OR REPLACE FUNCTION public.log_admin_access()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.jwt() ->> 'role' IN ('service_role', 'authenticated') THEN
    INSERT INTO public.admin_access_logs(table_name, operation, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Attach the trigger on a sensitive table (repeat for each one):

```sql
CREATE TRIGGER log_admin_access_med_mng_items
  AFTER INSERT OR UPDATE OR DELETE ON public.med_mng_items
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_access();
```

These logs allow for auditing service or admin actions for at least three months as required.
