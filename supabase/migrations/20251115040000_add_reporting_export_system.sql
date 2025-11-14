-- Reporting & Data Export System
-- Enables report generation and user data exports

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- 'activity', 'analytics', 'gamification', 'wellness', 'custom'
  description TEXT,
  date_range_start DATE,
  date_range_end DATE,
  filters JSONB,
  content JSONB NOT NULL, -- Report data
  format VARCHAR(20) DEFAULT 'json', -- json, csv, pdf
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'completed', -- pending, processing, completed, failed
  shared_with_users UUID[] DEFAULT ARRAY[]::uuid[],
  is_public BOOLEAN DEFAULT false,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type VARCHAR(50) NOT NULL, -- 'personal_data', 'activity', 'posts', 'events', 'all'
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, ready, expired
  file_url TEXT,
  file_size INT,
  file_format VARCHAR(20) DEFAULT 'json', -- json, csv, zip
  expires_at TIMESTAMP WITH TIME ZONE,
  request_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  metric_date DATE NOT NULL,
  metrics JSONB NOT NULL, -- {points: 100, badges: 5, posts: 2, ...}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_user_date ON analytics_snapshots(user_id, metric_date);

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id OR is_public = true OR auth.uid() = ANY(shared_with_users));

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own exports" ON data_exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can request exports" ON data_exports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON analytics_snapshots
  FOR SELECT USING (auth.uid() = user_id);

COMMIT;
