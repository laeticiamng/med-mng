import logger from '@/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'system' | 'extraction' | 'quota' | 'security' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable?: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate mock notifications for demo
  const generateMockNotifications = useCallback((): Notification[] => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'critical',
        title: 'Extraction en échec',
        message: 'L\'extraction du batch EDN-001 a échoué après 3 tentatives',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        category: 'extraction',
        priority: 'urgent',
        actionable: true,
        action: {
          label: 'Redémarrer',
          url: '/admin/extractions'
        }
      },
      {
        id: '2',
        type: 'warning',
        title: 'Quota proche de la limite',
        message: 'Vous avez utilisé 85% de votre quota mensuel',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        category: 'quota',
        priority: 'high',
        actionable: true,
        action: {
          label: 'Voir détails',
          url: '/quota'
        }
      },
      {
        id: '3',
        type: 'info',
        title: 'Maintenance programmée',
        message: 'Maintenance système prévue le 28/07 de 2h à 4h du matin',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        category: 'maintenance',
        priority: 'medium'
      },
      {
        id: '4',
        type: 'success',
        title: 'Extraction terminée',
        message: 'L\'extraction OIC-042 s\'est terminée avec succès (250 items)',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: true,
        category: 'extraction',
        priority: 'low'
      },
      {
        id: '5',
        type: 'error',
        title: 'Erreur d\'authentification',
        message: 'Plusieurs tentatives de connexion échouées détectées',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false,
        category: 'security',
        priority: 'high',
        actionable: true,
        action: {
          label: 'Investiguer',
          url: '/admin/security'
        }
      },
      {
        id: '6',
        type: 'info',
        title: 'Nouvelle version disponible',
        message: 'Une mise à jour du système est disponible (v2.1.3)',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        category: 'system',
        priority: 'low'
      }
    ];

    return mockNotifications;
  }, []);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        // In a real app, you'd fetch from the database
        // For now, we'll use mock data
        const mockData = generateMockNotifications();
        setNotifications(mockData);
      } catch (error) {
        logger.error('Error loading notifications:', error);
        toast.error('Erreur lors du chargement des notifications');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [generateMockNotifications]);

  // Real-time notifications via Supabase
  useEffect(() => {
    // Listen for new extraction logs and operation logs
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'extraction_logs'
        },
        (payload) => {
          const newNotification: Notification = {
            id: `extraction-${payload.new.id}`,
            type: payload.new.status === 'failed' ? 'error' : 'info',
            title: `Extraction ${payload.new.batch_type}`,
            message: `Nouvelle extraction démarrée: ${payload.new.batch_id}`,
            timestamp: new Date(payload.new.created_at),
            read: false,
            category: 'extraction',
            priority: payload.new.status === 'failed' ? 'high' : 'medium'
          };

          setNotifications(prev => [newNotification, ...prev]);
          
          if (payload.new.status === 'failed') {
            toast.error('Extraction échouée', {
              description: `Batch ${payload.new.batch_id}`
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'operation_logs'
        },
        (payload) => {
          if (payload.new.type === 'error') {
            const newNotification: Notification = {
              id: `operation-${payload.new.id}`,
              type: 'error',
              title: 'Erreur système',
              message: payload.new.message || 'Une erreur est survenue',
              timestamp: new Date(payload.new.created_at),
              read: false,
              category: 'system',
              priority: 'high'
            };

            setNotifications(prev => [newNotification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== id)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `custom-${Date.now()}`,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast for high priority notifications
    if (notification.priority === 'urgent' || notification.type === 'critical') {
      toast.error(notification.title, {
        description: notification.message
      });
    }
  }, []);

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    unreadCount: notifications.filter(n => !n.read).length,
    criticalCount: notifications.filter(n => n.type === 'critical').length
  };
}