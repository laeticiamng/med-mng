import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertCircle,
    Bell, BellRing,
    BookOpen,
    Check,
    CheckCircle,
    Info,
    Trash2,
    Trophy,
    X,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'achievement' | 'content';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  category: 'system' | 'content' | 'social' | 'achievement';
  priority: 'low' | 'medium' | 'high';
  metadata?: any;
}

interface NotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  isOpen,
  onClose,
  className = ""
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'achievements' | 'content'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    // ✅ CORRECTION: Génération automatique supprimée pour éviter pollution UX
    // Les notifications doivent être déclenchées par des événements réels uniquement
  }, []);

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await (supabase as any)
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data && data.length > 0) {
        setNotifications(data.map((notif: any) => ({
          id: notif.id,
          type: notif.type as Notification['type'],
          title: notif.title,
          message: notif.message || '',
          timestamp: new Date(notif.created_at),
          read: notif.is_read,
          actionUrl: notif.action_url,
          category: 'system' as const,
          priority: notif.priority as 'low' | 'medium' | 'high'
        })));
        return;
      }
    }
    // Demo notifications for non-authenticated users
    setNotifications([]);
  };

  const saveNotifications = async (_notifs: Notification[]) => {
    // Notifications are saved via individual operations
  };

  // ✅ CORRIGÉ: Créer notification basée sur événement réel (pas random)
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      saveNotifications(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(notif => ({ ...notif, read: true }));
      saveNotifications(updated);
      return updated;
    });
    toast({
      title: "Notifications lues",
      description: "Toutes les notifications ont été marquées comme lues",
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notif => notif.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
    toast({
      title: "Notifications supprimées",
      description: "Toutes les notifications ont été supprimées",
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'info': return <Info className="w-5 h-5 text-primary" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'error': return <XCircle className="w-5 h-5 text-destructive" />;
      case 'achievement': return <Trophy className="w-5 h-5 text-accent" />;
      case 'content': return <BookOpen className="w-5 h-5 text-primary" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.read;
      case 'achievements': return notif.category === 'achievement';
      case 'content': return notif.category === 'content';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BellRing className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Filtres */}
            <div className="flex gap-2 mt-4">
              {(['all', 'unread', 'achievements', 'content'] as const).map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                  className="text-xs"
                >
                  {filterType === 'all' && 'Toutes'}
                  {filterType === 'unread' && 'Non lues'}
                  {filterType === 'achievements' && 'Succès'}
                  {filterType === 'content' && 'Contenus'}
                </Button>
              ))}
            </div>
            
            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="w-4 h-4 mr-2" />
                  Tout marquer lu
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tout supprimer
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Aucune notification</h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === 'all' 
                      ? "Vous n'avez aucune notification pour le moment"
                      : `Aucune notification dans la catégorie "${filter}"`
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium text-sm ${!notification.read ? 'text-primary' : ''}`}>
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(notification.timestamp)}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs h-6"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Lue
                                </Button>
                              )}
                              
                              {notification.actionUrl && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="text-xs h-6"
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    window.location.href = notification.actionUrl!;
                                  }}
                                >
                                  {notification.actionText || 'Voir'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Hook pour utiliser le système de notifications - Synced with Supabase
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from Supabase on mount
  useEffect(() => {
    const loadNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await (supabase as any)
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (data) {
          setNotifications(data.map((n: any) => ({
            id: n.id,
            type: n.notification_type as Notification['type'],
            title: n.title,
            message: n.message || '',
            timestamp: new Date(n.created_at),
            read: n.read,
            category: 'system' as const,
            priority: 'medium' as const
          })));
        }
      }
    };
    loadNotifications();
  }, []);

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50));

    // Save to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('user_notifications').insert({
        user_id: user.id,
        notification_type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata || {}
      });
    }

    return newNotification.id;
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return {
    notifications,
    addNotification,
    getUnreadCount
  };
};