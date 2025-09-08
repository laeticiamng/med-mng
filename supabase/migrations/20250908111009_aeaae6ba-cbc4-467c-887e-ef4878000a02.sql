-- Création des tables pour la plateforme médicale MED-MNG

-- Table des utilisateurs médicaux (profils étendus)
CREATE TABLE IF NOT EXISTS public.medical_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  medical_specialty TEXT,
  study_level TEXT CHECK (study_level IN ('student', 'resident', 'doctor', 'professor')),
  institution TEXT,
  graduation_year INTEGER,
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Table des pistes musicales médicales
CREATE TABLE IF NOT EXISTS public.medical_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  item_code TEXT NOT NULL,
  rang TEXT NOT NULL CHECK (rang IN ('A', 'B', 'AB')),
  audio_url TEXT,
  stream_url TEXT,
  suno_audio_id TEXT,
  duration_seconds INTEGER DEFAULT 240,
  style TEXT DEFAULT 'medical-educational',
  language TEXT DEFAULT 'fr',
  lyrics JSONB DEFAULT '[]',
  medical_context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  generation_status TEXT DEFAULT 'completed' CHECK (generation_status IN ('queued', 'generating', 'completed', 'failed')),
  generation_progress INTEGER DEFAULT 100,
  task_id TEXT,
  is_favorite BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  total_listening_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des bibliothèques musicales
CREATE TABLE IF NOT EXISTS public.medical_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.medical_tracks(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, track_id)
);

-- Table des playlists médicales
CREATE TABLE IF NOT EXISTS public.medical_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  track_ids JSONB DEFAULT '[]',
  medical_specialties TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des sessions d'étude
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.medical_tracks(id) ON DELETE SET NULL,
  session_type TEXT DEFAULT 'listening' CHECK (session_type IN ('listening', 'study', 'review')),
  duration_seconds INTEGER NOT NULL,
  completion_rate DECIMAL(5,2) DEFAULT 0.0,
  performance_score INTEGER,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Table des statistiques d'apprentissage
CREATE TABLE IF NOT EXISTS public.learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  tracks_generated INTEGER DEFAULT 0,
  total_listening_time INTEGER DEFAULT 0,
  study_sessions_count INTEGER DEFAULT 0,
  items_mastered TEXT[] DEFAULT '{}',
  weekly_streak INTEGER DEFAULT 0,
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Table des quotas de génération
CREATE TABLE IF NOT EXISTS public.generation_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quota_type TEXT DEFAULT 'monthly' CHECK (quota_type IN ('daily', 'weekly', 'monthly')),
  total_quota INTEGER NOT NULL,
  used_quota INTEGER DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, quota_type)
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.medical_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_quotas ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour medical_users
CREATE POLICY "Users can view their own profile" ON public.medical_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.medical_users
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.medical_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour medical_tracks
CREATE POLICY "Users can view their own tracks" ON public.medical_tracks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracks" ON public.medical_tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks" ON public.medical_tracks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks" ON public.medical_tracks
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour medical_libraries
CREATE POLICY "Users can view their own library" ON public.medical_libraries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own library" ON public.medical_libraries
  FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour medical_playlists
CREATE POLICY "Users can view their own playlists" ON public.medical_playlists
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage their own playlists" ON public.medical_playlists
  FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour study_sessions
CREATE POLICY "Users can view their own sessions" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" ON public.study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour learning_analytics
CREATE POLICY "Users can view their own analytics" ON public.learning_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own analytics" ON public.learning_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour generation_quotas
CREATE POLICY "Users can view their own quotas" ON public.generation_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quotas" ON public.generation_quotas
  FOR ALL USING (auth.uid() = user_id);

-- Fonctions et triggers pour les timestamps automatiques
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_medical_users_updated_at BEFORE UPDATE ON public.medical_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_tracks_updated_at BEFORE UPDATE ON public.medical_tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_playlists_updated_at BEFORE UPDATE ON public.medical_playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_analytics_updated_at BEFORE UPDATE ON public.learning_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generation_quotas_updated_at BEFORE UPDATE ON public.generation_quotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_medical_tracks_user_id ON public.medical_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_tracks_item_code ON public.medical_tracks(item_code);
CREATE INDEX IF NOT EXISTS idx_medical_tracks_rang ON public.medical_tracks(rang);
CREATE INDEX IF NOT EXISTS idx_medical_tracks_status ON public.medical_tracks(generation_status);
CREATE INDEX IF NOT EXISTS idx_medical_libraries_user_id ON public.medical_libraries(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_date ON public.learning_analytics(user_id, date);

-- Fonction pour initialiser le profil utilisateur
CREATE OR REPLACE FUNCTION public.initialize_medical_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.medical_users (user_id, display_name, preferences, subscription_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Utilisateur'),
    '{"notifications": true, "auto_play": false, "theme": "system"}'::jsonb,
    'free'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Initialiser les quotas par défaut
  INSERT INTO public.generation_quotas (user_id, quota_type, total_quota, reset_at)
  VALUES 
    (NEW.id, 'daily', 10, date_trunc('day', now()) + interval '1 day'),
    (NEW.id, 'monthly', 50, date_trunc('month', now()) + interval '1 month')
  ON CONFLICT (user_id, quota_type) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour initialiser automatiquement les profils
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_medical_user();