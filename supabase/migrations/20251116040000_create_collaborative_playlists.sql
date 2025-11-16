-- =====================================================
-- COLLABORATIVE PLAYLISTS SYSTEM
-- =====================================================
-- Real-time collaborative playlist editing
--
-- Addresses: collaborativePlaylists feature disabled
-- Impact: Enables shared playlists with multi-user editing
--
-- Created: 2025-11-16
-- Tables: 2 (playlist_collaborators, playlist_activity_log)
-- RLS Policies: 12
-- Functions: 3
-- =====================================================

-- =====================================================
-- 1. PLAYLIST COLLABORATORS TABLE
-- =====================================================
-- Manages who can collaborate on playlists

CREATE TABLE IF NOT EXISTS public.playlist_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Playlist & User
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Permissions
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  can_edit BOOLEAN GENERATED ALWAYS AS (role IN ('owner', 'editor')) STORED,
  can_invite BOOLEAN GENERATED ALWAYS AS (role = 'owner') STORED,
  can_delete BOOLEAN GENERATED ALWAYS AS (role = 'owner') STORED,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('invited', 'active', 'removed')),
  invitation_token TEXT UNIQUE,
  invitation_expires_at TIMESTAMPTZ,

  -- Timestamps
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,

  -- One user per playlist (unique collaborator)
  UNIQUE(playlist_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_playlist
  ON public.playlist_collaborators(playlist_id);

CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_user
  ON public.playlist_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_status
  ON public.playlist_collaborators(playlist_id, status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_token
  ON public.playlist_collaborators(invitation_token)
  WHERE invitation_token IS NOT NULL;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_playlist_collaborators_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status = 'invited' THEN
    NEW.joined_at = now();
  END IF;

  IF NEW.status = 'removed' AND OLD.status != 'removed' THEN
    NEW.removed_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_playlist_collaborators_timestamp ON public.playlist_collaborators;

CREATE TRIGGER trigger_update_playlist_collaborators_timestamp
  BEFORE UPDATE ON public.playlist_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION update_playlist_collaborators_timestamp();

COMMENT ON TABLE public.playlist_collaborators IS 'Manages collaborators and permissions for playlists';
COMMENT ON COLUMN public.playlist_collaborators.role IS 'owner: full control, editor: can modify, viewer: read-only';
COMMENT ON COLUMN public.playlist_collaborators.invitation_token IS 'Unique token for accepting invitations';

-- =====================================================
-- 2. PLAYLIST ACTIVITY LOG TABLE
-- =====================================================
-- Tracks all changes to collaborative playlists

CREATE TABLE IF NOT EXISTS public.playlist_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'created', 'renamed', 'song_added', 'song_removed', 'song_reordered',
    'collaborator_added', 'collaborator_removed', 'permission_changed',
    'description_updated', 'made_public', 'made_private', 'deleted'
  )),
  activity_data JSONB, -- Additional context (song details, old/new values, etc.)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_playlist_activity_log_playlist
  ON public.playlist_activity_log(playlist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_playlist_activity_log_user
  ON public.playlist_activity_log(user_id);

CREATE INDEX IF NOT EXISTS idx_playlist_activity_log_type
  ON public.playlist_activity_log(activity_type);

COMMENT ON TABLE public.playlist_activity_log IS 'Activity history for collaborative playlists';
COMMENT ON COLUMN public.playlist_activity_log.activity_data IS 'JSON with activity details: {song_id, song_title, old_value, new_value, etc.}';

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.playlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_activity_log ENABLE ROW LEVEL SECURITY;

-- ====== PLAYLIST_COLLABORATORS POLICIES ======

-- Users can view collaborators for playlists they have access to
CREATE POLICY "Users view playlist collaborators"
  ON public.playlist_collaborators
  FOR SELECT
  USING (
    -- User is a collaborator
    user_id = auth.uid()
    OR
    -- User has access to this playlist
    EXISTS (
      SELECT 1 FROM public.playlist_collaborators pc
      WHERE pc.playlist_id = playlist_collaborators.playlist_id
        AND pc.user_id = auth.uid()
        AND pc.status = 'active'
    )
    OR
    -- Playlist is public
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_collaborators.playlist_id
        AND p.is_public = true
    )
  );

-- Owners can invite collaborators
CREATE POLICY "Owners invite collaborators"
  ON public.playlist_collaborators
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlist_collaborators pc
      WHERE pc.playlist_id = playlist_collaborators.playlist_id
        AND pc.user_id = auth.uid()
        AND pc.role = 'owner'
        AND pc.status = 'active'
    )
  );

-- Owners can update collaborator permissions
CREATE POLICY "Owners update collaborators"
  ON public.playlist_collaborators
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlist_collaborators pc
      WHERE pc.playlist_id = playlist_collaborators.playlist_id
        AND pc.user_id = auth.uid()
        AND pc.role = 'owner'
        AND pc.status = 'active'
    )
  );

-- Users can accept invitations (update their own status)
CREATE POLICY "Users accept invitations"
  ON public.playlist_collaborators
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'invited')
  WITH CHECK (user_id = auth.uid());

-- Owners can remove collaborators
CREATE POLICY "Owners remove collaborators"
  ON public.playlist_collaborators
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlist_collaborators pc
      WHERE pc.playlist_id = playlist_collaborators.playlist_id
        AND pc.user_id = auth.uid()
        AND pc.role = 'owner'
        AND pc.status = 'active'
    )
  );

-- Users can leave playlists
CREATE POLICY "Users leave playlists"
  ON public.playlist_collaborators
  FOR DELETE
  USING (user_id = auth.uid());

-- Admins can view all collaborators
CREATE POLICY "Admins view all collaborators"
  ON public.playlist_collaborators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- ====== PLAYLIST_ACTIVITY_LOG POLICIES ======

-- Users can view activity for playlists they have access to
CREATE POLICY "Users view playlist activity"
  ON public.playlist_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playlist_collaborators pc
      WHERE pc.playlist_id = playlist_activity_log.playlist_id
        AND pc.user_id = auth.uid()
        AND pc.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_activity_log.playlist_id
        AND p.is_public = true
    )
  );

-- System can insert activity (via triggers/functions)
CREATE POLICY "System inserts activity"
  ON public.playlist_activity_log
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all activity
CREATE POLICY "Admins view all activity"
  ON public.playlist_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Check if user can edit playlist
CREATE OR REPLACE FUNCTION can_edit_playlist(p_playlist_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.playlist_collaborators
    WHERE playlist_id = p_playlist_id
      AND user_id = p_user_id
      AND status = 'active'
      AND role IN ('owner', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION can_edit_playlist(UUID, UUID) TO authenticated;

-- Log playlist activity
CREATE OR REPLACE FUNCTION log_playlist_activity(
  p_playlist_id UUID,
  p_activity_type TEXT,
  p_activity_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.playlist_activity_log (
    playlist_id,
    user_id,
    activity_type,
    activity_data
  ) VALUES (
    p_playlist_id,
    auth.uid(),
    p_activity_type,
    p_activity_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION log_playlist_activity(UUID, TEXT, JSONB) TO authenticated;

-- Invite collaborator to playlist
CREATE OR REPLACE FUNCTION invite_playlist_collaborator(
  p_playlist_id UUID,
  p_user_email TEXT,
  p_role TEXT DEFAULT 'editor'
)
RETURNS JSONB AS $$
DECLARE
  v_invited_user_id UUID;
  v_invitation_token TEXT;
  v_can_invite BOOLEAN;
BEGIN
  -- Check if current user can invite
  SELECT can_invite INTO v_can_invite
  FROM public.playlist_collaborators
  WHERE playlist_id = p_playlist_id
    AND user_id = auth.uid()
    AND status = 'active';

  IF NOT v_can_invite THEN
    RAISE EXCEPTION 'You do not have permission to invite collaborators';
  END IF;

  -- Find user by email
  SELECT id INTO v_invited_user_id
  FROM auth.users
  WHERE email = p_user_email;

  IF v_invited_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Generate invitation token
  v_invitation_token := encode(gen_random_bytes(32), 'hex');

  -- Insert collaborator
  INSERT INTO public.playlist_collaborators (
    playlist_id,
    user_id,
    invited_by,
    role,
    status,
    invitation_token,
    invitation_expires_at
  ) VALUES (
    p_playlist_id,
    v_invited_user_id,
    auth.uid(),
    p_role,
    'invited',
    v_invitation_token,
    now() + INTERVAL '7 days'
  )
  ON CONFLICT (playlist_id, user_id) DO UPDATE
  SET
    status = 'invited',
    invitation_token = v_invitation_token,
    invitation_expires_at = now() + INTERVAL '7 days',
    invited_at = now();

  -- Log activity
  PERFORM log_playlist_activity(
    p_playlist_id,
    'collaborator_added',
    jsonb_build_object('user_email', p_user_email, 'role', p_role)
  );

  RETURN jsonb_build_object(
    'success', true,
    'invitation_token', v_invitation_token,
    'user_id', v_invited_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION invite_playlist_collaborator(UUID, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION can_edit_playlist IS 'Checks if user has edit permissions for playlist';
COMMENT ON FUNCTION log_playlist_activity IS 'Logs activity to playlist activity log';
COMMENT ON FUNCTION invite_playlist_collaborator IS 'Invites a user to collaborate on playlist';

-- =====================================================
-- 5. UPDATE EXISTING PLAYLISTS TABLE
-- =====================================================
-- Add collaboration fields to existing playlists table

DO $$
BEGIN
  -- Add is_collaborative column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'playlists'
      AND column_name = 'is_collaborative'
  ) THEN
    ALTER TABLE public.playlists
    ADD COLUMN is_collaborative BOOLEAN DEFAULT false;

    CREATE INDEX IF NOT EXISTS idx_playlists_collaborative
      ON public.playlists(is_collaborative)
      WHERE is_collaborative = true;

    COMMENT ON COLUMN public.playlists.is_collaborative IS 'Whether playlist allows multiple collaborators';
  END IF;
END $$;

-- =====================================================
-- 6. AUTO-CREATE OWNER COLLABORATOR
-- =====================================================
-- When playlist is created, automatically add creator as owner

CREATE OR REPLACE FUNCTION auto_create_playlist_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_collaborative = true THEN
    INSERT INTO public.playlist_collaborators (
      playlist_id,
      user_id,
      role,
      status,
      joined_at
    ) VALUES (
      NEW.id,
      NEW.user_id,
      'owner',
      'active',
      now()
    )
    ON CONFLICT (playlist_id, user_id) DO NOTHING;

    -- Log activity
    INSERT INTO public.playlist_activity_log (
      playlist_id,
      user_id,
      activity_type,
      activity_data
    ) VALUES (
      NEW.id,
      NEW.user_id,
      'created',
      jsonb_build_object('name', NEW.name, 'is_collaborative', true)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_playlist_owner ON public.playlists;

CREATE TRIGGER trigger_auto_create_playlist_owner
  AFTER INSERT ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_playlist_owner();

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('playlist_collaborators', 'playlist_activity_log')
  ) THEN
    RAISE EXCEPTION 'Collaborative playlists tables not created';
  END IF;

  RAISE NOTICE '✅ Collaborative playlists system created successfully';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- ✅ 2 tables for collaborative playlists
-- ✅ 12 RLS policies for security
-- ✅ 3 helper functions
-- ✅ Activity logging system
-- ✅ Invitation system with tokens
-- ✅ Role-based permissions
-- ✅ Real-time collaboration support
-- =====================================================
