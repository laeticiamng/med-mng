-- Strict Row Level Security policies for medical-related tables

-- medical_users
ALTER TABLE public.medical_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.medical_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.medical_users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.medical_users;
DROP POLICY IF EXISTS "medical_users service access" ON public.medical_users;
DROP POLICY IF EXISTS "medical_users manage own" ON public.medical_users;

CREATE POLICY "medical_users service access"
  ON public.medical_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "medical_users manage own"
  ON public.medical_users
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- medical_tracks
ALTER TABLE public.medical_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_tracks FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tracks" ON public.medical_tracks;
DROP POLICY IF EXISTS "Users can create their own tracks" ON public.medical_tracks;
DROP POLICY IF EXISTS "Users can update their own tracks" ON public.medical_tracks;
DROP POLICY IF EXISTS "Users can delete their own tracks" ON public.medical_tracks;
DROP POLICY IF EXISTS "medical_tracks service access" ON public.medical_tracks;
DROP POLICY IF EXISTS "medical_tracks manage own" ON public.medical_tracks;

CREATE POLICY "medical_tracks service access"
  ON public.medical_tracks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "medical_tracks manage own"
  ON public.medical_tracks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- medical_libraries
ALTER TABLE public.medical_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_libraries FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own library" ON public.medical_libraries;
DROP POLICY IF EXISTS "Users can manage their own library" ON public.medical_libraries;
DROP POLICY IF EXISTS "medical_libraries service access" ON public.medical_libraries;
DROP POLICY IF EXISTS "medical_libraries manage own" ON public.medical_libraries;

CREATE POLICY "medical_libraries service access"
  ON public.medical_libraries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "medical_libraries manage own"
  ON public.medical_libraries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- medical_playlists
ALTER TABLE public.medical_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_playlists FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own playlists" ON public.medical_playlists;
DROP POLICY IF EXISTS "Users can manage their own playlists" ON public.medical_playlists;
DROP POLICY IF EXISTS "medical_playlists service access" ON public.medical_playlists;
DROP POLICY IF EXISTS "medical_playlists manage own" ON public.medical_playlists;
DROP POLICY IF EXISTS "medical_playlists read public" ON public.medical_playlists;

CREATE POLICY "medical_playlists service access"
  ON public.medical_playlists
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "medical_playlists manage own"
  ON public.medical_playlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "medical_playlists read public"
  ON public.medical_playlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public);

-- study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "study_sessions service access" ON public.study_sessions;
DROP POLICY IF EXISTS "study_sessions manage own" ON public.study_sessions;

CREATE POLICY "study_sessions service access"
  ON public.study_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "study_sessions manage own"
  ON public.study_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- learning_analytics
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own analytics" ON public.learning_analytics;
DROP POLICY IF EXISTS "Users can manage their own analytics" ON public.learning_analytics;
DROP POLICY IF EXISTS "learning_analytics service access" ON public.learning_analytics;
DROP POLICY IF EXISTS "learning_analytics manage own" ON public.learning_analytics;

CREATE POLICY "learning_analytics service access"
  ON public.learning_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "learning_analytics manage own"
  ON public.learning_analytics
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- generation_quotas
ALTER TABLE public.generation_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_quotas FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own quotas" ON public.generation_quotas;
DROP POLICY IF EXISTS "Users can manage their own quotas" ON public.generation_quotas;
DROP POLICY IF EXISTS "generation_quotas service access" ON public.generation_quotas;
DROP POLICY IF EXISTS "generation_quotas manage own" ON public.generation_quotas;

CREATE POLICY "generation_quotas service access"
  ON public.generation_quotas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "generation_quotas manage own"
  ON public.generation_quotas
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- unified_music_generation
ALTER TABLE public.unified_music_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_music_generation FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own music generations" ON public.unified_music_generation;
DROP POLICY IF EXISTS "unified_music_generation service access" ON public.unified_music_generation;
DROP POLICY IF EXISTS "unified_music_generation manage own" ON public.unified_music_generation;

CREATE POLICY "unified_music_generation service access"
  ON public.unified_music_generation
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "unified_music_generation manage own"
  ON public.unified_music_generation
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- medical_learning_analytics
ALTER TABLE public.medical_learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_learning_analytics FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own analytics" ON public.medical_learning_analytics;
DROP POLICY IF EXISTS "medical_learning_analytics service access" ON public.medical_learning_analytics;
DROP POLICY IF EXISTS "medical_learning_analytics manage own" ON public.medical_learning_analytics;

CREATE POLICY "medical_learning_analytics service access"
  ON public.medical_learning_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "medical_learning_analytics manage own"
  ON public.medical_learning_analytics
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
