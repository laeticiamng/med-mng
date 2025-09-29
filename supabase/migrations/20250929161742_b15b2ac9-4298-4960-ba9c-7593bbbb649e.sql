-- Fix Security Definer Views and RLS issues

-- First, check for and drop any remaining security definer views
DO $$
DECLARE
    view_record RECORD;
    view_count INTEGER := 0;
BEGIN
    -- Count security definer views first
    SELECT COUNT(*) INTO view_count
    FROM pg_views 
    WHERE definition ILIKE '%security definer%' 
    AND schemaname = 'public';
    
    RAISE NOTICE 'Found % security definer views to drop', view_count;
    
    -- Drop all remaining security definer views
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE definition ILIKE '%security definer%' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
        RAISE NOTICE 'Dropped security definer view: %.%', view_record.schemaname, view_record.viewname;
    END LOOP;
    
    -- Also check for problematic views owned by postgres user
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views v
        JOIN pg_class c ON c.relname = v.viewname
        JOIN pg_authid a ON a.oid = c.relowner
        WHERE a.rolname = 'postgres' 
        AND v.schemaname = 'public'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
        RAISE NOTICE 'Dropped postgres-owned view: %.%', view_record.schemaname, view_record.viewname;
    END LOOP;
END
$$;

-- Fix abonnement_biovida public exposure
DROP POLICY IF EXISTS "Service role limited access biovida" ON public.abonnement_biovida;
DROP POLICY IF EXISTS "abonnement_biovida_service_read_only" ON public.abonnement_biovida;

-- Create proper RLS policies for abonnement_biovida
CREATE POLICY "Users can manage their own biovida subscription" 
ON public.abonnement_biovida 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email::text = abonnement_biovida.email
))
WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email::text = abonnement_biovida.email
));

-- Service role can still access all records
CREATE POLICY "Service role can manage all biovida data" 
ON public.abonnement_biovida 
FOR ALL 
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- Fix generated_music_tracks if it exists (check first)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'generated_music_tracks' AND schemaname = 'public') THEN
        -- Drop any overly permissive policies
        DROP POLICY IF EXISTS "Public can view generated music" ON public.generated_music_tracks;
        DROP POLICY IF EXISTS "Anyone can access music tracks" ON public.generated_music_tracks;
        
        -- Create secure RLS policies
        CREATE POLICY "Users can manage their own music tracks" 
        ON public.generated_music_tracks 
        FOR ALL 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Service role can manage all music tracks" 
        ON public.generated_music_tracks 
        FOR ALL 
        USING ((auth.jwt() ->> 'role') = 'service_role')
        WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');
        
        RAISE NOTICE 'Fixed RLS policies for generated_music_tracks';
    ELSE
        RAISE NOTICE 'Table generated_music_tracks does not exist, skipping';
    END IF;
END
$$;

-- Fix any recursive RLS policy issues on org_memberships if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'org_memberships' AND schemaname = 'public') THEN
        -- Drop potentially problematic policies that might cause recursion
        DROP POLICY IF EXISTS "Users can view org memberships" ON public.org_memberships;
        DROP POLICY IF EXISTS "Members can view their org" ON public.org_memberships;
        
        -- Create simple, non-recursive policies
        CREATE POLICY "Users can view their own memberships" 
        ON public.org_memberships 
        FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can manage their own memberships" 
        ON public.org_memberships 
        FOR ALL 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Service role can manage all memberships" 
        ON public.org_memberships 
        FOR ALL 
        USING ((auth.jwt() ->> 'role') = 'service_role')
        WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');
        
        RAISE NOTICE 'Fixed recursive RLS policies for org_memberships';
    ELSE
        RAISE NOTICE 'Table org_memberships does not exist, skipping';
    END IF;
END
$$;