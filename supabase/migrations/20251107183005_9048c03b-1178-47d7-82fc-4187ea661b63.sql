-- Create table for CVSS assessments
CREATE TABLE IF NOT EXISTS public.cvss_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vulnerability_name VARCHAR(255) NOT NULL,
    description TEXT,
    cve_id VARCHAR(50),
    
    -- CVSS v3.1 Base Metrics
    attack_vector VARCHAR(20) NOT NULL, -- N, A, L, P
    attack_complexity VARCHAR(20) NOT NULL, -- L, H
    privileges_required VARCHAR(20) NOT NULL, -- N, L, H
    user_interaction VARCHAR(20) NOT NULL, -- N, R
    scope VARCHAR(20) NOT NULL, -- U, C
    confidentiality_impact VARCHAR(20) NOT NULL, -- N, L, H
    integrity_impact VARCHAR(20) NOT NULL, -- N, L, H
    availability_impact VARCHAR(20) NOT NULL, -- N, L, H
    
    -- CVSS v3.1 Temporal Metrics (optional)
    exploit_code_maturity VARCHAR(20) DEFAULT 'X', -- X, U, P, F, H
    remediation_level VARCHAR(20) DEFAULT 'X', -- X, O, T, W, U
    report_confidence VARCHAR(20) DEFAULT 'X', -- X, U, R, C
    
    -- CVSS v3.1 Environmental Metrics (optional)
    confidentiality_requirement VARCHAR(20) DEFAULT 'X', -- X, L, M, H
    integrity_requirement VARCHAR(20) DEFAULT 'X', -- X, L, M, H
    availability_requirement VARCHAR(20) DEFAULT 'X', -- X, L, M, H
    
    -- Calculated Scores
    base_score DECIMAL(3,1),
    temporal_score DECIMAL(3,1),
    environmental_score DECIMAL(3,1),
    base_severity VARCHAR(20), -- None, Low, Medium, High, Critical
    vector_string TEXT,
    
    -- Metadata
    assessed_by UUID REFERENCES auth.users(id),
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    patched BOOLEAN DEFAULT false,
    patch_priority INTEGER, -- 1-5 (1=highest)
    patch_deadline DATE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cvss_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Security roles can view CVSS assessments"
ON public.cvss_assessments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'security_analyst') OR
  public.has_role(auth.uid(), 'viewer')
);

CREATE POLICY "Admins and analysts can create CVSS assessments"
ON public.cvss_assessments
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'security_analyst')
);

CREATE POLICY "Admins and analysts can update CVSS assessments"
ON public.cvss_assessments
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'security_analyst')
);

CREATE POLICY "Admins can delete CVSS assessments"
ON public.cvss_assessments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_cvss_base_score ON public.cvss_assessments(base_score DESC);
CREATE INDEX idx_cvss_severity ON public.cvss_assessments(base_severity);
CREATE INDEX idx_cvss_patched ON public.cvss_assessments(patched);
CREATE INDEX idx_cvss_priority ON public.cvss_assessments(patch_priority);

-- Create table for scheduled reports
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    recipients TEXT[] NOT NULL,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_scheduled_at TIMESTAMP WITH TIME ZONE,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage scheduled reports"
ON public.scheduled_reports
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All security roles can view scheduled reports"
ON public.scheduled_reports
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'security_analyst') OR
  public.has_role(auth.uid(), 'viewer')
);

-- Grant permissions
GRANT ALL ON public.cvss_assessments TO authenticated;
GRANT ALL ON public.scheduled_reports TO authenticated;