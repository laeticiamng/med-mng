-- =====================================================
-- APPLICATION LOGS TABLE
-- =====================================================
-- Centralized logging for frontend errors and warnings
--
-- Purpose: Store application logs for debugging and monitoring
-- Impact: Better error tracking, debugging, and user support
--
-- Created: 2025-11-16
-- Tables: 1 (application_logs)
-- RLS Policies: 3
-- =====================================================

-- =====================================================
-- 1. APPLICATION LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.application_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Log details
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Context
  context JSONB, -- {component, user_id, session_id, etc.}
  data JSONB, -- Additional log data
  stack TEXT, -- Error stack trace

  -- Metadata
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  url TEXT,
  ip_address INET,

  -- Indexing
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_application_logs_level
  ON public.application_logs(level, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_application_logs_user
  ON public.application_logs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_application_logs_timestamp
  ON public.application_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_application_logs_context
  ON public.application_logs USING gin(context);

CREATE INDEX IF NOT EXISTS idx_application_logs_errors
  ON public.application_logs(created_at DESC)
  WHERE level = 'error';

COMMENT ON TABLE public.application_logs IS 'Frontend application logs for debugging and monitoring';
COMMENT ON COLUMN public.application_logs.context IS 'JSONB context: {component, user_id, session_id, etc.}';
COMMENT ON COLUMN public.application_logs.stack IS 'Error stack trace for debugging';

-- =====================================================
-- 2. RLS POLICIES
-- =====================================================

ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own logs
CREATE POLICY "Users insert own logs"
  ON public.application_logs
  FOR INSERT
  WITH CHECK (true); -- Allow anonymous logging for error tracking

-- Users can view their own logs
CREATE POLICY "Users view own logs"
  ON public.application_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all logs
CREATE POLICY "Admins view all logs"
  ON public.application_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- Admins can delete old logs
CREATE POLICY "Admins delete logs"
  ON public.application_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- =====================================================
-- 3. AUTO-CLEANUP OLD LOGS
-- =====================================================
-- Delete logs older than 30 days

CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM public.application_logs
  WHERE created_at < now() - INTERVAL '30 days'
    AND level IN ('debug', 'info');

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_logs IS 'Deletes debug/info logs older than 30 days (run via cron)';

-- =====================================================
-- 4. LOG STATISTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW log_statistics AS
SELECT
  level,
  COUNT(*) as count,
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(DISTINCT user_id) as unique_users
FROM public.application_logs
WHERE created_at > now() - INTERVAL '24 hours'
GROUP BY level, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

COMMENT ON VIEW log_statistics IS 'Hourly log statistics for the last 24 hours';

-- =====================================================
-- 5. HELPER FUNCTION: GET ERROR SUMMARY
-- =====================================================

CREATE OR REPLACE FUNCTION get_error_summary(
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  error_message TEXT,
  count BIGINT,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  affected_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.message,
    COUNT(*) as count,
    MIN(l.created_at) as first_seen,
    MAX(l.created_at) as last_seen,
    COUNT(DISTINCT l.user_id) as affected_users
  FROM public.application_logs l
  WHERE l.level = 'error'
    AND l.created_at > now() - (p_hours || ' hours')::INTERVAL
  GROUP BY l.message
  ORDER BY count DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_error_summary(INTEGER) TO authenticated;

COMMENT ON FUNCTION get_error_summary IS 'Returns top errors from the last N hours';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'application_logs'
  ) THEN
    RAISE EXCEPTION 'Application logs table not created';
  END IF;

  RAISE NOTICE '✅ Application logs system created successfully';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- ✅ 1 table for application logging
-- ✅ 4 RLS policies for security
-- ✅ 1 cleanup function
-- ✅ 1 statistics view
-- ✅ 1 helper function for error summary
-- ✅ Indexes for performance
-- =====================================================
