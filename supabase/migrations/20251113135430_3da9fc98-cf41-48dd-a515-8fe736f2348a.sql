-- Create audit logs table for tracking all actions on shared data
CREATE TABLE IF NOT EXISTS public.share_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL, -- 'view', 'create', 'update', 'delete', 'access'
  resource_type TEXT NOT NULL, -- 'sitemap_share', 'shared_sitemap', etc.
  resource_id UUID NOT NULL,
  details JSONB, -- Additional context about the action
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_share_audit_logs_user_id ON public.share_audit_logs(user_id);
CREATE INDEX idx_share_audit_logs_resource ON public.share_audit_logs(resource_type, resource_id);
CREATE INDEX idx_share_audit_logs_created_at ON public.share_audit_logs(created_at);
CREATE INDEX idx_share_audit_logs_action ON public.share_audit_logs(action);

-- Enable RLS
ALTER TABLE public.share_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view audit logs for resources they have access to
CREATE POLICY "Users can view audit logs for their shared resources"
ON public.share_audit_logs
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.sitemap_shares
    WHERE sitemap_shares.shared_with_user_id = auth.uid()
    AND sitemap_shares.id::text = share_audit_logs.resource_id::text
  )
);

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_share_audit(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  v_user_id := auth.uid();
  
  -- Get user email if available
  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;
  END IF;
  
  INSERT INTO public.share_audit_logs (
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    v_user_id,
    v_user_email,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for sitemap_shares CREATE
CREATE OR REPLACE FUNCTION public.audit_sitemap_share_create()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_share_audit(
    'create',
    'sitemap_share',
    NEW.id,
    jsonb_build_object(
      'shared_with_user_id', NEW.shared_with_user_id,
      'permission', NEW.permission,
      'sitemap_id', NEW.sitemap_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for sitemap_shares UPDATE
CREATE OR REPLACE FUNCTION public.audit_sitemap_share_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_share_audit(
    'update',
    'sitemap_share',
    NEW.id,
    jsonb_build_object(
      'old_permission', OLD.permission,
      'new_permission', NEW.permission,
      'shared_with_user_id', NEW.shared_with_user_id,
      'sitemap_id', NEW.sitemap_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for sitemap_shares DELETE
CREATE OR REPLACE FUNCTION public.audit_sitemap_share_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_share_audit(
    'delete',
    'sitemap_share',
    OLD.id,
    jsonb_build_object(
      'shared_with_user_id', OLD.shared_with_user_id,
      'permission', OLD.permission,
      'sitemap_id', OLD.sitemap_id
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to sitemap_shares
CREATE TRIGGER audit_sitemap_share_create_trigger
  AFTER INSERT ON public.sitemap_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sitemap_share_create();

CREATE TRIGGER audit_sitemap_share_update_trigger
  AFTER UPDATE ON public.sitemap_shares
  FOR EACH ROW
  WHEN (OLD.permission IS DISTINCT FROM NEW.permission)
  EXECUTE FUNCTION public.audit_sitemap_share_update();

CREATE TRIGGER audit_sitemap_share_delete_trigger
  AFTER DELETE ON public.sitemap_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sitemap_share_delete();

-- Function to clean up old audit logs (90 days retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.share_audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pg_cron extension for scheduled cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM
SELECT cron.schedule(
  'cleanup-old-audit-logs',
  '0 2 * * *',
  'SELECT public.cleanup_old_audit_logs();'
);