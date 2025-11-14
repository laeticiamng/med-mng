import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

/**
 * Direct message
 */
export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments?: string[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  reactions?: Record<string, number>; // emoji -> count
}

/**
 * Conversation
 */
export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage?: DirectMessage;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for Direct Messaging
 *
 * Manages:
 * - Send/receive messages
 * - Read receipts
 * - Typing indicators
 * - Message reactions
 * - Conversation management
 *
 * @example
 * const { conversations, sendMessage } = useDirectMessaging();
 */
export const useDirectMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch all conversations for user
   */
  const getConversations = useCallback(async (): Promise<Conversation[]> => {
    if (!user?.id) return [];

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('conversations')
        .select(
          `
          *,
          direct_messages(*)
        `
        )
        .contains('participant_ids', [user.id])
        .order('updated_at', { ascending: false });

      if (dbError) {
        throw dbError;
      }

      const conversationsList = (data || []).map((c: any) => ({
        id: c.id,
        participantIds: c.participant_ids,
        participantNames: c.participant_names,
        lastMessage: c.direct_messages?.[0],
        lastMessageTime: c.direct_messages?.[0]?.created_at,
        unreadCount: c.direct_messages?.filter(
          (m: any) => !m.is_read && m.sender_id !== user.id
        ).length,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      setConversations(conversationsList);
      return conversationsList;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch conversations';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Fetch messages for conversation
   */
  const getMessages = useCallback(
    async (conversationId: string): Promise<DirectMessage[]> => {
      if (!user?.id) return [];

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: dbError } = await supabase
          .from('direct_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (dbError) {
          throw dbError;
        }

        const messagesList = (data || []).map((m: any) => ({
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          senderAvatar: m.sender_avatar,
          content: m.content,
          attachments: m.attachments || [],
          isRead: m.is_read,
          readAt: m.read_at,
          createdAt: m.created_at,
          reactions: m.reactions || {},
        }));

        setMessages(messagesList);

        // Mark messages as read
        await markAsRead(conversationId);

        return messagesList;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch messages';
        setError(message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  /**
   * Create new conversation with user
   */
  const createConversation = useCallback(
    async (recipientId: string, recipientName: string): Promise<Conversation | null> => {
      if (!user?.id) return null;

      setIsLoading(true);
      setError(null);

      try {
        // Check if conversation exists
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .contains('participant_ids', [user.id, recipientId])
          .single();

        if (existing) {
          return {
            id: existing.id,
            participantIds: existing.participant_ids,
            participantNames: existing.participant_names,
            unreadCount: 0,
            createdAt: existing.created_at,
            updatedAt: existing.updated_at,
          };
        }

        // Create new conversation
        const { data, error: dbError } = await supabase
          .from('conversations')
          .insert({
            participant_ids: [user.id, recipientId],
            participant_names: [user.email || 'You', recipientName],
          })
          .select()
          .single();

        if (dbError) {
          throw dbError;
        }

        const newConversation: Conversation = {
          id: data.id,
          participantIds: data.participant_ids,
          participantNames: data.participant_names,
          unreadCount: 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        await getConversations();
        return newConversation;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create conversation';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, getConversations]
  );

  /**
   * Send message
   */
  const sendMessage = useCallback(
    async (conversationId: string, content: string, attachments?: string[]): Promise<DirectMessage | null> => {
      if (!user?.id || !content.trim()) return null;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: dbError } = await supabase
          .from('direct_messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            sender_name: user.email || 'User',
            content,
            attachments: attachments || [],
          })
          .select()
          .single();

        if (dbError) {
          throw dbError;
        }

        const newMessage: DirectMessage = {
          id: data.id,
          conversationId: data.conversation_id,
          senderId: data.sender_id,
          senderName: data.sender_name,
          content: data.content,
          attachments: data.attachments || [],
          isRead: false,
          createdAt: data.created_at,
        };

        setMessages((prev) => [...prev, newMessage]);

        // Update conversation
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        await getConversations();
        return newMessage;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, getConversations]
  );

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(async (conversationId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error: dbError } = await supabase
        .from('direct_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (dbError) {
        console.error('Failed to mark as read:', dbError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error marking as read:', err);
      return false;
    }
  }, [user?.id]);

  /**
   * Broadcast typing indicator
   */
  const sendTypingIndicator = useCallback(
    async (conversationId: string): Promise<void> => {
      if (!user?.id) return;

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing indicator
      const channel = supabase.channel(`typing:${conversationId}`);
      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const typing = Object.keys(newState).filter(
            (userId) => userId !== user.id
          );
          setTypingUsers(typing);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              typing: true,
            });
          }
        });

      // Stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(async () => {
        await channel.untrack();
        channel.unsubscribe();
      }, 3000);
    },
    [user?.id]
  );

  /**
   * Delete message
   */
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user?.id) return false;

    setIsLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from('direct_messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (dbError) {
        throw dbError;
      }

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete message';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load conversations on mount
  useEffect(() => {
    if (user?.id) {
      getConversations();

      // Subscribe to new messages
      const channel = supabase.channel('messages');
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages' }, () => {
          getConversations();
        })
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user?.id, getConversations]);

  return {
    conversations,
    currentConversation,
    messages,
    typingUsers,
    getConversations,
    getMessages,
    createConversation,
    sendMessage,
    deleteMessage,
    sendTypingIndicator,
    isLoading,
    error,
  };
};

export default useDirectMessaging;
