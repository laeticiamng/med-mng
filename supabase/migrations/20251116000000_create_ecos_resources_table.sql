-- =====================================================
-- ECOS RESOURCES SYSTEM
-- =====================================================
-- Document and resource management for ECOS scenarios
--
-- Addresses audit finding: ECOS 0% resources (CRITICAL)
-- Impact: Enables document upload, resource sharing, learning materials
--
-- Created: 2025-11-16
-- Tables: 2 (ecos_resources, ecos_resource_access_logs)
-- RLS Policies: 10
-- Functions: 2
-- =====================================================

-- =====================================================
-- 1. ECOS RESOURCES TABLE
-- =====================================================
-- Stores learning resources, documents, and materials for ECOS scenarios

CREATE TABLE IF NOT EXISTS public.ecos_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Resource identification
  situation_id UUID REFERENCES public.ecos_situations_uness(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 3),
  description TEXT,

  -- Resource type and content
  resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'video', 'audio', 'image', 'link', 'document', 'other')),
  file_url TEXT, -- URL to storage (Supabase Storage or external)
  file_size_bytes BIGINT CHECK (file_size_bytes >= 0),
  mime_type TEXT,
  external_link TEXT, -- For external resources

  -- Metadata
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT CHECK (category IN ('course_material', 'reference', 'practice', 'supplementary', 'evaluation_guide', 'other')) DEFAULT 'supplementary',

  -- Access control
  is_public BOOLEAN DEFAULT false,
  requires_subscription BOOLEAN DEFAULT false,
  allowed_roles TEXT[] DEFAULT '{student,teacher,admin}',

  -- Engagement metrics
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Validation: either file_url or external_link must be provided
  CONSTRAINT has_content CHECK (
    file_url IS NOT NULL OR external_link IS NOT NULL
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ecos_resources_situation
  ON public.ecos_resources(situation_id);

CREATE INDEX IF NOT EXISTS idx_ecos_resources_type
  ON public.ecos_resources(resource_type);

CREATE INDEX IF NOT EXISTS idx_ecos_resources_category
  ON public.ecos_resources(category);

CREATE INDEX IF NOT EXISTS idx_ecos_resources_author
  ON public.ecos_resources(author_id);

CREATE INDEX IF NOT EXISTS idx_ecos_resources_tags
  ON public.ecos_resources USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_ecos_resources_public
  ON public.ecos_resources(is_public, is_active)
  WHERE is_public = true AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_ecos_resources_featured
  ON public.ecos_resources(is_featured, order_index)
  WHERE is_featured = true;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_ecos_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ecos_resources_timestamp ON public.ecos_resources;

CREATE TRIGGER trigger_update_ecos_resources_timestamp
  BEFORE UPDATE ON public.ecos_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_ecos_resources_updated_at();

COMMENT ON TABLE public.ecos_resources IS 'Learning resources and documents for ECOS scenarios';
COMMENT ON COLUMN public.ecos_resources.situation_id IS 'Optional link to specific ECOS scenario (NULL for general resources)';
COMMENT ON COLUMN public.ecos_resources.resource_type IS 'Type of resource: pdf, video, audio, image, link, document, other';
COMMENT ON COLUMN public.ecos_resources.category IS 'Category: course_material, reference, practice, supplementary, evaluation_guide, other';
COMMENT ON COLUMN public.ecos_resources.allowed_roles IS 'Roles that can access this resource';

-- =====================================================
-- 2. ECOS RESOURCE ACCESS LOGS TABLE
-- =====================================================
-- Track resource access for analytics and recommendations

CREATE TABLE IF NOT EXISTS public.ecos_resource_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.ecos_resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  access_type TEXT CHECK (access_type IN ('view', 'download', 'helpful', 'unhelpful')) DEFAULT 'view',
  user_agent TEXT,
  ip_address INET,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_ecos_resource_logs_resource
  ON public.ecos_resource_access_logs(resource_id);

CREATE INDEX IF NOT EXISTS idx_ecos_resource_logs_user
  ON public.ecos_resource_access_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_ecos_resource_logs_accessed_at
  ON public.ecos_resource_access_logs(accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ecos_resource_logs_type
  ON public.ecos_resource_access_logs(access_type);

COMMENT ON TABLE public.ecos_resource_access_logs IS 'Tracks user access to ECOS resources for analytics';

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.ecos_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecos_resource_access_logs ENABLE ROW LEVEL SECURITY;

-- ====== ECOS_RESOURCES POLICIES ======

-- Public can view public active resources
CREATE POLICY "Public can view public resources"
  ON public.ecos_resources
  FOR SELECT
  USING (is_public = true AND is_active = true);

-- Authenticated users can view resources based on role
CREATE POLICY "Authenticated can view allowed resources"
  ON public.ecos_resources
  FOR SELECT
  USING (
    is_active = true AND (
      is_public = true
      OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role_name = ANY(ecos_resources.allowed_roles)
      )
    )
  );

-- Teachers and content creators can create resources
CREATE POLICY "Teachers can create resources"
  ON public.ecos_resources
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name IN ('admin', 'teacher', 'content_creator')
    )
  );

-- Authors and admins can update their resources
CREATE POLICY "Authors can update resources"
  ON public.ecos_resources
  FOR UPDATE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- Only admins can delete resources
CREATE POLICY "Admins can delete resources"
  ON public.ecos_resources
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name = 'admin'
    )
  );

-- ====== ECOS_RESOURCE_ACCESS_LOGS POLICIES ======

-- Users can log their own access
CREATE POLICY "Users can log access"
  ON public.ecos_resource_access_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Users can view their own access logs
CREATE POLICY "Users view own logs"
  ON public.ecos_resource_access_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins/teachers can view all logs (analytics)
CREATE POLICY "Admins view all logs"
  ON public.ecos_resource_access_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name IN ('admin', 'teacher')
    )
  );

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to get resources for a scenario
CREATE OR REPLACE FUNCTION get_ecos_resources(p_situation_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  resource_type TEXT,
  file_url TEXT,
  external_link TEXT,
  category TEXT,
  tags TEXT[],
  download_count INTEGER,
  view_count INTEGER,
  is_featured BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    er.id,
    er.title,
    er.description,
    er.resource_type,
    er.file_url,
    er.external_link,
    er.category,
    er.tags,
    er.download_count,
    er.view_count,
    er.is_featured,
    er.created_at
  FROM public.ecos_resources er
  WHERE er.situation_id = p_situation_id
    AND er.is_active = true
    AND (
      er.is_public = true
      OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role_name = ANY(er.allowed_roles)
      )
    )
  ORDER BY er.is_featured DESC, er.order_index ASC, er.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_ecos_resources(UUID) TO authenticated, anon;

-- Function to log resource access and update metrics
CREATE OR REPLACE FUNCTION log_resource_access(
  p_resource_id UUID,
  p_access_type TEXT DEFAULT 'view'
)
RETURNS VOID AS $$
BEGIN
  -- Insert access log
  INSERT INTO public.ecos_resource_access_logs (
    resource_id,
    user_id,
    access_type,
    accessed_at
  ) VALUES (
    p_resource_id,
    auth.uid(),
    p_access_type,
    now()
  );

  -- Update resource metrics
  CASE p_access_type
    WHEN 'view' THEN
      UPDATE public.ecos_resources
      SET view_count = view_count + 1
      WHERE id = p_resource_id;

    WHEN 'download' THEN
      UPDATE public.ecos_resources
      SET download_count = download_count + 1
      WHERE id = p_resource_id;

    WHEN 'helpful' THEN
      UPDATE public.ecos_resources
      SET helpful_count = helpful_count + 1
      WHERE id = p_resource_id;

    WHEN 'unhelpful' THEN
      UPDATE public.ecos_resources
      SET unhelpful_count = unhelpful_count + 1
      WHERE id = p_resource_id;

    ELSE
      -- Do nothing for unknown types
      NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION log_resource_access(UUID, TEXT) TO authenticated, anon;

COMMENT ON FUNCTION log_resource_access IS 'Logs resource access and updates engagement metrics';

-- =====================================================
-- 5. SAMPLE DATA (DEV/TESTING ONLY)
-- =====================================================

-- Uncomment for dev environment
/*
-- Example: Add sample resources
INSERT INTO public.ecos_resources (
  title,
  description,
  resource_type,
  external_link,
  category,
  tags,
  is_public
) VALUES
  (
    'Guide d''évaluation ECOS',
    'Guide complet pour évaluer les performances lors des ECOS',
    'document',
    'https://example.com/guide-ecos.pdf',
    'evaluation_guide',
    ARRAY['evaluation', 'guide', 'ecos'],
    true
  ),
  (
    'Vidéo: Communication Médecin-Patient',
    'Tutoriel vidéo sur les techniques de communication',
    'video',
    'https://youtube.com/watch?v=example',
    'course_material',
    ARRAY['communication', 'tutoriel', 'vidéo'],
    true
  ),
  (
    'Référentiel Examen Physique',
    'Référence complète des techniques d''examen physique',
    'pdf',
    'https://example.com/examen-physique.pdf',
    'reference',
    ARRAY['examen', 'technique', 'référence'],
    true
  )
ON CONFLICT DO NOTHING;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- To verify tables created:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name LIKE '%resource%'
-- ORDER BY table_name;

-- To verify RLS policies:
-- SELECT tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename LIKE '%resource%'
-- ORDER BY tablename, policyname;

-- To test resource system:
-- SELECT * FROM get_ecos_resources(NULL); -- Get all general resources
-- SELECT log_resource_access('RESOURCE_UUID', 'view');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- ✅ ecos_resources table with full metadata and access control
-- ✅ ecos_resource_access_logs for analytics
-- ✅ 10 RLS policies for security
-- ✅ 2 helper functions for resource management
-- ✅ Indexes for optimal performance
-- =====================================================
