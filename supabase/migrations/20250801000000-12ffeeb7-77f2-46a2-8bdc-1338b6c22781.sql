-- Audit & fix RLS policies for sensitive tables

-- Add RLS policies for edn_items_immersive
ALTER TABLE public.edn_items_immersive ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read" ON public.edn_items_immersive;
CREATE POLICY "Public can read EDN items"
  ON public.edn_items_immersive
  FOR SELECT
  USING (true);

-- Service role full access
DROP POLICY IF EXISTS "service role all" ON public.edn_items_immersive;
CREATE POLICY "Service role full access" 
  ON public.edn_items_immersive
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add RLS policies for med_mng_items and related tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['med_mng_items','comic_panels','roman_versions','music_tracks','quiz_questions','audit_logs'])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Service role full access" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Service role full access" ON public.%I FOR ALL USING (auth.jwt() ->> ''role'' = ''service_role'');', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users manage own" ON public.%I;', tbl);
    IF tbl <> 'audit_logs' THEN
      EXECUTE format('CREATE POLICY "Users manage own" ON public.%I FOR ALL USING (auth.uid() = user_id);', tbl);
    END IF;
  END LOOP;
END$$;

-- Secure OIC tables
ALTER TABLE public.oic_competences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oic_extraction_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service role to manage oic_competences" ON public.oic_competences;
CREATE POLICY "Service role manages oic_competences" ON public.oic_competences FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
DROP POLICY IF EXISTS "Allow service role to manage oic_extraction_progress" ON public.oic_extraction_progress;
CREATE POLICY "Service role manages oic_extraction_progress" ON public.oic_extraction_progress FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Helper function to list current RLS policies
CREATE OR REPLACE FUNCTION public.list_rls_policies()
RETURNS TABLE(table_name text, policy_name text, command text, roles text, using_expression text)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT tablename, policyname, cmd, roles, COALESCE(using_clause, 'n/a')
  FROM pg_policies
  WHERE schemaname = 'public';
$$;
