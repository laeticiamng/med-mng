import logger from '@/lib/logger';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from './useUserRoles';
import { toast } from 'sonner';

export interface SecurityNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  type: 'mass_deletion' | 'unauthorized_access' | 'suspicious_activity' | 'system_alert';
  details: Record<string, any> | null;
  related_user_id: string | null;
  related_resource_type: string | null;
  related_resource_id: string | null;
  read_by: string[];
  created_at: string;
  expires_at: string;
}

export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAdmin, isSecurityAnalyst } = useUserRoles();

  useEffect(() => {
    if (!isAdmin && !isSecurityAnalyst) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('security_notifications' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Error fetching notifications:', error);
        return;
      }

      setNotifications((data || []) as any as SecurityNotification[]);
      
      // Count unread
      const unread = ((data || []) as any as SecurityNotification[]).filter(
        n => !n.read_by.includes(user.id)
      ).length;
      setUnreadCount(unread);
    };

    fetchNotifications();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('security-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_notifications'
        },
        (payload) => {
          logger.debug('New notification received:', payload);
          const newNotification = payload.new as SecurityNotification;
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Play notification sound
          playNotificationSound(newNotification.severity);

          // Show toast notification
          const toastMessage = `${newNotification.title}: ${newNotification.message}`;
          
          if (newNotification.severity === 'critical') {
            toast.error(toastMessage, {
              duration: 10000,
              action: {
                label: 'Voir',
                onClick: () => window.location.href = '/audit-security',
              },
            });
          } else if (newNotification.severity === 'warning') {
            toast.warning(toastMessage, { duration: 7000 });
          } else {
            toast.info(toastMessage, { duration: 5000 });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'security_notifications'
        },
        (payload) => {
          const updatedNotification = payload.new as SecurityNotification;
          setNotifications(prev =>
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );

          // Recalculate unread count
          const user = supabase.auth.getUser();
          user.then(({ data }) => {
            if (data.user) {
              const unread = notifications.filter(
                n => !n.read_by.includes(data.user!.id)
              ).length;
              setUnreadCount(unread);
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, isSecurityAnalyst]);

  const markAsRead = async (notificationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.rpc('mark_notification_as_read' as any, {
      notification_id: notificationId,
      user_id: user.id,
    } as any);

    if (error) {
      logger.error('Error marking notification as read:', error);
      toast.error('Erreur lors du marquage de la notification');
    } else {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const unreadNotifications = notifications.filter(
      n => !n.read_by.includes(user.id)
    );

    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};

function playNotificationSound(severity: 'info' | 'warning' | 'critical') {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different severities
    const frequencies = {
      info: 440,      // A4
      warning: 554,   // C#5
      critical: 659,  // E5
    };

    oscillator.frequency.value = frequencies[severity];
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    logger.error('Error playing notification sound:', error);
  }
}
