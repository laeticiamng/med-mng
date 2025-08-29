-- Créer les tables principales pour une plateforme complète d'apprentissage médical

-- Table des profils utilisateurs étendus
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  speciality TEXT,
  year_of_study INTEGER,
  university TEXT,
  study_streak INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,
  current_score_average DECIMAL(5,2) DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des sessions d'étude
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('edn', 'ecos', 'quiz', 'revision', 'collaboration')),
  content_id TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  score DECIMAL(5,2),
  completed BOOLEAN DEFAULT FALSE,
  session_data JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table du contenu EDN
CREATE TABLE IF NOT EXISTS public.edn_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  content_text TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('facile', 'moyen', 'difficile')),
  estimated_time INTEGER DEFAULT 30,
  category TEXT,
  tags TEXT[],
  multimedia_urls JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des scénarios ECOS
CREATE TABLE IF NOT EXISTS public.ecos_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  clinical_case TEXT NOT NULL,
  speciality TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('facile', 'moyen', 'difficile')),
  estimated_time INTEGER DEFAULT 45,
  evaluation_criteria JSONB DEFAULT '{}',
  multimedia_resources JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des progrès utilisateur
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('edn', 'ecos', 'quiz')),
  content_id TEXT NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  best_score DECIMAL(5,2),
  attempts_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  mastery_level TEXT CHECK (mastery_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  notes TEXT,
  bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Table des recommandations IA
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('weakness', 'strength', 'next', 'revision')),
  priority_level TEXT NOT NULL CHECK (priority_level IN ('high', 'medium', 'low')),
  reason TEXT NOT NULL,
  estimated_time INTEGER,
  confidence_score DECIMAL(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Table des salles d'étude collaboratives
CREATE TABLE IF NOT EXISTS public.study_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('public', 'private')),
  max_participants INTEGER DEFAULT 8,
  created_by UUID NOT NULL,
  current_session_content TEXT,
  room_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des participants aux salles d'étude
CREATE TABLE IF NOT EXISTS public.room_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'away', 'studying')),
  UNIQUE(room_id, user_id)
);

-- Table des messages de chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des achievements/récompenses
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  points_earned INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_type, achievement_name)
);

-- Table des analytics/statistiques
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  study_time_minutes INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  content_types_studied TEXT[],
  peak_performance_hour INTEGER,
  analytics_data JSONB DEFAULT '{}',
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edn_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecos_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view and edit their own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view other profiles (basic info)" ON public.user_profiles
  FOR SELECT USING (true);

-- RLS Policies for study_sessions
CREATE POLICY "Users can manage their own study sessions" ON public.study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for content (public read)
CREATE POLICY "Anyone can view EDN content" ON public.edn_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view ECOS scenarios" ON public.ecos_scenarios
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_progress
CREATE POLICY "Users can manage their own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ai_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for study_rooms
CREATE POLICY "Anyone can view public study rooms" ON public.study_rooms
  FOR SELECT USING (room_type = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can create and manage their own rooms" ON public.study_rooms
  FOR ALL USING (auth.uid() = created_by);

-- RLS Policies for room_participants
CREATE POLICY "Users can view participants in their rooms" ON public.room_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.study_rooms 
      WHERE id = room_id AND (room_type = 'public' OR created_by = auth.uid())
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can join/leave rooms" ON public.room_participants
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in rooms they participate in" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_participants 
      WHERE room_id = chat_messages.room_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in rooms they participate in" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.room_participants 
      WHERE room_id = chat_messages.room_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for achievements and analytics
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" ON public.user_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_edn_content_updated_at
    BEFORE UPDATE ON public.edn_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecos_scenarios_updated_at
    BEFORE UPDATE ON public.ecos_scenarios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_rooms_updated_at
    BEFORE UPDATE ON public.study_rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.edn_content (item_code, title, description, difficulty_level, category, tags) VALUES
('IC-001', 'Anatomie cardiovasculaire', 'Anatomie détaillée du système cardiovasculaire', 'facile', 'Cardiologie', ARRAY['anatomie', 'coeur', 'vaisseaux']),
('IC-156', 'Insuffisance cardiaque', 'Physiopathologie et prise en charge de l''insuffisance cardiaque', 'moyen', 'Cardiologie', ARRAY['insuffisance', 'cardiaque', 'traitement']),
('IC-245', 'Arythmies cardiaques', 'Diagnostic et traitement des troubles du rythme', 'difficile', 'Cardiologie', ARRAY['arythmie', 'ecg', 'antiarythmiques']);

INSERT INTO public.ecos_scenarios (scenario_code, title, description, clinical_case, speciality, difficulty_level) VALUES
('ECOS-001', 'Examen cardiovasculaire', 'Examen clinique complet du système cardiovasculaire', 'Patient de 65 ans consultant pour dyspnée d''effort', 'Cardiologie', 'moyen'),
('ECOS-002', 'Urgence neurologique', 'Prise en charge d''un AVC aigu', 'Patient de 70 ans présentant une hémiplégie brutale', 'Neurologie', 'difficile');