-- Table pour tracker la progression de chaque item par utilisateur
CREATE TABLE public.user_item_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_code TEXT NOT NULL,
  
  -- SRS Core Data (SM-2 Algorithm)
  ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.50, -- Facilité (min 1.3, défaut 2.5)
  interval_days INTEGER NOT NULL DEFAULT 0, -- Intervalle actuel en jours
  repetitions INTEGER NOT NULL DEFAULT 0, -- Nombre de répétitions réussies consécutives
  
  -- Review Tracking
  next_review_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_review_date TIMESTAMP WITH TIME ZONE,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  correct_reviews INTEGER NOT NULL DEFAULT 0,
  
  -- Learning State
  learning_state TEXT NOT NULL DEFAULT 'new' CHECK (learning_state IN ('new', 'learning', 'review', 'relearning')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, item_code)
);

-- Table pour l'historique des sessions de révision
CREATE TABLE public.review_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Session Data
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  items_reviewed INTEGER NOT NULL DEFAULT 0,
  items_correct INTEGER NOT NULL DEFAULT 0,
  items_again INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER,
  
  -- Session Type
  session_type TEXT NOT NULL DEFAULT 'mixed' CHECK (session_type IN ('new', 'review', 'mixed')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les reviews individuelles (historique détaillé)
CREATE TABLE public.item_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_code TEXT NOT NULL,
  session_id UUID REFERENCES public.review_sessions(id),
  
  -- Review Data
  quality INTEGER NOT NULL CHECK (quality >= 0 AND quality <= 5), -- 0=Again, 3=Hard, 4=Good, 5=Easy
  response_time_ms INTEGER,
  
  -- State Before Review
  ease_factor_before DECIMAL(4,2),
  interval_before INTEGER,
  
  -- State After Review  
  ease_factor_after DECIMAL(4,2),
  interval_after INTEGER,
  next_review_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_user_item_progress_user_id ON public.user_item_progress(user_id);
CREATE INDEX idx_user_item_progress_next_review ON public.user_item_progress(user_id, next_review_date);
CREATE INDEX idx_user_item_progress_state ON public.user_item_progress(user_id, learning_state);
CREATE INDEX idx_review_sessions_user_id ON public.review_sessions(user_id);
CREATE INDEX idx_item_reviews_user_item ON public.item_reviews(user_id, item_code);

-- Enable RLS
ALTER TABLE public.user_item_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view their own progress" ON public.user_item_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_item_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_item_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON public.review_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.review_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.review_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own reviews" ON public.item_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews" ON public.item_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_user_item_progress_updated_at
  BEFORE UPDATE ON public.user_item_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();