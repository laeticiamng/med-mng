-- Phase 6 System #5: Content Reporting & Appeals System

-- Content Complaint Reports Table
CREATE TABLE IF NOT EXISTS content_complaint_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'user', 'message', 'media'
  content_id VARCHAR(255) NOT NULL,
  report_category VARCHAR(100) NOT NULL, -- 'inappropriate_content', 'harassment', 'spam', 'misinformation', 'copyright', 'other'
  severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  description TEXT NOT NULL,
  attachments JSONB, -- URLs to screenshots/attachments
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'resolved', 'dismissed', 'escalated'
  resolution_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content Appeal Requests Table
CREATE TABLE IF NOT EXISTS content_appeal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  original_report_id UUID REFERENCES content_complaint_reports(id),
  appeal_reason TEXT NOT NULL,
  appeal_type VARCHAR(50) NOT NULL, -- 'report_incorrect', 'context_missing', 'mistaken_identity', 'other'
  supporting_evidence TEXT,
  attachments JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'granted', 'denied', 'escalated'
  decision_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Report Analytics Table
CREATE TABLE IF NOT EXISTS report_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  total_reports INTEGER DEFAULT 0,
  reports_resolved INTEGER DEFAULT 0,
  reports_escalated INTEGER DEFAULT 0,
  appeals_submitted INTEGER DEFAULT 0,
  appeals_granted INTEGER DEFAULT 0,
  category_breakdown JSONB, -- Count by category
  severity_breakdown JSONB, -- Count by severity
  avg_resolution_time_hours DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(report_date)
);

-- Report Tags/Labels Table
CREATE TABLE IF NOT EXISTS report_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES content_complaint_reports(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(report_id, tag)
);

-- Report Actions History Table
CREATE TABLE IF NOT EXISTS report_action_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES content_complaint_reports(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'status_changed', 'note_added', 'tagged', 'assigned', etc.
  action_by UUID NOT NULL REFERENCES auth.users(id),
  old_value VARCHAR(255),
  new_value VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_complaint_reports_user ON content_complaint_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_complaint_reports_status ON content_complaint_reports(status);
CREATE INDEX IF NOT EXISTS idx_complaint_reports_category ON content_complaint_reports(report_category);
CREATE INDEX IF NOT EXISTS idx_complaint_reports_content ON content_complaint_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_complaint_reports_created ON content_complaint_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_appeal_requests_user ON content_appeal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_appeal_requests_status ON content_appeal_requests(status);
CREATE INDEX IF NOT EXISTS idx_appeal_requests_created ON content_appeal_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_report_tags_report ON report_tags(report_id);
CREATE INDEX IF NOT EXISTS idx_report_action_history_report ON report_action_history(report_id);
CREATE INDEX IF NOT EXISTS idx_report_analytics_date ON report_analytics(report_date);

-- Enable RLS
ALTER TABLE content_complaint_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_appeal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_action_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own reports, admins can view all
CREATE POLICY "complaint_reports_user_access" ON content_complaint_reports
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator'))
  );

-- Users can create their own reports
CREATE POLICY "complaint_reports_user_insert" ON content_complaint_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Only admins and moderators can update reports
CREATE POLICY "complaint_reports_admin_update" ON content_complaint_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator'))
  );

-- Appeals: Users can view their own, admins can view all
CREATE POLICY "appeal_requests_user_access" ON content_appeal_requests
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator'))
  );

-- Users can create their own appeals
CREATE POLICY "appeal_requests_user_insert" ON content_appeal_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin analytics access
CREATE POLICY "report_analytics_admin_access" ON report_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'))
  );

-- Tags access
CREATE POLICY "report_tags_access" ON report_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator'))
  );

-- Action history access
CREATE POLICY "report_action_history_access" ON report_action_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_complaint_reports ccr
      WHERE ccr.id = report_action_history.report_id AND (
        ccr.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator'))
      )
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_reporting_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaint_reports_updated_at
BEFORE UPDATE ON content_complaint_reports
FOR EACH ROW
EXECUTE FUNCTION update_reporting_updated_at();

CREATE TRIGGER appeal_requests_updated_at
BEFORE UPDATE ON content_appeal_requests
FOR EACH ROW
EXECUTE FUNCTION update_reporting_updated_at();
