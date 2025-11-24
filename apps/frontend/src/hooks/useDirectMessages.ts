import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  recipient?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  participant_avatar: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

// Hook pour récupérer les conversations
export function useFetchConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dm', 'conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user?.id) return [];

      // Récupérer les messages groupés par conversation
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          created_at,
          read_at
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Grouper par participant unique
      const conversationsMap = new Map<string, Conversation>();

      for (const msg of messages || []) {
        const participantId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;

        if (!conversationsMap.has(participantId)) {
          conversationsMap.set(participantId, {
            id: participantId,
            participant_id: participantId,
            participant_name: '',
            participant_email: '',
            participant_avatar: null,
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: 0,
          });
        }

        // Compter les non lus
        if (msg.recipient_id === user.id && !msg.read_at) {
          const conv = conversationsMap.get(participantId)!;
          conv.unread_count++;
        }
      }

      // Récupérer les profils des participants
      const participantIds = Array.from(conversationsMap.keys());
      if (participantIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', participantIds);

        for (const profile of profiles || []) {
          const conv = conversationsMap.get(profile.id);
          if (conv) {
            conv.participant_name = profile.full_name || profile.email;
            conv.participant_email = profile.email;
            conv.participant_avatar = profile.avatar_url;
          }
        }
      }

      return Array.from(conversationsMap.values()).sort((a, b) =>
        new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
      );
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 secondes
  });
}

// Hook pour récupérer les messages d'une conversation
export function useFetchMessages(participantId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dm', 'messages', participantId],
    queryFn: async (): Promise<DirectMessage[]> => {
      if (!user?.id || !participantId) return [];

      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${participantId}),and(sender_id.eq.${participantId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!participantId,
    staleTime: 1000 * 10, // 10 secondes
  });
}

// Hook pour envoyer un message
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user?.id) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dm', 'messages', variables.recipientId] });
      queryClient.invalidateQueries({ queryKey: ['dm', 'conversations'] });
    },
  });
}

// Hook pour marquer les messages comme lus
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (senderId: string) => {
      if (!user?.id) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', senderId)
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: (_, senderId) => {
      queryClient.invalidateQueries({ queryKey: ['dm', 'messages', senderId] });
      queryClient.invalidateQueries({ queryKey: ['dm', 'conversations'] });
    },
  });
}

// Hook pour rechercher des utilisateurs
export function useSearchUsers(query: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', user?.id || '')
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60,
  });
}
