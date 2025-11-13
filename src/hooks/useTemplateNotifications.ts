import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TemplateShareNotification {
  id: string;
  recipient_user_id: string;
  template_id: string;
  sender_user_id: string;
  share_type: 'global' | 'team' | 'personal';
  message: string | null;
  read: boolean;
  created_at: string;
}

export const useTemplateNotifications = () => {
  const queryClient = useQueryClient();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['template-notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('template_share_notifications' as any)
        .select('*')
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any as TemplateShareNotification[];
    },
  });

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('template_share_notifications' as any)
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-notifications'] });
    },
    onError: (error: any) => {
      console.error('Error marking notification as read:', error);
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('template_share_notifications' as any)
        .update({ read: true })
        .eq('recipient_user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-notifications'] });
      toast.success('Toutes les notifications ont été marquées comme lues');
    },
    onError: (error: any) => {
      console.error('Error marking all as read:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('template_share_notifications' as any)
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-notifications'] });
      toast.success('Notification supprimée');
    },
    onError: (error: any) => {
      console.error('Error deleting notification:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  // Subscribe to real-time notifications
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('template-share-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'template_share_notifications',
            filter: `recipient_user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('New notification received:', payload);
            
            // Invalidate queries to fetch new data
            queryClient.invalidateQueries({ queryKey: ['template-notifications'] });
            
            // Show toast notification
            const notification = payload.new as any;
            toast.success('Nouveau template partagé', {
              description: notification.message || 'Un template a été partagé avec vous',
            });
            
            setHasNewNotifications(true);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [queryClient]);

  return {
    notifications,
    unreadCount,
    hasNewNotifications,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    isMarkingAsRead: markAsRead.isPending,
    isDeleting: deleteNotification.isPending,
  };
};
