import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, BellRing, Check, X, Trash2, Settings,
  BookOpen, Music, Users, Trophy, AlertCircle,
  Info, CheckCircle, XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const loadNotifications = () => {
    // Charger depuis localStorage ou API
    const saved = localStorage.getItem('user-notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed.map((notif: any) => ({
        ...notif,
        timestamp: new Date(notif.timestamp)
      })));
    } else {
      // Notifications de démo
      const demoNotifications: Notification[] = [
        {
          id: '1',
          type: 'achievement',
          title: 'Nouveau badge débloqué !',
          message: 'Félicitations ! Vous avez obtenu le badge "Studieux" pour 100 heures d\'étude.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          category: 'achievement',
          priority: 'high',
          actionUrl: '/achievements',
          actionText: 'Voir mes badges'
        },
        {
          id: '2',
          type: 'content',
          title: 'Nouveau contenu disponible',
          message: 'De nouveaux items EDN en cardiologie sont maintenant disponibles.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
          category: 'content',
          priority: 'medium',
          actionUrl: '/edn-complete',
          actionText: 'Explorer'
        },
        {
          id: '3',
          type: 'info',
          title: 'Mise à jour de profil',
          message: 'N\'oubliez pas de compléter votre profil pour une expérience personnalisée.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          read: true,
          category: 'system',
          priority: 'low',
          actionUrl: '/med-mng/profile',
          actionText: 'Compléter'
        }
      ];
      setNotifications(demoNotifications);
      saveNotifications(demoNotifications);
    }
  };

  const saveNotifications = (notifs: Notification[]) => {
    localStorage.setItem('user-notifications', JSON.stringify(notifs));
  };

  const generateRandomNotification = () => {
    const types: Notification['type'][] = ['success', 'info', 'achievement', 'content'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const messages = {
      success: {
        title: 'Progrès accompli !',
        message: 'Vous avez complété un nouveau module avec succès.'
      },
      info: {
        title: 'Rappel d\'étude',
        message: 'Il est temps de continuer votre session d\'étude quotidienne.'
      },
      achievement: {
        title: 'Objectif atteint !',
        message: 'Vous avez atteint votre objectif d\'étude de la semaine.'
      },
      content: {
        title: 'Nouveau contenu',
        message: 'Du nouveau contenu musical éducatif est disponible.'
      }
    };

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: randomType,
      title: messages[randomType].title,
      message: messages[randomType].message,
      timestamp: new Date(),
      read: false,
      category: randomType === 'achievement' ? 'achievement' : 'content',
      priority: 'medium'
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Garder max 50 notifications
      saveNotifications(updated);
      return updated;
    });

    // Toast pour notification temps réel
    toast({
      title: newNotification.title,
      description: newNotification.message,
    });
  };

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

// Hook pour utiliser le système de notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50);
      localStorage.setItem('user-notifications', JSON.stringify(updated));
      return updated;
    });

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