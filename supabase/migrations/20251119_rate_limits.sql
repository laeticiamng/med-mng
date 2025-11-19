-- 🔒 Rate Limiting Table
-- Tracks API usage per user/endpoint to prevent abuse

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Composite key: user_id:endpoint
  key TEXT NOT NULL,

  -- User identifier
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Endpoint identifier (e.g., 'openai-chat', 'suno-music', 'dall-e-image')
  endpoint TEXT NOT NULL,

  -- Number of requests in current window
  count INTEGER NOT NULL DEFAULT 1,

  -- Time window boundaries
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,

  -- Maximum allowed requests in window
  limit INTEGER NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Indexes for fast lookups
  CONSTRAINT rate_limits_key_window_unique UNIQUE (key, window_start)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS rate_limits_key_idx ON rate_limits(key);
CREATE INDEX IF NOT EXISTS rate_limits_user_id_idx ON rate_limits(user_id);
CREATE INDEX IF NOT EXISTS rate_limits_endpoint_idx ON rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx ON rate_limits(window_start);
CREATE INDEX IF NOT EXISTS rate_limits_window_end_idx ON rate_limits(window_end);

-- Composite index for most common query pattern
CREATE INDEX IF NOT EXISTS rate_limits_key_window_idx
  ON rate_limits(key, window_start DESC);

-- Enable Row Level Security
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own rate limits
CREATE POLICY "Users can view own rate limits"
  ON rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (from Edge Functions)
-- No policy needed as Edge Functions use service role key

-- Admin users can view all rate limits
CREATE POLICY "Admins can view all rate limits"
  ON rate_limits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Auto cleanup function (optional - run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete records older than 24 hours
  DELETE FROM rate_limits
  WHERE window_end < (NOW() - INTERVAL '24 hours');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

-- Comment on table
COMMENT ON TABLE rate_limits IS 'Rate limiting records for API endpoints to prevent abuse of costly APIs (OpenAI, Suno, DALL-E)';

-- Comment on columns
COMMENT ON COLUMN rate_limits.key IS 'Composite key: user_id:endpoint for fast lookups';
COMMENT ON COLUMN rate_limits.endpoint IS 'API endpoint identifier (openai-chat, suno-music, dall-e-image, etc.)';
COMMENT ON COLUMN rate_limits.count IS 'Number of requests made in current time window';
COMMENT ON COLUMN rate_limits.window_start IS 'Start of the rate limit time window';
COMMENT ON COLUMN rate_limits.window_end IS 'End of the rate limit time window';
COMMENT ON COLUMN rate_limits.limit IS 'Maximum allowed requests in the time window';
