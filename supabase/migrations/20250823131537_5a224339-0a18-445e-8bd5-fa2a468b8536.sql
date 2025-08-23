-- FINAL CRITICAL SECURITY FIX: Complete User Data Protection

-- 1. CRITICAL: Secure music_generation_usage table (exposed user tracking data)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'music_generation_usage') THEN
        ALTER TABLE public.music_generation_usage ENABLE ROW LEVEL SECURITY;
        
        -- Users can only access their own usage data
        DROP POLICY IF EXISTS "Users can view own usage data" ON public.music_generation_usage;
        CREATE POLICY "Users can view own usage data"
        ON public.music_generation_usage FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
        
        -- Users can update their own usage data
        DROP POLICY IF EXISTS "Users can update own usage data" ON public.music_generation_usage;
        CREATE POLICY "Users can update own usage data"
        ON public.music_generation_usage FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        -- Service role access
        DROP POLICY IF EXISTS "Service role can manage music usage" ON public.music_generation_usage;
        CREATE POLICY "Service role can manage music usage"
        ON public.music_generation_usage FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 2. CRITICAL: Secure user_generated_music table (public user content)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_generated_music') THEN
        ALTER TABLE public.user_generated_music ENABLE ROW LEVEL SECURITY;
        
        -- Users can only access their own music
        DROP POLICY IF EXISTS "Users can view own music" ON public.user_generated_music;
        CREATE POLICY "Users can view own music"
        ON public.user_generated_music FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
        
        -- Users can manage their own music
        DROP POLICY IF EXISTS "Users can manage own music" ON public.user_generated_music;
        CREATE POLICY "Users can manage own music"
        ON public.user_generated_music FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        -- Service role access
        DROP POLICY IF EXISTS "Service role can manage all music" ON public.user_generated_music;
        CREATE POLICY "Service role can manage all music"
        ON public.user_generated_music FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 3. CRITICAL: Secure user_quotas table (subscription data exposed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_quotas') THEN
        ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
        
        -- Users can only access their own quota data
        DROP POLICY IF EXISTS "Users can view own quotas" ON public.user_quotas;
        CREATE POLICY "Users can view own quotas"
        ON public.user_quotas FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
        
        -- Users can update their own quotas (for usage tracking)
        DROP POLICY IF EXISTS "Users can update own quotas" ON public.user_quotas;
        CREATE POLICY "Users can update own quotas"
        ON public.user_quotas FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        -- Service role access
        DROP POLICY IF EXISTS "Service role can manage all quotas" ON public.user_quotas;
        CREATE POLICY "Service role can manage all quotas"
        ON public.user_quotas FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 4. CRITICAL: Secure any remaining user data tables
DO $$
DECLARE
    tbl_name text;
    has_user_column boolean;
BEGIN
    -- Check for tables with user_id that might still be publicly accessible
    FOR tbl_name IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'user_activity_logs', 'user_sessions', 'user_preferences', 
            'user_subscriptions', 'user_payments', 'user_analytics'
        )
    LOOP
        -- Check if table has user_id column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = tbl_name AND column_name = 'user_id'
        ) INTO has_user_column;
        
        IF has_user_column THEN
            -- Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            
            -- User can only access own data
            EXECUTE format('DROP POLICY IF EXISTS "Users can access own %I" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('
                CREATE POLICY "Users can access own %I"
                ON public.%I FOR SELECT
                TO authenticated
                USING (auth.uid() = user_id)
            ', tbl_name, tbl_name);
            
            -- Service role access
            EXECUTE format('DROP POLICY IF EXISTS "Service role can manage %I" ON public.%I', tbl_name, tbl_name);
            EXECUTE format('
                CREATE POLICY "Service role can manage %I"
                ON public.%I FOR ALL
                TO service_role
                USING (true)
                WITH CHECK (true)
            ', tbl_name, tbl_name);
        END IF;
    END LOOP;
END $$;

-- 5. SECURITY: Remove public read access from tables that should be private
-- Ensure sensitive tables don't have overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;

-- Final security audit log entry
SELECT public.log_security_event(
    'SECURITY_MIGRATION_COMPLETED',
    jsonb_build_object(
        'migration_type', 'comprehensive_data_protection',
        'tables_secured', ARRAY['profiles', 'music_generation_usage', 'user_generated_music', 'user_quotas'],
        'security_level', 'maximum',
        'completed_at', now()
    )
);