-- ==============================================
-- MIGRATION SÉCURITÉ: Corrections et enrichissements
-- Date: 2026-02-03
-- ==============================================

-- 1. Ajouter des indexes de performance manquants
CREATE INDEX IF NOT EXISTS idx_forum_topics_author ON public.forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON public.forum_topics(category);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON public.forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON public.forum_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_date ON public.user_activity_log(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user ON public.user_activity_log(user_id);

-- 2. Créer une fonction utilitaire sécurisée pour vérifier les rôles
CREATE OR REPLACE FUNCTION public.check_user_owns_resource(_user_id uuid, _resource_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = _resource_user_id;
$$;

-- 3. Ajouter table pour les transcriptions audio (accessibilité) - sans FK
CREATE TABLE IF NOT EXISTS public.audio_transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id text NOT NULL,
  content text NOT NULL,
  language text DEFAULT 'fr',
  is_auto_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.audio_transcriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audio_transcriptions' AND policyname = 'Public can read transcriptions') THEN
    EXECUTE 'CREATE POLICY "Public can read transcriptions" ON public.audio_transcriptions FOR SELECT USING (true)';
  END IF;
END $$;

-- 4. Ajouter table pour les validations médicales
CREATE TABLE IF NOT EXISTS public.medical_content_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review')),
  validator_id uuid,
  validator_name text,
  validator_credentials text,
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id)
);

ALTER TABLE public.medical_content_validations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_content_validations' AND policyname = 'Authenticated read validations') THEN
    EXECUTE 'CREATE POLICY "Authenticated read validations" ON public.medical_content_validations FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- 5. Créer trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.audio_transcriptions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.audio_transcriptions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.medical_content_validations;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.medical_content_validations
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- 6. Table pour stocker les feedback utilisateurs sur l'IA
CREATE TABLE IF NOT EXISTS public.ai_content_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_type text NOT NULL,
  content_id text NOT NULL,
  feedback_type text CHECK (feedback_type IN ('helpful', 'not_helpful', 'incorrect', 'needs_review')),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_content_feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_content_feedback' AND policyname = 'Users manage own feedback') THEN
    EXECUTE 'CREATE POLICY "Users manage own feedback" ON public.ai_content_feedback FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_content_feedback_user ON public.ai_content_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_feedback_content ON public.ai_content_feedback(content_type, content_id);