
-- Créer la table pwa_metrics pour les analytics PWA
CREATE TABLE IF NOT EXISTS public.pwa_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  is_installed BOOLEAN DEFAULT false,
  is_offline BOOLEAN DEFAULT false,
  device_type TEXT,
  browser TEXT,
  page_views INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 0,
  fcp NUMERIC,
  lcp NUMERIC,
  cls NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pwa_metrics ENABLE ROW LEVEL SECURITY;

-- Policies pour pwa_metrics
CREATE POLICY "Users can insert own pwa_metrics" ON public.pwa_metrics 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own pwa_metrics" ON public.pwa_metrics 
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all pwa_metrics" ON public.pwa_metrics 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Créer la table community_posts si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'discussion',
  category TEXT DEFAULT 'Général',
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community_posts" ON public.community_posts 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.community_posts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.community_posts 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts 
  FOR DELETE USING (auth.uid() = user_id);

-- Table des likes pour les posts
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.community_post_likes 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON public.community_post_likes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes" ON public.community_post_likes 
  FOR DELETE USING (auth.uid() = user_id);

-- Table des groupes d'étude
CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Général',
  is_public BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public study_groups" ON public.study_groups 
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can create groups" ON public.study_groups 
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update groups" ON public.study_groups 
  FOR UPDATE USING (auth.uid() = created_by);

-- Table des membres de groupe
CREATE TABLE IF NOT EXISTS public.study_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view group members" ON public.study_group_members 
  FOR SELECT USING (true);

CREATE POLICY "Users can join groups" ON public.study_group_members 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.study_group_members 
  FOR DELETE USING (auth.uid() = user_id);

-- Table messages directs
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.direct_messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.direct_messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update read status" ON public.direct_messages 
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Insérer des données de démo
INSERT INTO public.study_groups (name, description, category, is_public, member_count) VALUES
  ('Cardiologie Avancée', 'Groupe d''étude approfondie en cardiologie', 'Spécialité', true, 45),
  ('Préparation ECN 2025', 'Préparation intensive aux ECN', 'Examens', true, 89),
  ('Neurologie et Psychiatrie', 'Discussions entre passionnés du système nerveux', 'Spécialité', true, 32),
  ('Pédiatrie', 'Apprentissage de la pédiatrie ensemble', 'Spécialité', true, 28)
ON CONFLICT DO NOTHING;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_pwa_metrics_user_id ON public.pwa_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_metrics_session_id ON public.pwa_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
