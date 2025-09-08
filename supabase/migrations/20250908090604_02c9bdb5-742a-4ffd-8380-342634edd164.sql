-- ============================================
-- MED-MNG v3.0 - SCHEMA COMPLET DE BASE DE DONNÉES MÉDICALE
-- Base de données sécurisée avec RLS pour plateforme premium
-- ============================================

-- 1. PROFILS UTILISATEURS MÉDICAUX
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL DEFAULT 'patient' CHECK (user_type IN ('patient', 'doctor', 'therapist', 'admin')),
  specialization TEXT,
  license_number TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Préférences médicales
  medical_conditions JSONB DEFAULT '[]',
  medications JSONB DEFAULT '[]',
  allergies JSONB DEFAULT '[]',
  emergency_contact JSONB,
  
  -- Préférences thérapeutiques
  music_preferences JSONB DEFAULT '{}',
  therapy_goals JSONB DEFAULT '[]',
  accessibility_preferences JSONB DEFAULT '{}',
  
  -- Métadonnées
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'professional', 'enterprise')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. COMPOSITIONS MUSICALES THÉRAPEUTIQUES
CREATE TABLE IF NOT EXISTS public.musical_compositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL DEFAULT 'therapeutic',
  
  -- Paramètres musicaux
  duration INTEGER NOT NULL CHECK (duration > 0), -- en secondes
  bpm INTEGER CHECK (bpm BETWEEN 40 AND 200),
  key_signature TEXT DEFAULT 'C',
  time_signature TEXT DEFAULT '4/4',
  
  -- Paramètres thérapeutiques
  therapy_type TEXT NOT NULL CHECK (therapy_type IN ('relaxation', 'focus', 'sleep', 'energy', 'meditation', 'anxiety', 'pain_relief', 'depression')),
  binaural_frequency NUMERIC,
  nature_sounds BOOLEAN DEFAULT FALSE,
  solfeggio_frequencies JSONB DEFAULT '[]',
  
  -- Métadonnées AI
  ai_model_version TEXT DEFAULT 'v3.0',
  generation_params JSONB DEFAULT '{}',
  quality_score NUMERIC CHECK (quality_score BETWEEN 0 AND 100),
  
  -- Fichiers et accès
  audio_file_url TEXT,
  file_size BIGINT,
  file_format TEXT DEFAULT 'mp3',
  is_public BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  
  -- Évaluations
  rating NUMERIC CHECK (rating BETWEEN 1 AND 5),
  rating_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SESSIONS THÉRAPEUTIQUES
CREATE TABLE IF NOT EXISTS public.therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  composition_id UUID REFERENCES public.musical_compositions(id) ON DELETE SET NULL,
  
  -- Données de session
  session_type TEXT NOT NULL CHECK (session_type IN ('listening', 'meditation', 'biofeedback', 'guided')),
  duration INTEGER NOT NULL CHECK (duration > 0), -- durée effective en secondes
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  
  -- Données biométriques (si disponibles)
  heart_rate_data JSONB,
  stress_level_before INTEGER CHECK (stress_level_before BETWEEN 1 AND 10),
  stress_level_after INTEGER CHECK (stress_level_after BETWEEN 1 AND 10),
  mood_before TEXT,
  mood_after TEXT,
  
  -- Évaluation de la session
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  notes TEXT,
  
  -- Données techniques
  device_info JSONB,
  interruptions INTEGER DEFAULT 0,
  completion_percentage NUMERIC DEFAULT 100 CHECK (completion_percentage BETWEEN 0 AND 100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUIVI MÉDICAL ET PROGRÈS
CREATE TABLE IF NOT EXISTS public.medical_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Métriques de santé
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_wellness INTEGER CHECK (overall_wellness BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  
  -- Symptômes et conditions
  symptoms JSONB DEFAULT '[]',
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  medication_adherence INTEGER CHECK (medication_adherence BETWEEN 0 AND 100),
  
  -- Objectifs thérapeutiques
  goals_progress JSONB DEFAULT '{}',
  milestones_reached JSONB DEFAULT '[]',
  
  -- Notes médicales
  notes TEXT,
  healthcare_provider_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COMMUNAUTÉ ET GROUPES DE SUPPORT
CREATE TABLE IF NOT EXISTS public.support_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT NOT NULL CHECK (group_type IN ('condition_based', 'therapy_focused', 'general_support', 'professional')),
  
  -- Configuration du groupe
  is_private BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT TRUE,
  max_members INTEGER DEFAULT 50,
  
  -- Modération
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rules TEXT,
  tags JSONB DEFAULT '[]',
  
  -- Métadonnées
  member_count INTEGER DEFAULT 0,
  activity_score NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MEMBRES DES GROUPES
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.support_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'banned')),
  
  -- Participation
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contribution_score INTEGER DEFAULT 0,
  
  -- Préférences
  notification_settings JSONB DEFAULT '{"mentions": true, "group_updates": true}',
  
  UNIQUE(group_id, user_id)
);

-- 7. ANALYTICS ET MÉTRIQUES
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Période d'analyse
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Métriques d'usage
  total_listening_time INTEGER DEFAULT 0, -- en minutes
  sessions_count INTEGER DEFAULT 0,
  compositions_created INTEGER DEFAULT 0,
  average_session_duration NUMERIC DEFAULT 0,
  
  -- Métriques de bien-être
  wellness_improvement NUMERIC, -- pourcentage d'amélioration
  stress_reduction NUMERIC,
  sleep_improvement NUMERIC,
  mood_stability NUMERIC,
  
  -- Engagement communautaire
  group_participations INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  support_given INTEGER DEFAULT 0,
  
  -- Recommandations IA
  ai_recommendations JSONB DEFAULT '[]',
  recommendation_accuracy NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, period_start, period_end)
);

-- ============================================
-- POLITIQUES DE SÉCURITÉ RLS (Row Level Security)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musical_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- POLITIQUES POUR PROFILES
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Healthcare providers can view patient profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type IN ('doctor', 'therapist', 'admin')
  )
);

-- POLITIQUES POUR MUSICAL_COMPOSITIONS
CREATE POLICY "Users can view their own compositions" 
ON public.musical_compositions FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own compositions" 
ON public.musical_compositions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compositions" 
ON public.musical_compositions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compositions" 
ON public.musical_compositions FOR DELETE 
USING (auth.uid() = user_id);

-- POLITIQUES POUR THERAPY_SESSIONS
CREATE POLICY "Users can view their own sessions" 
ON public.therapy_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON public.therapy_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Healthcare providers can view patient sessions" 
ON public.therapy_sessions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type IN ('doctor', 'therapist')
  )
);

-- POLITIQUES POUR MEDICAL_PROGRESS
CREATE POLICY "Users can view their own progress" 
ON public.medical_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.medical_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Healthcare providers can view patient progress" 
ON public.medical_progress FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type IN ('doctor', 'therapist')
  )
);

-- POLITIQUES POUR SUPPORT_GROUPS
CREATE POLICY "Anyone can view public groups" 
ON public.support_groups FOR SELECT 
USING (NOT is_private);

CREATE POLICY "Group members can view private groups" 
ON public.support_groups FOR SELECT 
USING (
  is_private = false OR 
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = id 
    AND gm.user_id = auth.uid() 
    AND gm.status = 'active'
  )
);

-- POLITIQUES POUR GROUP_MEMBERS
CREATE POLICY "Users can view group memberships" 
ON public.group_members FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_id 
    AND gm.user_id = auth.uid() 
    AND gm.status = 'active'
  )
);

CREATE POLICY "Users can join groups" 
ON public.group_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- POLITIQUES POUR USER_ANALYTICS
CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Healthcare providers can view patient analytics" 
ON public.user_analytics FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type IN ('doctor', 'therapist', 'admin')
  )
);

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compositions_updated_at
  BEFORE UPDATE ON public.musical_compositions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.support_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créer un profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger pour création automatique de profil
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour le nombre de membres des groupes
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.support_groups 
    SET member_count = member_count + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.support_groups 
    SET member_count = member_count - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger pour compter les membres
CREATE TRIGGER update_member_count_trigger
  AFTER INSERT OR DELETE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_member_count();

-- ============================================
-- INDEX POUR PERFORMANCE
-- ============================================

-- Index pour recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_type);
CREATE INDEX IF NOT EXISTS idx_compositions_therapy_type ON public.musical_compositions(therapy_type);
CREATE INDEX IF NOT EXISTS idx_compositions_user_rating ON public.musical_compositions(user_id, rating);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON public.therapy_sessions(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_progress_user_date ON public.medical_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_groups_type_active ON public.support_groups(group_type, is_active);
CREATE INDEX IF NOT EXISTS idx_group_members_active ON public.group_members(group_id, status) WHERE status = 'active';

-- Index GIN pour recherche JSON
CREATE INDEX IF NOT EXISTS idx_profiles_medical_conditions ON public.profiles USING GIN(medical_conditions);
CREATE INDEX IF NOT EXISTS idx_compositions_generation_params ON public.musical_compositions USING GIN(generation_params);
CREATE INDEX IF NOT EXISTS idx_sessions_heart_rate ON public.therapy_sessions USING GIN(heart_rate_data);

-- ============================================
-- STORAGE BUCKETS POUR FICHIERS AUDIO
-- ============================================

-- Bucket pour les compositions audio
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-compositions', 'audio-compositions', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de storage pour audio-compositions
CREATE POLICY "Users can upload their own audio compositions" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'audio-compositions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own audio compositions" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'audio-compositions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own audio compositions" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'audio-compositions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own audio compositions" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'audio-compositions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politiques de storage pour avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);