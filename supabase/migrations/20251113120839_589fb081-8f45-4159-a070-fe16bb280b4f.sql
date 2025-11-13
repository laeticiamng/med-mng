-- Create share permission enum
CREATE TYPE share_permission AS ENUM ('viewer', 'editor', 'admin');

-- Create sitemap_shares table
CREATE TABLE IF NOT EXISTS public.sitemap_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission share_permission NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, shared_with_email)
);

-- Enable RLS on sitemap_shares
ALTER TABLE public.sitemap_shares ENABLE ROW LEVEL SECURITY;

-- RLS policies for sitemap_shares
CREATE POLICY "Users can view shares they created"
  ON public.sitemap_shares
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view shares with them"
  ON public.sitemap_shares
  FOR SELECT
  USING (auth.uid() = shared_with_user_id OR auth.email() = shared_with_email);

CREATE POLICY "Users can create shares"
  ON public.sitemap_shares
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own shares"
  ON public.sitemap_shares
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own shares"
  ON public.sitemap_shares
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Create security definer function to check sitemap access
CREATE OR REPLACE FUNCTION public.has_sitemap_access(
  _user_id UUID,
  _target_user_id UUID,
  _min_permission share_permission DEFAULT 'viewer'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Owner always has access
  IF _user_id = _target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has been granted access via shares
  RETURN EXISTS (
    SELECT 1
    FROM public.sitemap_shares
    WHERE owner_id = _target_user_id
      AND (shared_with_user_id = _user_id OR shared_with_email = (SELECT email FROM auth.users WHERE id = _user_id))
      AND (
        CASE _min_permission
          WHEN 'viewer' THEN permission IN ('viewer', 'editor', 'admin')
          WHEN 'editor' THEN permission IN ('editor', 'admin')
          WHEN 'admin' THEN permission = 'admin'
          ELSE FALSE
        END
      )
  );
END;
$$;

-- Update RLS policies for user_sitemap_data
DROP POLICY IF EXISTS "Users can view their own sitemap data" ON public.user_sitemap_data;
DROP POLICY IF EXISTS "Users can insert their own sitemap data" ON public.user_sitemap_data;
DROP POLICY IF EXISTS "Users can update their own sitemap data" ON public.user_sitemap_data;
DROP POLICY IF EXISTS "Users can delete their own sitemap data" ON public.user_sitemap_data;

CREATE POLICY "Users can view sitemap data they have access to"
  ON public.user_sitemap_data
  FOR SELECT
  USING (public.has_sitemap_access(auth.uid(), user_id, 'viewer'));

CREATE POLICY "Users can insert their own sitemap data"
  ON public.user_sitemap_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update sitemap data with editor access"
  ON public.user_sitemap_data
  FOR UPDATE
  USING (public.has_sitemap_access(auth.uid(), user_id, 'editor'));

CREATE POLICY "Users can delete their own sitemap data"
  ON public.user_sitemap_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update RLS policies for page_notes
DROP POLICY IF EXISTS "Users can view their own notes" ON public.page_notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.page_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.page_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.page_notes;

CREATE POLICY "Users can view notes they have access to"
  ON public.page_notes
  FOR SELECT
  USING (public.has_sitemap_access(auth.uid(), user_id, 'viewer'));

CREATE POLICY "Users can insert their own notes"
  ON public.page_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update notes with editor access"
  ON public.page_notes
  FOR UPDATE
  USING (public.has_sitemap_access(auth.uid(), user_id, 'editor'));

CREATE POLICY "Users can delete their own notes"
  ON public.page_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update RLS policies for user_metric_alerts if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_metric_alerts') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own alerts" ON public.user_metric_alerts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own alerts" ON public.user_metric_alerts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own alerts" ON public.user_metric_alerts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own alerts" ON public.user_metric_alerts';
    
    EXECUTE 'CREATE POLICY "Users can view alerts they have access to"
      ON public.user_metric_alerts
      FOR SELECT
      USING (public.has_sitemap_access(auth.uid(), user_id, ''viewer''))';
    
    EXECUTE 'CREATE POLICY "Users can insert their own alerts"
      ON public.user_metric_alerts
      FOR INSERT
      WITH CHECK (auth.uid() = user_id)';
    
    EXECUTE 'CREATE POLICY "Users can update alerts with editor access"
      ON public.user_metric_alerts
      FOR UPDATE
      USING (public.has_sitemap_access(auth.uid(), user_id, ''editor''))';
    
    EXECUTE 'CREATE POLICY "Users can delete their own alerts"
      ON public.user_metric_alerts
      FOR DELETE
      USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create updated_at trigger for sitemap_shares
CREATE TRIGGER update_sitemap_shares_updated_at
  BEFORE UPDATE ON public.sitemap_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();