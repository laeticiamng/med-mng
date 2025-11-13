-- Enable realtime for sitemap_shares table
ALTER TABLE public.sitemap_shares REPLICA IDENTITY FULL;

-- Add sitemap_shares to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.sitemap_shares;

-- Create notifications table for share events
CREATE TABLE IF NOT EXISTS public.share_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id UUID REFERENCES public.sitemap_shares(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('share_created', 'share_updated', 'share_deleted', 'permission_changed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on share_notifications
ALTER TABLE public.share_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for share_notifications
CREATE POLICY "Users can view their own notifications"
  ON public.share_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.share_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.share_notifications
  FOR INSERT
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_share_notifications_user_id_created_at 
  ON public.share_notifications(user_id, created_at DESC);

CREATE INDEX idx_share_notifications_read 
  ON public.share_notifications(user_id, read, created_at DESC);

-- Enable realtime for notifications
ALTER TABLE public.share_notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.share_notifications;

-- Create function to send notifications when shares are created
CREATE OR REPLACE FUNCTION public.notify_share_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_email TEXT;
BEGIN
  -- Get owner email
  SELECT email INTO owner_email
  FROM auth.users
  WHERE id = NEW.owner_id;

  -- Create notification for the shared user if they exist
  IF NEW.shared_with_user_id IS NOT NULL THEN
    INSERT INTO public.share_notifications (
      user_id,
      share_id,
      notification_type,
      title,
      message,
      metadata
    ) VALUES (
      NEW.shared_with_user_id,
      NEW.id,
      'share_created',
      'Nouveau partage reçu',
      owner_email || ' a partagé des données avec vous avec les permissions ' || NEW.permission,
      jsonb_build_object(
        'owner_id', NEW.owner_id,
        'owner_email', owner_email,
        'permission', NEW.permission,
        'shared_at', NEW.created_at
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create function to send notifications when permissions are updated
CREATE OR REPLACE FUNCTION public.notify_share_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_email TEXT;
BEGIN
  -- Only notify if permission changed
  IF OLD.permission IS DISTINCT FROM NEW.permission THEN
    -- Get owner email
    SELECT email INTO owner_email
    FROM auth.users
    WHERE id = NEW.owner_id;

    -- Create notification
    IF NEW.shared_with_user_id IS NOT NULL THEN
      INSERT INTO public.share_notifications (
        user_id,
        share_id,
        notification_type,
        title,
        message,
        metadata
      ) VALUES (
        NEW.shared_with_user_id,
        NEW.id,
        'permission_changed',
        'Permissions mises à jour',
        owner_email || ' a modifié vos permissions de ' || OLD.permission || ' à ' || NEW.permission,
        jsonb_build_object(
          'owner_id', NEW.owner_id,
          'owner_email', owner_email,
          'old_permission', OLD.permission,
          'new_permission', NEW.permission,
          'updated_at', NEW.updated_at
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create function to send notifications when shares are deleted
CREATE OR REPLACE FUNCTION public.notify_share_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_email TEXT;
BEGIN
  -- Get owner email
  SELECT email INTO owner_email
  FROM auth.users
  WHERE id = OLD.owner_id;

  -- Create notification
  IF OLD.shared_with_user_id IS NOT NULL THEN
    INSERT INTO public.share_notifications (
      user_id,
      share_id,
      notification_type,
      title,
      message,
      metadata
    ) VALUES (
      OLD.shared_with_user_id,
      NULL, -- share_id is null because share is deleted
      'share_deleted',
      'Partage révoqué',
      owner_email || ' a révoqué le partage de données avec vous',
      jsonb_build_object(
        'owner_id', OLD.owner_id,
        'owner_email', owner_email,
        'permission', OLD.permission,
        'deleted_at', now()
      )
    );
  END IF;

  RETURN OLD;
END;
$$;

-- Create triggers
CREATE TRIGGER on_share_created
  AFTER INSERT ON public.sitemap_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_share_created();

CREATE TRIGGER on_share_updated
  AFTER UPDATE ON public.sitemap_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_share_updated();

CREATE TRIGGER on_share_deleted
  AFTER DELETE ON public.sitemap_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_share_deleted();