-- =====================================================
-- CONNECTED DEVICES MANAGEMENT SYSTEM
-- =====================================================
-- Track and manage user sessions across devices
--
-- Addresses: connectedDevices feature disabled
-- Impact: Enhanced security, session management, device tracking
--
-- Created: 2025-11-16
-- Tables: 2 (user_devices, device_activity_log)
-- RLS Policies: 10
-- Functions: 3
-- =====================================================

-- =====================================================
-- 1. USER DEVICES TABLE
-- =====================================================
-- Tracks devices used to access the platform

CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Device Information
  device_name TEXT, -- User-friendly name (e.g., "iPhone 13", "MacBook Pro")
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'other')),
  os_name TEXT,
  os_version TEXT,
  browser_name TEXT,
  browser_version TEXT,
  device_fingerprint TEXT, -- Unique device identifier

  -- Session Information
  last_ip_address INET,
  last_user_agent TEXT,
  last_location JSONB, -- {city, country, region, etc.}

  -- Status
  is_trusted BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT false, -- Currently active device
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),

  -- Timestamps
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,

  -- Security
  trusted_at TIMESTAMPTZ,
  requires_verification BOOLEAN DEFAULT false,

  -- Unique device per user
  UNIQUE(user_id, device_fingerprint)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_devices_user
  ON public.user_devices(user_id);

CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint
  ON public.user_devices(device_fingerprint);

CREATE INDEX IF NOT EXISTS idx_user_devices_status
  ON public.user_devices(user_id, status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_devices_current
  ON public.user_devices(user_id, is_current)
  WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_user_devices_last_seen
  ON public.user_devices(last_seen_at DESC);

-- Auto-update last_seen_at
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at = now();
  NEW.last_activity_at = now();

  IF NEW.status = 'revoked' AND OLD.status != 'revoked' THEN
    NEW.revoked_at = now();
  END IF;

  IF NEW.is_trusted = true AND OLD.is_trusted = false THEN
    NEW.trusted_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_device_last_seen ON public.user_devices;

CREATE TRIGGER trigger_update_device_last_seen
  BEFORE UPDATE ON public.user_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_device_last_seen();

COMMENT ON TABLE public.user_devices IS 'Tracks user devices and sessions for security';
COMMENT ON COLUMN public.user_devices.device_fingerprint IS 'Unique identifier based on device characteristics';
COMMENT ON COLUMN public.user_devices.is_trusted IS 'Whether device is marked as trusted (skip 2FA)';
COMMENT ON COLUMN public.user_devices.last_location IS 'Approximate geographic location from IP';

-- =====================================================
-- 2. DEVICE ACTIVITY LOG TABLE
-- =====================================================
-- Logs security-relevant device activities

CREATE TABLE IF NOT EXISTS public.device_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.user_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'login', 'logout', 'failed_login', 'password_change',
    'device_trusted', 'device_revoked', 'location_change',
    'suspicious_activity', 'session_expired'
  )),
  activity_data JSONB, -- Additional context

  -- Security info
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_device_activity_log_device
  ON public.device_activity_log(device_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_device_activity_log_user
  ON public.device_activity_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_device_activity_log_type
  ON public.device_activity_log(activity_type);

CREATE INDEX IF NOT EXISTS idx_device_activity_log_suspicious
  ON public.device_activity_log(user_id, created_at DESC)
  WHERE activity_type IN ('failed_login', 'suspicious_activity');

COMMENT ON TABLE public.device_activity_log IS 'Security audit log for device activities';
COMMENT ON COLUMN public.device_activity_log.risk_score IS '0-100 risk score for the activity (100 = highest risk)';

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_activity_log ENABLE ROW LEVEL SECURITY;

-- ====== USER_DEVICES POLICIES ======

-- Users can view their own devices
CREATE POLICY "Users view own devices"
  ON public.user_devices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can register new devices
CREATE POLICY "Users register devices"
  ON public.user_devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own devices
CREATE POLICY "Users update own devices"
  ON public.user_devices
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can revoke their own devices
CREATE POLICY "Users revoke devices"
  ON public.user_devices
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all devices
CREATE POLICY "Admins view all devices"
  ON public.user_devices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- Admins can manage devices
CREATE POLICY "Admins manage devices"
  ON public.user_devices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- ====== DEVICE_ACTIVITY_LOG POLICIES ======

-- Users can view their own activity
CREATE POLICY "Users view own activity"
  ON public.device_activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert activity
CREATE POLICY "System inserts activity"
  ON public.device_activity_log
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all activity
CREATE POLICY "Admins view all activity"
  ON public.device_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- Admins can delete old activity logs
CREATE POLICY "Admins delete activity"
  ON public.device_activity_log
  FOR DELETE
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

-- Register or update device
CREATE OR REPLACE FUNCTION register_user_device(
  p_device_fingerprint TEXT,
  p_device_info JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  v_device_id UUID;
  v_device_name TEXT;
  v_device_type TEXT;
  v_os_name TEXT;
  v_browser_name TEXT;
BEGIN
  -- Extract device info from JSON
  v_device_name := p_device_info->>'device_name';
  v_device_type := p_device_info->>'device_type';
  v_os_name := p_device_info->>'os_name';
  v_browser_name := p_device_info->>'browser_name';

  -- Insert or update device
  INSERT INTO public.user_devices (
    user_id,
    device_fingerprint,
    device_name,
    device_type,
    os_name,
    os_version,
    browser_name,
    browser_version,
    last_ip_address,
    last_user_agent,
    is_current
  ) VALUES (
    auth.uid(),
    p_device_fingerprint,
    COALESCE(v_device_name, v_os_name || ' - ' || v_browser_name),
    v_device_type,
    v_os_name,
    p_device_info->>'os_version',
    v_browser_name,
    p_device_info->>'browser_version',
    (p_device_info->>'ip_address')::INET,
    p_device_info->>'user_agent',
    true
  )
  ON CONFLICT (user_id, device_fingerprint) DO UPDATE
  SET
    last_ip_address = EXCLUDED.last_ip_address,
    last_user_agent = EXCLUDED.last_user_agent,
    is_current = true,
    status = 'active'
  RETURNING id INTO v_device_id;

  -- Mark other devices as not current
  UPDATE public.user_devices
  SET is_current = false
  WHERE user_id = auth.uid()
    AND id != v_device_id;

  -- Log activity
  INSERT INTO public.device_activity_log (
    device_id,
    user_id,
    activity_type,
    ip_address,
    user_agent
  ) VALUES (
    v_device_id,
    auth.uid(),
    'login',
    (p_device_info->>'ip_address')::INET,
    p_device_info->>'user_agent'
  );

  RETURN v_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION register_user_device(TEXT, JSONB) TO authenticated;

-- Get user's devices
CREATE OR REPLACE FUNCTION get_user_devices(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  device_name TEXT,
  device_type TEXT,
  os_name TEXT,
  browser_name TEXT,
  is_current BOOLEAN,
  is_trusted BOOLEAN,
  status TEXT,
  last_seen_at TIMESTAMPTZ,
  last_location JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.device_name,
    d.device_type,
    d.os_name,
    d.browser_name,
    d.is_current,
    d.is_trusted,
    d.status,
    d.last_seen_at,
    d.last_location
  FROM public.user_devices d
  WHERE d.user_id = p_user_id
    AND d.status = 'active'
  ORDER BY d.is_current DESC, d.last_seen_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_devices(UUID) TO authenticated;

-- Revoke device
CREATE OR REPLACE FUNCTION revoke_user_device(p_device_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_owner BOOLEAN;
BEGIN
  -- Check if user owns this device
  SELECT (user_id = auth.uid()) INTO v_is_owner
  FROM public.user_devices
  WHERE id = p_device_id;

  IF NOT v_is_owner THEN
    RAISE EXCEPTION 'You do not own this device';
  END IF;

  -- Revoke device
  UPDATE public.user_devices
  SET
    status = 'revoked',
    is_current = false
  WHERE id = p_device_id;

  -- Log activity
  INSERT INTO public.device_activity_log (
    device_id,
    user_id,
    activity_type
  ) VALUES (
    p_device_id,
    auth.uid(),
    'device_revoked'
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION revoke_user_device(UUID) TO authenticated;

COMMENT ON FUNCTION register_user_device IS 'Registers or updates a user device';
COMMENT ON FUNCTION get_user_devices IS 'Returns active devices for a user';
COMMENT ON FUNCTION revoke_user_device IS 'Revokes access for a device';

-- =====================================================
-- 5. AUTO-CLEANUP OLD DEVICES
-- =====================================================
-- Mark devices as expired if not seen in 90 days

CREATE OR REPLACE FUNCTION cleanup_old_devices()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.user_devices
  SET status = 'expired'
  WHERE status = 'active'
    AND last_seen_at < now() - INTERVAL '90 days';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_devices IS 'Marks devices not seen in 90 days as expired (run via cron)';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('user_devices', 'device_activity_log')
  ) THEN
    RAISE EXCEPTION 'Connected devices tables not created';
  END IF;

  RAISE NOTICE '✅ Connected devices system created successfully';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- ✅ 2 tables for device management
-- ✅ 10 RLS policies for security
-- ✅ 3 helper functions
-- ✅ Device fingerprinting support
-- ✅ Activity logging
-- ✅ Trusted device management
-- ✅ Auto-cleanup for old devices
-- =====================================================
