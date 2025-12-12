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