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

  // Load notifications from database
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Utiliser les mock uniquement si pas connecté
          setNotifications(generateMockNotifications());
          return;
        }

        // Charger les notifications depuis les différentes sources
        const [extractionLogs, operationLogs] = await Promise.all([
          supabase
            .from('extraction_logs')
            .select('id, batch_id, batch_type, status, created_at')
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('operation_logs')
            .select('id, type, message, created_at')
            .order('created_at', { ascending: false })
            .limit(10)
        ]);

        const dbNotifications: Notification[] = [];

        // Convertir les extraction_logs en notifications
        extractionLogs.data?.forEach((log: any) => {
          dbNotifications.push({
            id: `extraction-${log.id}`,
            type: log.status === 'failed' ? 'error' : log.status === 'completed' ? 'success' : 'info',
            title: `Extraction ${log.batch_type || 'EDN'}`,
            message: log.status === 'failed'
              ? `L'extraction ${log.batch_id} a échoué`
              : `Extraction ${log.batch_id}: ${log.status}`,
            timestamp: new Date(log.created_at),
            read: log.status === 'completed',
            category: 'extraction',
            priority: log.status === 'failed' ? 'urgent' : 'medium',
            actionable: log.status === 'failed',
            action: log.status === 'failed' ? {
              label: 'Voir détails',
              url: '/admin/extractions'
            } : undefined
          });
        });

        // Convertir les operation_logs en notifications
        operationLogs.data?.forEach((log: any) => {
          if (log.type === 'error' || log.type === 'warning') {
            dbNotifications.push({
              id: `operation-${log.id}`,
              type: log.type === 'error' ? 'error' : 'warning',
              title: log.type === 'error' ? 'Erreur système' : 'Avertissement',
              message: log.message || 'Une opération a rencontré un problème',
              timestamp: new Date(log.created_at),
              read: false,
              category: 'system',
              priority: log.type === 'error' ? 'high' : 'medium'
            });
          }
        });

        // Trier par date et garder les plus récentes
        dbNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Si aucune notification, utiliser quelques exemples de base
        if (dbNotifications.length === 0) {
          setNotifications([{
            id: 'welcome',
            type: 'info',
            title: 'Bienvenue !',
            message: 'Aucune notification pour le moment.',
            timestamp: new Date(),
            read: true,
            category: 'system',
            priority: 'low'
          }]);
        } else {
          setNotifications(dbNotifications.slice(0, 20));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast.error('Erreur lors du chargement des notifications');
        // Fallback sur mock en cas d'erreur
        setNotifications(generateMockNotifications());
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

  // Get notifications by category
  const getByCategory = useCallback((category: Notification['category']): Notification[] => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  // Get notifications by type
  const getByType = useCallback((type: Notification['type']): Notification[] => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get notifications by priority
  const getByPriority = useCallback((priority: Notification['priority']): Notification[] => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  // Get unread notifications
  const getUnread = useCallback((): Notification[] => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // Get actionable notifications
  const getActionable = useCallback((): Notification[] => {
    return notifications.filter(n => n.actionable);
  }, [notifications]);

  // Search notifications
  const searchNotifications = useCallback((query: string): Notification[] => {
    if (!query.trim()) return notifications;
    const queryLower = query.toLowerCase();
    return notifications.filter(n =>
      n.title.toLowerCase().includes(queryLower) ||
      n.message.toLowerCase().includes(queryLower)
    );
  }, [notifications]);

  // Get notifications from last N hours
  const getRecent = useCallback((hours: number = 24): Notification[] => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return notifications.filter(n => n.timestamp >= cutoff);
  }, [notifications]);

  // Sort notifications
  const sortNotifications = useCallback((
    by: 'date' | 'priority' | 'type',
    order: 'asc' | 'desc' = 'desc'
  ): Notification[] => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const typeOrder = { critical: 5, error: 4, warning: 3, info: 2, success: 1 };

    return [...notifications].sort((a, b) => {
      let comparison = 0;
      switch (by) {
        case 'date':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'type':
          comparison = typeOrder[a.type] - typeOrder[b.type];
          break;
      }
      return order === 'desc' ? -comparison : comparison;
    });
  }, [notifications]);

  // Get notification stats
  const getStats = useCallback((): {
    total: number;
    unread: number;
    byType: Record<Notification['type'], number>;
    byCategory: Record<Notification['category'], number>;
    byPriority: Record<Notification['priority'], number>;
  } => {
    const byType: Record<Notification['type'], number> = {
      info: 0, success: 0, warning: 0, error: 0, critical: 0
    };
    const byCategory: Record<Notification['category'], number> = {
      system: 0, extraction: 0, quota: 0, security: 0, maintenance: 0
    };
    const byPriority: Record<Notification['priority'], number> = {
      low: 0, medium: 0, high: 0, urgent: 0
    };

    notifications.forEach(n => {
      byType[n.type]++;
      byCategory[n.category]++;
      byPriority[n.priority]++;
    });

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType,
      byCategory,
      byPriority
    };
  }, [notifications]);

  // Get notification by ID
  const getById = useCallback((id: string): Notification | undefined => {
    return notifications.find(n => n.id === id);
  }, [notifications]);

  // Snooze notification (move to later)
  const snoozeNotification = useCallback((id: string, minutes: number) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          timestamp: new Date(Date.now() + minutes * 60 * 1000),
          read: true
        };
      }
      return n;
    }));
  }, []);

  // Mark category as read
  const markCategoryAsRead = useCallback((category: Notification['category']) => {
    setNotifications(prev =>
      prev.map(n =>
        n.category === category ? { ...n, read: true } : n
      )
    );
  }, []);

  // Delete all by category
  const deleteByCategory = useCallback((category: Notification['category']) => {
    setNotifications(prev => prev.filter(n => n.category !== category));
  }, []);

  // Export notifications
  const exportNotifications = useCallback((): string => {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      count: notifications.length,
      notifications: notifications.map(n => ({
        ...n,
        timestamp: n.timestamp.toISOString()
      }))
    }, null, 2);
  }, [notifications]);

  // Check if has unread
  const hasUnread = useCallback((): boolean => {
    return notifications.some(n => !n.read);
  }, [notifications]);

  // Check if has critical
  const hasCritical = useCallback((): boolean => {
    return notifications.some(n => n.type === 'critical' && !n.read);
  }, [notifications]);

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    unreadCount: notifications.filter(n => !n.read).length,
    criticalCount: notifications.filter(n => n.type === 'critical').length,
    getByCategory,
    getByType,
    getByPriority,
    getUnread,
    getActionable,
    searchNotifications,
    getRecent,
    sortNotifications,
    getStats,
    getById,
    snoozeNotification,
    markCategoryAsRead,
    deleteByCategory,
    exportNotifications,
    hasUnread,
    hasCritical
  };
}