/**
 * SCHÉMA SUPABASE COMPLET - Phases 1, 2, 3
 * ==========================================
 *
 * Toutes les tables, RLS policies, et fonctions nécessaires
 * pour les 3 phases d'implémentation
 *
 * Exécution dans Supabase Dashboard > SQL Editor
 */

-- ============================================================================
-- PHASE 1: TABLES DE BASE
-- ============================================================================

-- TABLE: analytics_events
-- Description: Événements analytics trackés
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  properties JSONB,
  url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_created_at ON public.analytics_events(created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can only view their own analytics"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- TABLE: user_favorites
-- Description: Items favoris de l'utilisateur
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('edn', 'ecos', 'song', 'product')),
  item_id TEXT NOT NULL,
  item_title TEXT,
  item_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_item_type ON public.user_favorites(item_type);
CREATE INDEX idx_user_favorites_created_at ON public.user_favorites(created_at DESC);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites"
  ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 2: SÉCURITÉ ET GESTION SESSION
-- ============================================================================

-- TABLE: user_2fa
-- Description: Configuration Two-Factor Authentication
CREATE TABLE IF NOT EXISTS public.user_2fa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  secret TEXT NOT NULL,
  backup_codes JSONB DEFAULT '[]'::jsonb,
  is_enabled BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  enabled_at TIMESTAMP WITH TIME ZONE,
  disabled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_user_2fa_user_id ON public.user_2fa(user_id);

ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own 2FA config"
  ON public.user_2fa FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own 2FA config"
  ON public.user_2fa FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own 2FA config"
  ON public.user_2fa FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TABLE: user_connected_devices
-- Description: Appareils connectés
CREATE TABLE IF NOT EXISTS public.user_connected_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT UNIQUE,
  device_name TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('web', 'mobile', 'desktop', 'tablet')),
  browser TEXT,
  os TEXT,
  user_agent TEXT,
  ip_address INET,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_connected_devices_user_id ON public.user_connected_devices(user_id);
CREATE INDEX idx_connected_devices_last_active ON public.user_connected_devices(last_active DESC);

ALTER TABLE public.user_connected_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own devices"
  ON public.user_connected_devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert devices"
  ON public.user_connected_devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own devices"
  ON public.user_connected_devices FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update device last_active"
  ON public.user_connected_devices FOR UPDATE USING (auth.uid() = user_id);

-- TABLE: user_session_logs
-- Description: Logs des sessions
CREATE TABLE IF NOT EXISTS public.user_session_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  device_id UUID REFERENCES public.user_connected_devices(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  logout_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_session_logs_user_id ON public.user_session_logs(user_id);
CREATE INDEX idx_session_logs_is_active ON public.user_session_logs(is_active);
CREATE INDEX idx_session_logs_login_at ON public.user_session_logs(login_at DESC);

ALTER TABLE public.user_session_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sessions"
  ON public.user_session_logs FOR SELECT USING (auth.uid() = user_id);

-- TABLE: user_activity
-- Description: Historique complet des activités
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'view', 'create', 'edit', 'delete', 'download', 'upload',
    'share', 'export', 'import', 'search', 'filter', 'like',
    'comment', 'login', 'logout', 'settings_change'
  )),
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  resource_title TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_action ON public.user_activity(action);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX idx_user_activity_resource ON public.user_activity(resource_type, resource_id);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own activity"
  ON public.user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity"
  ON public.user_activity FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PHASE 3: COLLABORATION ET SOCIAL
-- ============================================================================

-- TABLE: user_playlists
-- Description: Playlists utilisateur (standard et collaboratives)
CREATE TABLE IF NOT EXISTS public.user_playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  song_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  is_collaborative BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  total_duration INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT non_empty_name CHECK (length(trim(name)) > 0)
);

CREATE INDEX idx_playlists_user_id ON public.user_playlists(user_id);
CREATE INDEX idx_playlists_is_collaborative ON public.user_playlists(is_collaborative);
CREATE INDEX idx_playlists_created_at ON public.user_playlists(created_at DESC);

ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public playlists"
  ON public.user_playlists FOR SELECT USING (is_public OR auth.uid() = user_id);
CREATE POLICY "Users can create playlists"
  ON public.user_playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update their playlists"
  ON public.user_playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete their playlists"
  ON public.user_playlists FOR DELETE USING (auth.uid() = user_id);

-- TABLE: playlist_collaborators
-- Description: Collaborateurs des playlists
CREATE TABLE IF NOT EXISTS public.playlist_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.user_playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_name TEXT,
  user_avatar TEXT,
  permission TEXT NOT NULL DEFAULT 'edit' CHECK (permission IN ('view', 'edit', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(playlist_id, user_id)
);

CREATE INDEX idx_playlist_collab_playlist_id ON public.playlist_collaborators(playlist_id);
CREATE INDEX idx_playlist_collab_user_id ON public.playlist_collaborators(user_id);

ALTER TABLE public.playlist_collaborators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborators can view their playlists"
  ON public.playlist_collaborators FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = (
    SELECT user_id FROM public.user_playlists WHERE id = playlist_id
  ));
CREATE POLICY "Playlist owner can manage collaborators"
  ON public.playlist_collaborators FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT user_id FROM public.user_playlists WHERE id = playlist_id
  ));

-- TABLE: playlist_activity
-- Description: Activité des playlists collaboratives
CREATE TABLE IF NOT EXISTS public.playlist_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.user_playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  action TEXT NOT NULL CHECK (action IN (
    'created', 'added_song', 'removed_song', 'edited', 'shared', 'comment'
  )),
  resource_type TEXT,
  resource_id TEXT,
  resource_title TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_playlist_activity_playlist_id ON public.playlist_activity(playlist_id);
CREATE INDEX idx_playlist_activity_user_id ON public.playlist_activity(user_id);
CREATE INDEX idx_playlist_activity_created_at ON public.playlist_activity(created_at DESC);

ALTER TABLE public.playlist_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborators can view activity"
  ON public.playlist_activity FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM public.playlist_collaborators WHERE playlist_id = playlist_id
  ) OR auth.uid() = (
    SELECT user_id FROM public.user_playlists WHERE id = playlist_id
  ));

-- TABLE: product_reviews
-- Description: Avis produits
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  helpful_count INT DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT non_empty_title CHECK (length(trim(title)) > 0),
  CONSTRAINT non_empty_content CHECK (length(trim(content)) > 0)
);

CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON public.product_reviews(rating);
CREATE INDEX idx_product_reviews_created_at ON public.product_reviews(created_at DESC);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved reviews"
  ON public.product_reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Users can create reviews"
  ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews"
  ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews"
  ON public.product_reviews FOR DELETE USING (auth.uid() = user_id);

-- TABLE: review_votes
-- Description: Votes utiles sur les avis
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(review_id, user_id)
);

CREATE INDEX idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX idx_review_votes_user_id ON public.review_votes(user_id);

ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view votes"
  ON public.review_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on reviews"
  ON public.review_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TABLE: conversations
-- Description: Conversations de messagerie directe
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_ids UUID[] NOT NULL,
  participant_names TEXT[] NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_conversations_participant_ids ON public.conversations USING GIN (participant_ids);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view conversations they participate in"
  ON public.conversations FOR SELECT
  USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));
CREATE POLICY "Participants can update conversation"
  ON public.conversations FOR UPDATE USING (auth.uid() = ANY(participant_ids));

-- TABLE: direct_messages
-- Description: Messages directs
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT non_empty_content CHECK (length(trim(content)) > 0)
);

CREATE INDEX idx_direct_messages_conversation_id ON public.direct_messages(conversation_id);
CREATE INDEX idx_direct_messages_sender_id ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at DESC);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversation participants can view messages"
  ON public.direct_messages FOR SELECT
  USING (auth.uid() = ANY(
    SELECT participant_ids FROM public.conversations WHERE id = conversation_id
  ));
CREATE POLICY "Users can send messages"
  ON public.direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can delete their own messages"
  ON public.direct_messages FOR DELETE USING (auth.uid() = sender_id);

-- ============================================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction: Auto-increment helpful_count pour reviews
CREATE OR REPLACE FUNCTION public.increment_review_helpful()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote_type = 'helpful' THEN
    UPDATE public.product_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF NEW.vote_type = 'not_helpful' THEN
    UPDATE public.product_reviews
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = NEW.review_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_review_helpful_trigger
AFTER INSERT OR UPDATE ON public.review_votes
FOR EACH ROW
EXECUTE FUNCTION public.increment_review_helpful();

-- Fonction: Log activité utilisateur
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_resource_title TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_activity (
    user_id, action, resource_type, resource_id, resource_title, metadata, created_at
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_resource_title,
    p_metadata,
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: RPC pour incrémenter helpful votes
CREATE OR REPLACE FUNCTION public.increment_helpful_votes(review_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.product_reviews
  SET helpful_count = helpful_count + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction: RPC pour récupérer rating moyen
CREATE OR REPLACE FUNCTION public.get_product_rating(product_id TEXT)
RETURNS TABLE (
  total_reviews INT,
  average_rating NUMERIC,
  rating_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT as total_reviews,
    ROUND(AVG(rating)::NUMERIC, 2) as average_rating,
    jsonb_object_agg(rating::TEXT, count) as rating_distribution
  FROM (
    SELECT rating, COUNT(*) as count
    FROM public.product_reviews
    WHERE product_reviews.product_id = $1 AND status = 'approved'
    GROUP BY rating
  ) as ratings;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Cleanup des conversations inactives (optionnel - cron job)
CREATE OR REPLACE FUNCTION public.cleanup_inactive_conversations()
RETURNS void AS $$
BEGIN
  -- Pas de suppression, juste marquage en archive si nécessaire
  -- À implémenter selon les politiques de rétention
  NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VUES UTILES
-- ============================================================================

-- Vue: Résumé activités utilisateur
CREATE OR REPLACE VIEW public.user_activity_summary AS
SELECT
  user_id,
  COUNT(*) as total_activities,
  COUNT(DISTINCT action) as action_types,
  MAX(created_at) as last_activity,
  MIN(created_at) as first_activity
FROM public.user_activity
GROUP BY user_id;

-- Vue: Playlists collaboratives avec participant count
CREATE OR REPLACE VIEW public.collaborative_playlists_summary AS
SELECT
  up.id,
  up.user_id,
  up.name,
  up.song_ids,
  COUNT(pc.id) + 1 as total_participants,
  MAX(pa.created_at) as last_activity,
  up.created_at
FROM public.user_playlists up
LEFT JOIN public.playlist_collaborators pc ON up.id = pc.playlist_id
LEFT JOIN public.playlist_activity pa ON up.id = pa.playlist_id
WHERE up.is_collaborative = TRUE
GROUP BY up.id, up.user_id, up.name, up.song_ids, up.created_at;

-- ============================================================================
-- GRANTS & PERMISSIONS
-- ============================================================================

-- Accorder l'accès aux fonctions RPC aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_rating TO authenticated;

-- ============================================================================
-- ÉTAPES SUIVANTES
-- ============================================================================

/*

1. Exécuter ce script dans Supabase > SQL Editor

2. Vérifier les tables:
   SELECT * FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

3. Vérifier les RLS:
   SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

4. Tester les politiques avec différents utilisateurs

5. Créer les types TypeScript dans src/types/database.ts

6. Configurer les webhooks Supabase pour les notifications en temps réel

7. Mettre en place les cron jobs pour les cleanup (optionnel)

8. Configurer les backups automatiques

*/
