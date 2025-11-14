-- API Developer Portal Migration
-- Enables API key management, webhook handling, and developer documentation

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL UNIQUE, -- Public prefix like "pk_live_abc123"
  key_hash VARCHAR(255) NOT NULL UNIQUE, -- Hashed full key for secure storage
  description TEXT,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  scopes TEXT[] DEFAULT ARRAY['read', 'write'], -- Array of permission scopes
  rate_limit INT DEFAULT 1000, -- Requests per minute
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_usage_logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE, PATCH
  status_code INT,
  response_time_ms INT,
  request_size INT, -- Bytes
  response_size INT, -- Bytes
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  events TEXT[] NOT NULL, -- Array of events to subscribe to
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  secret_token VARCHAR(255), -- For webhook signature verification
  headers JSONB DEFAULT '{}', -- Custom headers to send
  retry_policy VARCHAR(50) DEFAULT 'exponential', -- none, fixed, exponential
  max_retries INT DEFAULT 3,
  timeout_seconds INT DEFAULT 30,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_succeeded_at TIMESTAMP WITH TIME ZONE,
  failure_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- event.created, event.updated, etc.
  payload JSONB NOT NULL, -- Full event payload
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, sent, failed, success
  response_status_code INT,
  response_body TEXT,
  error_message TEXT,
  attempts INT DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_documentation table
CREATE TABLE IF NOT EXISTS api_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR(100) NOT NULL, -- authentication, events, teams, search, etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  endpoint VARCHAR(255),
  method VARCHAR(10),
  request_example JSONB,
  response_example JSONB,
  status_codes JSONB, -- {200: 'Success', 400: 'Bad Request', ...}
  error_examples JSONB,
  rate_limit INT DEFAULT 1000,
  authentication_required BOOLEAN DEFAULT true,
  version VARCHAR(20) DEFAULT 'v1',
  order_index INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_rate_limits table for tracking per-user limits
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL UNIQUE REFERENCES api_keys(id) ON DELETE CASCADE,
  requests_this_minute INT DEFAULT 0,
  requests_today INT DEFAULT 0,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_id ON webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_documentation_section ON api_documentation(section);

-- Create triggers
CREATE OR REPLACE FUNCTION update_api_keys_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_webhooks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_webhook_events_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_api_documentation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

DROP TRIGGER IF EXISTS update_api_keys_timestamp ON api_keys;
CREATE TRIGGER update_api_keys_timestamp
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_keys_timestamp();

DROP TRIGGER IF EXISTS update_webhooks_timestamp ON webhooks;
CREATE TRIGGER update_webhooks_timestamp
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_timestamp();

DROP TRIGGER IF EXISTS update_webhook_events_timestamp ON webhook_events;
CREATE TRIGGER update_webhook_events_timestamp
  BEFORE UPDATE ON webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_events_timestamp();

DROP TRIGGER IF EXISTS update_api_documentation_timestamp ON api_documentation;
CREATE TRIGGER update_api_documentation_timestamp
  BEFORE UPDATE ON api_documentation
  FOR EACH ROW
  EXECUTE FUNCTION update_api_documentation_timestamp();

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- API Keys Policies
CREATE POLICY "Users can view their own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- API Usage Logs Policies
CREATE POLICY "Users can view their own usage logs" ON api_usage_logs
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT user_id FROM api_keys WHERE id = api_key_id)
  );

CREATE POLICY "System can insert usage logs" ON api_usage_logs
  FOR INSERT WITH CHECK (true);

-- Webhooks Policies
CREATE POLICY "Users can view their own webhooks" ON webhooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create webhooks" ON webhooks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks" ON webhooks
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks" ON webhooks
  FOR DELETE USING (auth.uid() = user_id);

-- Webhook Events Policies
CREATE POLICY "Users can view webhook events" ON webhook_events
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM webhooks WHERE id = webhook_id)
  );

CREATE POLICY "System can create webhook events" ON webhook_events
  FOR INSERT WITH CHECK (true);

-- API Documentation Policies
CREATE POLICY "Anyone can view API documentation" ON api_documentation
  FOR SELECT USING (true);

-- API Rate Limits Policies
CREATE POLICY "Users can view their rate limits" ON api_rate_limits
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM api_keys WHERE id = api_key_id)
  );

-- Insert sample API documentation
INSERT INTO api_documentation (section, title, description, endpoint, method, version, order_index, authentication_required)
VALUES
  ('authentication', 'Authentication', 'All API requests require an API key in the Authorization header', NULL, NULL, 'v1', 1, false),
  ('teams', 'Get Team', 'Retrieve a specific team by ID', '/api/v1/teams/:teamId', 'GET', 'v1', 10, true),
  ('teams', 'Create Team', 'Create a new team', '/api/v1/teams', 'POST', 'v1', 11, true),
  ('teams', 'Update Team', 'Update team information', '/api/v1/teams/:teamId', 'PUT', 'v1', 12, true),
  ('teams', 'Delete Team', 'Delete a team', '/api/v1/teams/:teamId', 'DELETE', 'v1', 13, true),
  ('events', 'Get Events', 'List events for a user or team', '/api/v1/events', 'GET', 'v1', 20, true),
  ('events', 'Create Event', 'Create a new event', '/api/v1/events', 'POST', 'v1', 21, true),
  ('webhooks', 'List Webhooks', 'Get all webhooks for a user', '/api/v1/webhooks', 'GET', 'v1', 30, true),
  ('webhooks', 'Create Webhook', 'Register a new webhook endpoint', '/api/v1/webhooks', 'POST', 'v1', 31, true),
  ('webhooks', 'Test Webhook', 'Send a test event to a webhook', '/api/v1/webhooks/:webhookId/test', 'POST', 'v1', 32, true)
ON CONFLICT DO NOTHING;

COMMIT;
