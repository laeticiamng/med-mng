-- Clean up duplicate RLS policies on notification_filter_templates
-- This migration removes old duplicate policies and keeps the most comprehensive ones

-- Drop old duplicate policies
DROP POLICY IF EXISTS "Users can create templates" ON public.notification_filter_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON public.notification_filter_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON public.notification_filter_templates;
DROP POLICY IF EXISTS "Users can view their own filter templates" ON public.notification_filter_templates;

-- Keep the comprehensive policies:
-- ✅ "Users can create their own filter templates" (INSERT)
-- ✅ "Users can view accessible templates" (SELECT - includes shared logic)
-- ✅ "Users can update their own filter templates" (UPDATE)
-- ✅ "Users can delete their own filter templates" (DELETE)

-- Fix all database functions to have proper search_path
-- This prevents SQL injection attacks through search_path manipulation

-- Function: update_tag_usage_count (already has SET search_path = public) ✅

-- Function: update_updated_at_column
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

-- Verify all triggers are using functions with proper search_path
-- The update_tag_usage_trigger already uses update_tag_usage_count with proper search_path

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Updates the updated_at column to current timestamp. Security: SET search_path prevents injection attacks.';