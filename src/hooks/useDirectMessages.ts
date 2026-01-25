import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
}

export const useDirectMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { toast } = useToast();

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const { _data: dbMessages, _error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (_error) throw _error;

      // Group by conversation partner
      const convMap = new Map<string, Conversation>();
      const partnerIds = new Set<string>();

      (dbMessages || []).forEach((msg: any) => {
        const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
        partnerIds.add(partnerId);

        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, {
            id: partnerId,
            participantId: partnerId,
            participantName: 'Utilisateur',
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
            unreadCount: msg.sender_id !== currentUser.id && !msg.is_read ? 1 : 0,
            isOnline: false
          });
        } else if (msg.sender_id !== currentUser.id && !msg.is_read) {
          const conv = convMap.get(partnerId)!;
          conv.unreadCount++;
        }
      });

      // Load profiles for partners
      if (partnerIds.size > 0) {
        const { _data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', Array.from(partnerIds));

        profiles?.forEach((p: any) => {
          const conv = convMap.get(p.id);
          if (conv) {
            conv.participantName = p.display_name || 'Utilisateur';
            conv.participantAvatar = p.avatar_url;
          }
        });
      }

      setConversations(Array.from(convMap.values()));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (partnerId: string) => {
    if (!currentUser) return;
    setLoading(true);
    setSelectedConversation(partnerId);

    try {
      const { _data, _error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (_error) throw _error;

      const formattedMessages: DirectMessage[] = (_data || []).map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        content: m.content,
        isRead: m.is_read,
        createdAt: m.created_at
      }));

      setMessages(formattedMessages);

      // Mark as read
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUser.id)
        .eq('sender_id', partnerId);

      // Update unread count in conversations
      setConversations(prev => prev.map(c =>
        c.participantId === partnerId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!currentUser || !content.trim()) return null;

    try {
      const { _data, _error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: currentUser.id,
          receiver_id: receiverId,
          content: content.trim(),
          is_read: false
        })
        .select()
        .single();

      if (_error) throw _error;

      const newMessage: DirectMessage = {
        id: _data.id,
        senderId: _data.sender_id,
        receiverId: _data.receiver_id,
        content: _data.content,
        isRead: _data.is_read,
        createdAt: _data.created_at
      };

      setMessages(prev => [...prev, newMessage]);

      // Update conversation
      setConversations(prev => {
        const existing = prev.find(c => c.participantId === receiverId);
        if (existing) {
          return prev.map(c =>
            c.participantId === receiverId
              ? { ...c, lastMessage: content, lastMessageAt: _data.created_at }
              : c
          );
        }
        return prev;
      });

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive'
      });
      return null;
    }
  }, [currentUser, toast]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('dm-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          
          // Add to messages if in current conversation
          if (selectedConversation === newMsg.sender_id) {
            setMessages(prev => [...prev, {
              id: newMsg.id,
              senderId: newMsg.sender_id,
              receiverId: newMsg.receiver_id,
              content: newMsg.content,
              isRead: false,
              createdAt: newMsg.created_at
            }]);
            
            // Auto mark as read
            supabase
              .from('direct_messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          } else {
            // Update unread count
            setConversations(prev => prev.map(c =>
              c.participantId === newMsg.sender_id
                ? { ...c, unreadCount: c.unreadCount + 1, lastMessage: newMsg.content, lastMessageAt: newMsg.created_at }
                : c
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, selectedConversation]);

  // Get total unread count
  const totalUnreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    conversations,
    messages,
    loading,
    currentUser,
    selectedConversation,
    totalUnreadCount,
    loadConversations,
    loadMessages,
    sendMessage,
    setSelectedConversation,
  };
};
