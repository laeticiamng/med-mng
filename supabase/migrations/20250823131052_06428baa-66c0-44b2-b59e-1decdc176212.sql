-- Critical Security Fix: Comprehensive RLS Policies for Medical and Personal Data

-- 1. CRITICAL: Secure Medical Data Tables
-- Ensure biovida_analyses table has proper user isolation
DROP POLICY IF EXISTS "Users can only access their own biovida analyses" ON public.biovida_analyses;
CREATE POLICY "Users can only access their own biovida analyses"
ON public.biovida_analyses FOR ALL
TO authenticated
USING (auth.uid()::text = email OR auth.uid() IN (
    SELECT id FROM auth.users WHERE email = biovida_analyses.email
))
WITH CHECK (auth.uid()::text = email OR auth.uid() IN (
    SELECT id FROM auth.users WHERE email = biovida_analyses.email
));

-- Service role access for medical data
DROP POLICY IF EXISTS "Service role can manage all biovida analyses" ON public.biovida_analyses;
CREATE POLICY "Service role can manage all biovida analyses"
ON public.biovida_analyses FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. CRITICAL: Secure Profile Data
-- Ensure profiles table exists and is properly secured
DO $$
BEGIN
    -- Check if profiles table exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email text,
            full_name text,
            role text DEFAULT 'user',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- User profile access policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Service role access for profiles
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
CREATE POLICY "Service role can manage all profiles"
ON public.profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. CRITICAL: Secure User-Generated Content Tables
-- Enhanced emotions table policies
DROP POLICY IF EXISTS "Enhanced users can only access own emotions" ON public.emotions;
CREATE POLICY "Enhanced users can only access own emotions"
ON public.emotions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role access for chat data
DROP POLICY IF EXISTS "Service role can manage all chat conversations" ON public.chat_conversations;
CREATE POLICY "Service role can manage all chat conversations"
ON public.chat_conversations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage all chat messages" ON public.chat_messages;
CREATE POLICY "Service role can manage all chat messages"
ON public.chat_messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);