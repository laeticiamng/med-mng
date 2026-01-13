-- Table pour les mentors
CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  specialty TEXT NOT NULL,
  expertise TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'offline' CHECK (availability IN ('available', 'busy', 'offline')),
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  students_helped INTEGER DEFAULT 0,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les sessions de mentorat
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  topic TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 30,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les discussions du forum
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  author_id UUID NOT NULL,
  views INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  last_reply_author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les réponses du forum
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les likes de topics/réponses
CREATE TABLE IF NOT EXISTS public.forum_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_topic_like UNIQUE (user_id, topic_id),
  CONSTRAINT unique_reply_like UNIQUE (user_id, reply_id)
);

-- Table pour les bookmarks
CREATE TABLE IF NOT EXISTS public.forum_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_bookmark UNIQUE (user_id, topic_id)
);

-- Activer RLS
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies pour mentors (lecture publique, écriture pour le propriétaire)
CREATE POLICY "Anyone can view mentors" ON public.mentors FOR SELECT USING (true);
CREATE POLICY "Mentors can update their profile" ON public.mentors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can become mentors" ON public.mentors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies pour mentor_sessions
CREATE POLICY "Users can view their sessions" ON public.mentor_sessions 
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() IN (SELECT user_id FROM public.mentors WHERE id = mentor_id));
CREATE POLICY "Users can create sessions" ON public.mentor_sessions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Participants can update sessions" ON public.mentor_sessions 
  FOR UPDATE USING (auth.uid() = student_id OR auth.uid() IN (SELECT user_id FROM public.mentors WHERE id = mentor_id));

-- Policies pour forum_topics (lecture publique)
CREATE POLICY "Anyone can view topics" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their topics" ON public.forum_topics FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their topics" ON public.forum_topics FOR DELETE USING (auth.uid() = author_id);

-- Policies pour forum_replies
CREATE POLICY "Anyone can view replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their replies" ON public.forum_replies FOR DELETE USING (auth.uid() = author_id);

-- Policies pour forum_likes
CREATE POLICY "Users can view their likes" ON public.forum_likes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can like" ON public.forum_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.forum_likes FOR DELETE USING (auth.uid() = user_id);

-- Policies pour forum_bookmarks
CREATE POLICY "Users can view their bookmarks" ON public.forum_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can bookmark" ON public.forum_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON public.forum_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON public.mentors 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentor_sessions_updated_at BEFORE UPDATE ON public.mentor_sessions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON public.forum_topics 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques données de démo pour les mentors
INSERT INTO public.mentors (user_id, specialty, expertise, availability, rating, review_count, students_helped, bio)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Cardiologie', ARRAY['ECG', 'Insuffisance cardiaque', 'HTA'], 'available', 4.9, 47, 156, 'Expert en cardiologie avec 10 ans d''expérience'),
  ('00000000-0000-0000-0000-000000000002', 'Neurologie', ARRAY['AVC', 'Épilepsie', 'Céphalées'], 'busy', 4.8, 35, 98, 'Spécialiste neurologie clinique'),
  ('00000000-0000-0000-0000-000000000003', 'Pédiatrie', ARRAY['Vaccination', 'Développement', 'Urgences pédiatriques'], 'available', 4.95, 62, 203, 'Pédiatre passionnée par l''enseignement')
ON CONFLICT DO NOTHING;

-- Insérer quelques topics de démo
INSERT INTO public.forum_topics (title, content, category, tags, author_id, views, replies_count, likes_count, is_pinned)
VALUES 
  ('Comment mémoriser efficacement les items de cardiologie ?', 'Je cherche des techniques pour mieux retenir les items de cardiologie. Avez-vous des conseils ?', 'methode', ARRAY['mémorisation', 'cardiologie', 'techniques'], '00000000-0000-0000-0000-000000000001', 234, 12, 45, true),
  ('Question sur IC-3 : critères diagnostiques', 'Quelqu''un peut m''expliquer les critères diagnostiques pour l''IC-3 ?', 'cardiologie', ARRAY['IC-3', 'diagnostic', 'insuffisance cardiaque'], '00000000-0000-0000-0000-000000000002', 156, 8, 23, false),
  ('Retour d''expérience ECOS blancs 2024', 'Je voulais partager mon retour sur les ECOS blancs de cette année.', 'edn', ARRAY['ECOS', 'retour expérience', '2024'], '00000000-0000-0000-0000-000000000003', 567, 34, 89, false)
ON CONFLICT DO NOTHING;