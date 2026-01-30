-- =====================================================
-- MIGRATION SÉCURITÉ v2: Drop puis recréer les fonctions avec search_path
-- =====================================================

-- 1. DROP et recréer get_rls_policies avec search_path
DROP FUNCTION IF EXISTS public.get_rls_policies();

CREATE FUNCTION public.get_rls_policies()
RETURNS TABLE (
  schemaname text,
  tablename text,
  policyname text,
  cmd text,
  qual text,
  with_check text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    n.nspname::text as schemaname,
    c.relname::text as tablename,
    pol.polname::text as policyname,
    CASE pol.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END as cmd,
    pg_get_expr(pol.polqual, pol.polrelid)::text as qual,
    pg_get_expr(pol.polwithcheck, pol.polrelid)::text as with_check
  FROM pg_policy pol
  JOIN pg_class c ON c.oid = pol.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  ORDER BY c.relname, pol.polname;
$$;

-- 2. DROP et recréer get_rls_table_summaries avec search_path
DROP FUNCTION IF EXISTS public.get_rls_table_summaries();

CREATE FUNCTION public.get_rls_table_summaries()
RETURNS TABLE (
  tablename text,
  has_rls boolean,
  policy_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.relname::text as tablename,
    c.relrowsecurity as has_rls,
    COUNT(pol.polname) as policy_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname;
$$;

-- 3. Créer la table ai_chat_feedback si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.ai_chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur ai_chat_feedback
ALTER TABLE public.ai_chat_feedback ENABLE ROW LEVEL SECURITY;

-- Policies pour ai_chat_feedback
CREATE POLICY "Users can insert their own feedback" 
ON public.ai_chat_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.ai_chat_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Corriger update_updated_at_column avec search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SECURITY INVOKER
   SET search_path = public;