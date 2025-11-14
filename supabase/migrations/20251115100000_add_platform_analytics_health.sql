-- Phase 6 System #6: Platform Analytics & Health System

-- Platform Health Metrics Table
CREATE TABLE IF NOT EXISTS platform_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  metric_hour INTEGER, -- 0-23 for hourly metrics

  -- API Health
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  avg_response_time_ms DECIMAL(10, 2),
  p95_response_time_ms DECIMAL(10, 2),
  p99_response_time_ms DECIMAL(10, 2),

  -- Database Health
  db_connection_count INTEGER DEFAULT 0,
  db_query_count INTEGER DEFAULT 0,
  avg_query_time_ms DECIMAL(10, 2),
  slow_queries INTEGER DEFAULT 0,

  -- System Resources
  cpu_usage_percent DECIMAL(5, 2),
  memory_usage_percent DECIMAL(5, 2),
  storage_usage_percent DECIMAL(5, 2),

  -- Error Tracking
  total_errors INTEGER DEFAULT 0,
  error_types JSONB, -- Count by error type

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(metric_date, metric_hour)
);

-- User Activity Analytics Table
CREATE TABLE IF NOT EXISTS user_activity_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_date DATE NOT NULL,

  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  churned_users INTEGER DEFAULT 0,

  total_sessions INTEGER DEFAULT 0,
  avg_session_duration_minutes DECIMAL(10, 2),

  page_views INTEGER DEFAULT 0,
  feature_usage JSONB, -- Count by feature

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(activity_date)
);

-- Content Analytics Table
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analytics_date DATE NOT NULL,

  total_posts INTEGER DEFAULT 0,
  new_posts INTEGER DEFAULT 0,
  deleted_posts INTEGER DEFAULT 0,

  total_comments INTEGER DEFAULT 0,
  new_comments INTEGER DEFAULT 0,

  total_likes INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,

  engagement_rate DECIMAL(5, 2),
  content_categories JSONB, -- Count by category

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(analytics_date)
);

-- Performance Trends Table
CREATE TABLE IF NOT EXISTS performance_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_date DATE NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15, 2),
  trend_direction VARCHAR(20), -- 'up', 'down', 'stable'
  change_percent DECIMAL(5, 2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(trend_date, metric_name)
);

-- System Alerts Table
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(100) NOT NULL, -- 'high_error_rate', 'slow_response', 'high_cpu', 'db_slowdown', etc.
  severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  affected_metric VARCHAR(100),
  threshold_exceeded DECIMAL(15, 2),
  actual_value DECIMAL(15, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_metrics_date ON platform_health_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_health_metrics_hour ON platform_health_metrics(metric_date, metric_hour);
CREATE INDEX IF NOT EXISTS idx_activity_analytics_date ON user_activity_analytics(activity_date);
CREATE INDEX IF NOT EXISTS idx_content_analytics_date ON content_analytics(analytics_date);
CREATE INDEX IF NOT EXISTS idx_performance_trends_date ON performance_trends(trend_date);
CREATE INDEX IF NOT EXISTS idx_performance_trends_metric ON performance_trends(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created ON system_alerts(created_at);

-- Enable RLS
ALTER TABLE platform_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only
CREATE POLICY "health_metrics_admin_access" ON platform_health_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'))
  );

CREATE POLICY "activity_analytics_admin_access" ON user_activity_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'))
  );

CREATE POLICY "content_analytics_admin_access" ON content_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'))
  );

CREATE POLICY "performance_trends_admin_access" ON performance_trends
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'))
  );

CREATE POLICY "system_alerts_admin_access" ON system_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'))
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER system_alerts_updated_at
BEFORE UPDATE ON system_alerts
FOR EACH ROW
EXECUTE FUNCTION update_analytics_updated_at();
