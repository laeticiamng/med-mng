-- CRITICAL SECURITY FIXES
-- This migration addresses the most urgent security issues identified by the linter

-- 1. Fix RLS for tables that have disabled RLS (Critical)
-- Enable RLS on tables that currently have it disabled
ALTER TABLE public."Digital Medicine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_edn_items_immersive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_oic_competences ENABLE ROW LEVEL SECURITY;

-- 2. Add RLS policies for tables that have RLS enabled but no policies
-- For user-specific tables, add proper user-based policies

-- badges table - users can only see/manage their own badges
CREATE POLICY "Users can view own badges" ON public.badges
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON public.badges  
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges" ON public.badges
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own badges" ON public.badges
FOR DELETE USING (auth.uid() = user_id);

-- buddies table - users can see their own buddy relationships
CREATE POLICY "Users can view buddy relationships" ON public.buddies
FOR SELECT USING (auth.uid() = user_id OR auth.uid() = buddy_user_id);

CREATE POLICY "Users can create buddy relationships" ON public.buddies
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their buddy relationships" ON public.buddies
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their buddy relationships" ON public.buddies
FOR DELETE USING (auth.uid() = user_id);

-- chat_conversations table - users can only access their own conversations
CREATE POLICY "Users can view own conversations" ON public.chat_conversations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.chat_conversations
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.chat_conversations
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.chat_conversations
FOR DELETE USING (auth.uid() = user_id);

-- chat_messages table - users can only access messages in their conversations
CREATE POLICY "Users can view messages in own conversations" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id 
    AND chat_conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in own conversations" ON public.chat_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id 
    AND chat_conversations.user_id = auth.uid()
  )
);

-- comments table - basic read/write policies
CREATE POLICY "Users can view all comments" ON public.comments
FOR SELECT USING (true);

CREATE POLICY "Users can insert own comments" ON public.comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
FOR DELETE USING (auth.uid() = user_id);

-- emotions table - users can only access their own emotions
CREATE POLICY "Users can view own emotions" ON public.emotions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotions" ON public.emotions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emotions" ON public.emotions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emotions" ON public.emotions
FOR DELETE USING (auth.uid() = user_id);

-- groups table - public read access
CREATE POLICY "Anyone can view groups" ON public.groups
FOR SELECT USING (true);

-- Add admin-only policies for group management
CREATE POLICY "Service role can manage groups" ON public.groups
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. Fix database function security by adding proper search_path
-- Update all SECURITY DEFINER functions to have proper search_path

-- Update existing functions with proper security
CREATE OR REPLACE FUNCTION public.update_emotionscare_songs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_urgent_protocols_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_emotionsroom_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.emotionsroom_profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anonyme_' || substr(NEW.id::text, 1, 6))
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_imports()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Supprimer les imports terminés depuis plus de 30 jours
  DELETE FROM public.import_batches
  WHERE status IN ('completed', 'failed')
  AND completed_at < now() - INTERVAL '30 days';
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_google_sheets_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. Add policies for backup tables (read-only for service role)
CREATE POLICY "Service role can view backup tables" ON public.backup_edn_items_immersive
FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can view backup OIC" ON public.backup_oic_competences
FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. Add policy for Digital Medicine table (public can insert, service role can manage)
CREATE POLICY "Public can insert to Digital Medicine" ON public."Digital Medicine"
FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage Digital Medicine" ON public."Digital Medicine"
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');