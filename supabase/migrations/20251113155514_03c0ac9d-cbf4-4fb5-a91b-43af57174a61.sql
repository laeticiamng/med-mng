-- Enable realtime for notification_filter_templates table
ALTER TABLE public.notification_filter_templates REPLICA IDENTITY FULL;

-- Create notifications table for template sharing alerts
CREATE TABLE IF NOT EXISTS public.template_share_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL CHECK (share_type IN ('global', 'team', 'personal')),
  message TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.template_share_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_share_notifications
CREATE POLICY "Users can view their own notifications"
ON public.template_share_notifications FOR SELECT
USING (auth.uid() = recipient_user_id);

CREATE POLICY "Users can update their own notifications"
ON public.template_share_notifications FOR UPDATE
USING (auth.uid() = recipient_user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.template_share_notifications FOR DELETE
USING (auth.uid() = recipient_user_id);

-- Create index for better performance
CREATE INDEX idx_template_share_notifications_recipient ON public.template_share_notifications(recipient_user_id);
CREATE INDEX idx_template_share_notifications_read ON public.template_share_notifications(recipient_user_id, read);

-- Enable realtime for notifications table
ALTER TABLE public.template_share_notifications REPLICA IDENTITY FULL;

-- Function to create notifications when template is shared
CREATE OR REPLACE FUNCTION notify_template_share()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  share_type_val TEXT;
  sender_id UUID;
BEGIN
  -- Get the template owner
  SELECT user_id INTO sender_id FROM notification_filter_templates WHERE id = NEW.id;
  
  -- Determine share type and create notifications
  IF NEW.is_shared = true AND OLD.is_shared = false THEN
    -- Global share - notify all users (we won't actually do this to avoid spam)
    share_type_val := 'global';
  ELSIF NEW.shared_with_team = true AND OLD.shared_with_team = false THEN
    -- Team share - notify team members (simplified version)
    share_type_val := 'team';
  END IF;
  
  -- Handle specific user sharing
  IF NEW.shared_with_users IS NOT NULL AND array_length(NEW.shared_with_users, 1) > 0 THEN
    FOR recipient_id IN SELECT unnest(NEW.shared_with_users)::UUID
    LOOP
      -- Only create notification if user exists
      IF EXISTS (SELECT 1 FROM auth.users WHERE id = recipient_id) THEN
        INSERT INTO template_share_notifications (
          recipient_user_id,
          template_id,
          sender_user_id,
          share_type,
          message
        ) VALUES (
          recipient_id,
          NEW.id,
          sender_id,
          'personal',
          'Un template de filtres a été partagé avec vous'
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for template sharing notifications
DROP TRIGGER IF EXISTS template_share_notification_trigger ON public.notification_filter_templates;
CREATE TRIGGER template_share_notification_trigger
AFTER UPDATE ON public.notification_filter_templates
FOR EACH ROW
WHEN (
  OLD.is_shared IS DISTINCT FROM NEW.is_shared OR
  OLD.shared_with_team IS DISTINCT FROM NEW.shared_with_team OR
  OLD.shared_with_users IS DISTINCT FROM NEW.shared_with_users
)
EXECUTE FUNCTION notify_template_share();