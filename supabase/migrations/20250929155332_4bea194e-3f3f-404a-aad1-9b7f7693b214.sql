-- Fix remaining critical security issues with conditional checks

-- 1. Fix profiles table public exposure by checking existing policies first
DO $$
BEGIN
  -- Remove dangerous public read policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
    DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_public_read') THEN
    DROP POLICY "profiles_public_read" ON public.profiles;
  END IF;

  -- Ensure secure user-only access policies exist
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    EXECUTE 'CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
    EXECUTE 'CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)';
  END IF;
END
$$;

-- 2. Fix generated_music_tracks if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_music_tracks' AND table_schema = 'public') THEN
    -- Enable RLS
    ALTER TABLE public.generated_music_tracks ENABLE ROW LEVEL SECURITY;
    
    -- Remove public policies safely
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_music_tracks' AND policyname = 'Public can view generated music tracks') THEN
      DROP POLICY "Public can view generated music tracks" ON public.generated_music_tracks;
    END IF;
    
    -- Add secure user-scoped policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_music_tracks' AND policyname = 'Users can view own music tracks') THEN
      EXECUTE 'CREATE POLICY "Users can view own music tracks" ON public.generated_music_tracks FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_music_tracks' AND policyname = 'Users can manage own music tracks') THEN
      EXECUTE 'CREATE POLICY "Users can manage own music tracks" ON public.generated_music_tracks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    END IF;
  END IF;
END
$$;