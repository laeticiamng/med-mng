-- Direct Messaging System
-- Enables 1-to-1 private messaging between users
-- Addresses audit finding: directMessaging feature disabled

-- Direct Message Threads table (conversations between 2 users)
CREATE TABLE IF NOT EXISTS public.direct_message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure participant_1_id < participant_2_id for uniqueness
  CONSTRAINT thread_participants_order CHECK (participant_1_id < participant_2_id),
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id),
  UNIQUE(participant_1_id, participant_2_id)
);

-- Direct Messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.direct_message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 5000),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  reply_to_message_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_participants CHECK (sender_id != recipient_id)
);

-- Direct Message Read Status table (granular tracking)
CREATE TABLE IF NOT EXISTS public.direct_message_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.direct_message_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_message_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(thread_id, user_id)
);

-- Direct Message Notifications table
CREATE TABLE IF NOT EXISTS public.direct_message_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES public.direct_message_threads(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, message_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dm_threads_participant_1 ON public.direct_message_threads(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_dm_threads_participant_2 ON public.direct_message_threads(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_dm_threads_last_message_at ON public.direct_message_threads(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_direct_messages_thread_id ON public.direct_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient_id ON public.direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_is_read ON public.direct_messages(is_read);

CREATE INDEX IF NOT EXISTS idx_dm_read_status_thread_user ON public.direct_message_read_status(thread_id, user_id);
CREATE INDEX IF NOT EXISTS idx_dm_read_status_unread_count ON public.direct_message_read_status(unread_count);

CREATE INDEX IF NOT EXISTS idx_dm_notifications_user_id ON public.direct_message_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_dm_notifications_is_read ON public.direct_message_notifications(is_read);

-- Enable Row Level Security
ALTER TABLE public.direct_message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_message_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies - direct_message_threads
-- Users can view threads they are part of
CREATE POLICY "dm_threads_select_participants" ON public.direct_message_threads
  FOR SELECT USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- Users can create threads (INSERT handled by helper function)
CREATE POLICY "dm_threads_insert_auth" ON public.direct_message_threads
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    (auth.uid() = participant_1_id OR auth.uid() = participant_2_id)
  );

-- Users can update threads they are part of (last_message_at, etc.)
CREATE POLICY "dm_threads_update_participants" ON public.direct_message_threads
  FOR UPDATE USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- RLS Policies - direct_messages
-- Users can view messages in their threads
CREATE POLICY "dm_messages_select_participants" ON public.direct_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Users can send messages
CREATE POLICY "dm_messages_insert_sender" ON public.direct_messages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = sender_id
  );

-- Users can update (edit) their own messages
CREATE POLICY "dm_messages_update_sender" ON public.direct_messages
  FOR UPDATE USING (
    auth.uid() = sender_id
  );

-- Users can mark messages as read if they are the recipient
CREATE POLICY "dm_messages_update_read_recipient" ON public.direct_messages
  FOR UPDATE USING (
    auth.uid() = recipient_id
  );

-- Users can delete their own messages
CREATE POLICY "dm_messages_delete_sender" ON public.direct_messages
  FOR DELETE USING (
    auth.uid() = sender_id
  );

-- RLS Policies - direct_message_read_status
-- Users can view their own read status
CREATE POLICY "dm_read_status_select_own" ON public.direct_message_read_status
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Users can insert their own read status
CREATE POLICY "dm_read_status_insert_own" ON public.direct_message_read_status
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = user_id
  );

-- Users can update their own read status
CREATE POLICY "dm_read_status_update_own" ON public.direct_message_read_status
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- RLS Policies - direct_message_notifications
-- Users can view their own notifications
CREATE POLICY "dm_notifications_select_own" ON public.direct_message_notifications
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- System can create notifications (via trigger)
CREATE POLICY "dm_notifications_insert_system" ON public.direct_message_notifications
  FOR INSERT WITH CHECK (TRUE);

-- Users can update their own notifications (mark as read)
CREATE POLICY "dm_notifications_update_own" ON public.direct_message_notifications
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Users can delete their own notifications
CREATE POLICY "dm_notifications_delete_own" ON public.direct_message_notifications
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- Helper function: Get or create thread between two users
CREATE OR REPLACE FUNCTION public.get_or_create_dm_thread(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_thread_id UUID;
  v_participant_1 UUID;
  v_participant_2 UUID;
BEGIN
  -- Ensure participant_1 < participant_2 for consistency
  IF user1_id < user2_id THEN
    v_participant_1 := user1_id;
    v_participant_2 := user2_id;
  ELSE
    v_participant_1 := user2_id;
    v_participant_2 := user1_id;
  END IF;

  -- Try to find existing thread
  SELECT id INTO v_thread_id
  FROM public.direct_message_threads
  WHERE participant_1_id = v_participant_1
    AND participant_2_id = v_participant_2;

  -- Create thread if doesn't exist
  IF v_thread_id IS NULL THEN
    INSERT INTO public.direct_message_threads (participant_1_id, participant_2_id)
    VALUES (v_participant_1, v_participant_2)
    RETURNING id INTO v_thread_id;

    -- Initialize read status for both participants
    INSERT INTO public.direct_message_read_status (thread_id, user_id, unread_count)
    VALUES
      (v_thread_id, v_participant_1, 0),
      (v_thread_id, v_participant_2, 0);
  END IF;

  RETURN v_thread_id;
END;
$$;

-- Trigger: Update thread last_message_at and preview when new message
CREATE OR REPLACE FUNCTION public.update_dm_thread_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update thread
  UPDATE public.direct_message_threads
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NOW()
  WHERE id = NEW.thread_id;

  -- Increment unread count for recipient
  UPDATE public.direct_message_read_status
  SET
    unread_count = unread_count + 1,
    updated_at = NOW()
  WHERE thread_id = NEW.thread_id
    AND user_id = NEW.recipient_id;

  -- Create notification for recipient
  INSERT INTO public.direct_message_notifications (user_id, message_id, thread_id)
  VALUES (NEW.recipient_id, NEW.id, NEW.thread_id)
  ON CONFLICT (user_id, message_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_dm_thread_on_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dm_thread_on_message();

-- Trigger: Mark message as read and update read status
CREATE OR REPLACE FUNCTION public.mark_dm_as_read()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If message is being marked as read
  IF NEW.is_read = TRUE AND (OLD.is_read IS NULL OR OLD.is_read = FALSE) THEN
    NEW.read_at := NOW();

    -- Update read status
    UPDATE public.direct_message_read_status
    SET
      last_read_message_id = NEW.id,
      last_read_at = NOW(),
      unread_count = GREATEST(0, unread_count - 1),
      updated_at = NOW()
    WHERE thread_id = NEW.thread_id
      AND user_id = NEW.recipient_id;

    -- Mark notification as read
    UPDATE public.direct_message_notifications
    SET
      is_read = TRUE,
      read_at = NOW()
    WHERE message_id = NEW.id
      AND user_id = NEW.recipient_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_mark_dm_as_read
  BEFORE UPDATE ON public.direct_messages
  FOR EACH ROW
  WHEN (NEW.is_read IS DISTINCT FROM OLD.is_read)
  EXECUTE FUNCTION public.mark_dm_as_read();

-- Trigger: Handle message edit
CREATE OR REPLACE FUNCTION public.handle_dm_edit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.content != OLD.content THEN
    NEW.is_edited := TRUE;
    NEW.edited_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_handle_dm_edit
  BEFORE UPDATE ON public.direct_messages
  FOR EACH ROW
  WHEN (NEW.content IS DISTINCT FROM OLD.content)
  EXECUTE FUNCTION public.handle_dm_edit();

-- Trigger: updated_at timestamps
CREATE TRIGGER update_dm_threads_updated_at
  BEFORE UPDATE ON public.direct_message_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dm_messages_updated_at
  BEFORE UPDATE ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dm_read_status_updated_at
  BEFORE UPDATE ON public.direct_message_read_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function: Get unread message count for user
CREATE OR REPLACE FUNCTION public.get_dm_unread_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(unread_count), 0)::INTEGER
  FROM public.direct_message_read_status
  WHERE user_id = p_user_id;
$$;

-- Helper function: Get recent conversations for user
CREATE OR REPLACE FUNCTION public.get_user_dm_conversations(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  thread_id UUID,
  other_user_id UUID,
  last_message_preview TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    t.id AS thread_id,
    CASE
      WHEN t.participant_1_id = p_user_id THEN t.participant_2_id
      ELSE t.participant_1_id
    END AS other_user_id,
    t.last_message_preview,
    t.last_message_at,
    COALESCE(rs.unread_count, 0) AS unread_count
  FROM public.direct_message_threads t
  LEFT JOIN public.direct_message_read_status rs
    ON rs.thread_id = t.id AND rs.user_id = p_user_id
  WHERE t.participant_1_id = p_user_id OR t.participant_2_id = p_user_id
  ORDER BY t.last_message_at DESC
  LIMIT p_limit;
$$;

-- Comments
COMMENT ON TABLE public.direct_message_threads IS 'Threads/conversations between two users for direct messaging';
COMMENT ON TABLE public.direct_messages IS 'Individual direct messages between users';
COMMENT ON TABLE public.direct_message_read_status IS 'Tracks read status and unread counts per user per thread';
COMMENT ON TABLE public.direct_message_notifications IS 'Notifications for new direct messages';
COMMENT ON FUNCTION public.get_or_create_dm_thread IS 'Get existing thread or create new one between two users';
COMMENT ON FUNCTION public.get_dm_unread_count IS 'Get total unread message count for a user';
COMMENT ON FUNCTION public.get_user_dm_conversations IS 'Get recent conversations for a user with unread counts';
