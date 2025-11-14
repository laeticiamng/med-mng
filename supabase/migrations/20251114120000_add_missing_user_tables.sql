-- ============================================================================
-- Add Missing User Tables for Complete MED-MNG Platform
-- Migration: 20251114120000
-- Description: Add 9 tables for favorites, history, collections, 2FA, sessions
-- ============================================================================

-- ============================================================================
-- 1. TABLE: user_favorites
-- Description: Sauvegarde des items favoris par utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'edn', 'ecos', 'song', etc.
  item_id TEXT NOT NULL,
  item_data JSONB, -- Snapshot des données de l'item
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT valid_item_type_favorites CHECK (item_type IN ('edn', 'ecos', 'song', 'product')),
  UNIQUE(user_id, item_type, item_id)
);

-- Créer index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_item_type ON public.user_favorites(item_type);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. TABLE: user_viewing_history
-- Description: Historique de consultation des items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_viewing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'edn', 'ecos', 'song', etc.
  item_id TEXT NOT NULL,
  item_title TEXT,
  duration_seconds INT DEFAULT 0,
  scroll_depth INT, -- Pourcentage scrolled (0-100)
  completed BOOLEAN DEFAULT FALSE,
  view_source TEXT, -- 'direct', 'search', 'recommendation', etc.
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT valid_item_type_history CHECK (item_type IN ('edn', 'ecos', 'song', 'product')),
  CONSTRAINT valid_scroll_depth CHECK (scroll_depth >= 0 AND scroll_depth <= 100)
);

-- Créer index
CREATE INDEX IF NOT EXISTS idx_viewing_history_user_id ON public.user_viewing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_item_type ON public.user_viewing_history(item_type);
CREATE INDEX IF NOT EXISTS idx_viewing_history_viewed_at ON public.user_viewing_history(viewed_at DESC);

-- RLS
ALTER TABLE public.user_viewing_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own history"
  ON public.user_viewing_history FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own history"
  ON public.user_viewing_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. TABLE: user_activity
-- Description: Log détaillé de toutes les activités utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'view', 'create', 'edit', 'delete', 'download', etc.
  resource_type TEXT NOT NULL, -- 'edn_item', 'playlist', 'profile', etc.
  resource_id TEXT,
  resource_name TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Données additionnelles
  status TEXT DEFAULT 'success', -- 'success', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT valid_action CHECK (action IN (
    'view', 'create', 'edit', 'delete', 'download', 'upload',
    'share', 'export', 'import', 'search', 'filter', 'like',
    'comment', 'login', 'logout', 'settings_change'
  )),
  CONSTRAINT valid_status CHECK (status IN ('success', 'failed'))
);

-- Créer index
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON public.user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_resource ON public.user_activity(resource_type, resource_id);

-- RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 4. TABLE: user_2fa
-- Description: Configuration Two-Factor Authentication
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_2fa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  secret_encrypted TEXT NOT NULL, -- Clé secrète TOTP (chiffrée)
  backup_codes TEXT[] NOT NULL, -- Codes de secours (chiffrés)
  enabled BOOLEAN DEFAULT FALSE,
  backup_codes_used TEXT[] DEFAULT ARRAY[]::TEXT[], -- Codes utilisés
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own 2FA config"
  ON public.user_2fa FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own 2FA config"
  ON public.user_2fa FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. TABLE: user_connected_devices
-- Description: Gestion des appareils connectés
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_connected_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT, -- 'web', 'mobile', 'desktop'
  device_os TEXT,
  browser_name TEXT,
  browser_version TEXT,
  ip_address INET,
  user_agent TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT valid_device_type CHECK (device_type IN ('web', 'mobile', 'desktop'))
);

-- Créer index
CREATE INDEX IF NOT EXISTS idx_connected_devices_user_id ON public.user_connected_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_devices_last_active ON public.user_connected_devices(last_active DESC);

-- RLS
ALTER TABLE public.user_connected_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own devices"
  ON public.user_connected_devices FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own devices"
  ON public.user_connected_devices FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. TABLE: user_session_logs
-- Description: Log des sessions utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_session_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  device_id UUID REFERENCES public.user_connected_devices(id) ON DELETE SET NULL,
  ip_address INET,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  logout_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'revoked'

  CONSTRAINT valid_status_session CHECK (status IN ('active', 'expired', 'revoked', 'logged_out'))
);

-- Créer index
CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON public.user_session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_status ON public.user_session_logs(status);
CREATE INDEX IF NOT EXISTS idx_session_logs_login_at ON public.user_session_logs(login_at DESC);

-- RLS
ALTER TABLE public.user_session_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sessions"
  ON public.user_session_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. TABLE: user_collections
-- Description: Collections personnalisées d'items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Couleur pour identifier la collection
  is_public BOOLEAN DEFAULT FALSE,
  item_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT non_empty_name CHECK (length(trim(name)) > 0)
);

-- Créer index
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON public.user_collections(created_at DESC);

-- RLS
ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view public collections or their own"
  ON public.user_collections FOR SELECT
  USING (is_public OR auth.uid() = user_id);
CREATE POLICY "Users can create collections"
  ON public.user_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collections"
  ON public.user_collections FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own collections"
  ON public.user_collections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 8. TABLE: collection_items
-- Description: Items dans les collections
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.user_collections(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_data JSONB,
  position INT, -- Pour l'ordre personnalisé
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(collection_id, item_type, item_id)
);

-- Créer index
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);

-- ============================================================================
-- 9. TABLE: export_jobs
-- Description: Suivi des jobs d'export
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.export_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL, -- 'csv', 'excel', 'pdf', 'json'
  resource_type TEXT NOT NULL, -- 'edn_items', 'analytics', 'all_data'
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  file_url TEXT,
  file_size INT, -- En bytes
  row_count INT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- Suppression auto fichier

  CONSTRAINT valid_export_type CHECK (export_type IN ('csv', 'excel', 'pdf', 'json')),
  CONSTRAINT valid_status_export CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Créer index
CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON public.export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON public.export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_created_at ON public.export_jobs(created_at DESC);

-- RLS
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own exports"
  ON public.export_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- FONCTIONS & TRIGGERS
-- ============================================================================

-- Fonction: Mettre à jour user_collections.item_count
CREATE OR REPLACE FUNCTION public.update_collection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_collections
    SET item_count = item_count + 1,
        updated_at = now()
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_collections
    SET item_count = GREATEST(item_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Automatiser la mise à jour du count
CREATE TRIGGER update_collection_count_trigger
AFTER INSERT OR DELETE ON public.collection_items
FOR EACH ROW
EXECUTE FUNCTION public.update_collection_count();

-- Fonction: Nettoyer les fichiers d'export expirés
CREATE OR REPLACE FUNCTION public.cleanup_expired_exports()
RETURNS void AS $$
BEGIN
  DELETE FROM public.export_jobs
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$ LANGUAGE plpgsql;
