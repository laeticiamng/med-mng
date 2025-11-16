-- =====================================================
-- SUPPORT TICKET MESSAGES SYSTEM
-- =====================================================
-- Conversation thread management for support tickets
--
-- Addresses: Missing ticket_messages table for support system
-- Impact: Enables full support ticket conversations
--
-- Created: 2025-11-16
-- Tables: 1 (ticket_messages)
-- RLS Policies: 6
-- Functions: 2
-- =====================================================

-- =====================================================
-- 1. TICKET MESSAGES TABLE
-- =====================================================
-- Stores conversation messages for support tickets

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Message identification
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message content
  message_text TEXT NOT NULL CHECK (length(message_text) >= 1),
  message_html TEXT, -- Optional formatted version

  -- Attachments
  attachments JSONB DEFAULT '[]'::JSONB, -- Array of {name, url, size, type}

  -- Message metadata
  is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to customer
  is_automated BOOLEAN DEFAULT false, -- System-generated message
  sender_type TEXT CHECK (sender_type IN ('customer', 'support', 'system')) DEFAULT 'customer',

  -- Status tracking
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  edited_at TIMESTAMPTZ,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id
  ON public.ticket_messages(ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender_id
  ON public.ticket_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at
  ON public.ticket_messages(ticket_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_unread
  ON public.ticket_messages(ticket_id, is_read)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_ticket_messages_internal
  ON public.ticket_messages(ticket_id, is_internal)
  WHERE is_internal = true;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_ticket_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF OLD.message_text IS DISTINCT FROM NEW.message_text THEN
    NEW.edited_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ticket_messages_timestamp ON public.ticket_messages;

CREATE TRIGGER trigger_update_ticket_messages_timestamp
  BEFORE UPDATE ON public.ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_messages_updated_at();

COMMENT ON TABLE public.ticket_messages IS 'Conversation messages for support tickets';
COMMENT ON COLUMN public.ticket_messages.is_internal IS 'Internal notes not visible to customers';
COMMENT ON COLUMN public.ticket_messages.attachments IS 'JSON array of attachment metadata: [{name, url, size, type}]';
COMMENT ON COLUMN public.ticket_messages.sender_type IS 'Type of sender: customer, support, or system';

-- =====================================================
-- 2. AUTO-UPDATE TICKET STATUS
-- =====================================================
-- Automatically update ticket status when new message is added

CREATE OR REPLACE FUNCTION auto_update_ticket_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update ticket's updated_at timestamp
  UPDATE public.support_tickets
  SET updated_at = now()
  WHERE id = NEW.ticket_id;

  -- If ticket was resolved/closed and customer replies, reopen it
  IF NEW.sender_type = 'customer' THEN
    UPDATE public.support_tickets
    SET
      status = 'open',
      resolved_at = NULL,
      closed_at = NULL
    WHERE id = NEW.ticket_id
      AND status IN ('resolved', 'closed');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_update_ticket_on_message ON public.ticket_messages;

CREATE TRIGGER trigger_auto_update_ticket_on_message
  AFTER INSERT ON public.ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_ticket_on_message();

COMMENT ON FUNCTION auto_update_ticket_on_message IS 'Updates ticket timestamp and status when new message is added';

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their own tickets (excluding internal notes)
CREATE POLICY "Users view own ticket messages"
  ON public.ticket_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_messages.ticket_id
        AND user_id = auth.uid()
        AND (ticket_messages.is_internal = false OR ticket_messages.is_internal IS NULL)
    )
  );

-- Users can create messages for their own tickets
CREATE POLICY "Users create messages for own tickets"
  ON public.ticket_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_messages.ticket_id
        AND user_id = auth.uid()
    )
    AND sender_id = auth.uid()
    AND is_internal = false -- Customers can't create internal notes
  );

-- Users can update their own messages (edit)
CREATE POLICY "Users update own messages"
  ON public.ticket_messages
  FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Users can soft-delete their own messages
CREATE POLICY "Users delete own messages"
  ON public.ticket_messages
  FOR DELETE
  USING (sender_id = auth.uid());

-- Support staff can view all messages (including internal)
CREATE POLICY "Support staff view all messages"
  ON public.ticket_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name IN ('admin', 'support', 'teacher')
    )
  );

-- Support staff can create any messages (including internal notes)
CREATE POLICY "Support staff create any messages"
  ON public.ticket_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role_name IN ('admin', 'support', 'teacher')
    )
  );

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to get ticket conversation
CREATE OR REPLACE FUNCTION get_ticket_conversation(p_ticket_id UUID)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  sender_email TEXT,
  sender_type TEXT,
  message_text TEXT,
  attachments JSONB,
  is_internal BOOLEAN,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tm.id,
    tm.sender_id,
    u.email as sender_email,
    tm.sender_type,
    tm.message_text,
    tm.attachments,
    tm.is_internal,
    tm.is_read,
    tm.created_at,
    tm.edited_at
  FROM public.ticket_messages tm
  LEFT JOIN auth.users u ON tm.sender_id = u.id
  WHERE tm.ticket_id = p_ticket_id
    AND tm.is_deleted = false
    AND (
      -- Show all messages to support staff
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role_name IN ('admin', 'support', 'teacher')
      )
      -- Show only non-internal messages to customers
      OR (
        tm.is_internal = false
        AND EXISTS (
          SELECT 1 FROM public.support_tickets
          WHERE id = p_ticket_id
            AND user_id = auth.uid()
        )
      )
    )
  ORDER BY tm.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_ticket_conversation(UUID) TO authenticated;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_ticket_messages_read(p_ticket_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Mark all unread messages as read
  UPDATE public.ticket_messages
  SET
    is_read = true,
    read_at = now()
  WHERE ticket_id = p_ticket_id
    AND is_read = false
    AND (
      -- Support staff can mark any messages as read
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role_name IN ('admin', 'support', 'teacher')
      )
      -- Customers can only mark messages not from themselves as read
      OR (
        sender_id != auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.support_tickets
          WHERE id = p_ticket_id
            AND user_id = auth.uid()
        )
      )
    );

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION mark_ticket_messages_read(UUID) TO authenticated;

COMMENT ON FUNCTION get_ticket_conversation IS 'Returns all messages for a ticket (respects RLS and internal flag)';
COMMENT ON FUNCTION mark_ticket_messages_read IS 'Marks all unread messages in a ticket as read';

-- =====================================================
-- 5. SAMPLE DATA (DEV/TESTING ONLY)
-- =====================================================

-- Uncomment for dev environment
/*
-- Example: Add sample messages to a ticket
INSERT INTO public.ticket_messages (
  ticket_id,
  sender_id,
  message_text,
  sender_type
) VALUES
  (
    'TICKET_UUID_HERE',
    auth.uid(),
    'Bonjour, j''ai un problème avec mon compte. Je ne peux pas accéder à certaines fonctionnalités.',
    'customer'
  )
ON CONFLICT DO NOTHING;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- To verify table created:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name = 'ticket_messages';

-- To verify RLS policies:
-- SELECT tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'ticket_messages'
-- ORDER BY policyname;

-- To test ticket messages:
-- SELECT * FROM get_ticket_conversation('TICKET_UUID');
-- SELECT mark_ticket_messages_read('TICKET_UUID');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- ✅ ticket_messages table for support conversations
-- ✅ Auto-update ticket status trigger
-- ✅ 6 RLS policies for security
-- ✅ 2 helper functions for message management
-- ✅ Indexes for optimal performance
-- ✅ Support for internal notes and attachments
-- =====================================================
