import logger from '@/lib/logger';
import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ShareNotification {
  id: string;
  user_id: string;
  share_id: string | null;
  notification_type: 'share_created' | 'share_updated' | 'share_deleted' | 'permission_changed';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata: {
    owner_id?: string;
    owner_email?: string;
    permission?: string;
    old_permission?: string;
    new_permission?: string;
    [key: string]: any;
  };
}

export function useShareNotifications() {
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch all notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['share-notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('share_notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as unknown as ShareNotification[];
    },
  });

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('share_notifications' as any)
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-notifications'] });
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('share_notifications' as any)
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-notifications'] });
      toast.success('Toutes les notifications marquées comme lues');
    },
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('share_notifications' as any)
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-notifications'] });
      toast.success('Notification supprimée');
    },
  });

  // Setup realtime subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create channel for realtime updates
      const realtimeChannel = supabase
        .channel('share-notifications-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'share_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            logger.debug('New notification received:', payload);
            const newNotification = payload.new as ShareNotification;

            // Show toast notification
            toast.info(newNotification.title, {
              description: newNotification.message,
              duration: 5000,
            });

            // Invalidate query to fetch new notifications
            queryClient.invalidateQueries({ queryKey: ['share-notifications'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'share_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['share-notifications'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'share_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['share-notifications'] });
          }
        )
        .subscribe((status) => {
          logger.debug('Realtime subscription status:', status);
        });

      setChannel(realtimeChannel);
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    isMarkingAsRead: markAsRead.isPending,
    isDeletingNotification: deleteNotification.isPending,
  };
}
