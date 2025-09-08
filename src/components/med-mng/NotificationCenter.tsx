import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  X, 
  Music, 
  BookOpen, 
  Users, 
  Star,
  CheckCircle2,
  AlertCircle,
  Info,
  Trash2,
  Settings,
  Clock
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'music' | 'course' | 'social';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'music' | 'course' | 'social'>('all');
  const { toast } = useToast();

  // Mock notifications for demonstration
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'music',
        title: 'Nouvelle musique générée',
        message: 'Votre musique "Anatomie Cardiaque" a été générée avec succès',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        actionUrl: '/library',
        actionLabel: 'Écouter'
      },
      {
        id: '2',
        type: 'success',
        title: 'Quiz terminé',
        message: 'Félicitations ! Vous avez obtenu 18/20 au quiz de cardiologie',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false
      },
      {
        id: '3',
        type: 'course',
        title: 'Nouveau cours disponible',
        message: 'Le cours "Neurologie Avancée" est maintenant disponible',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true,
        actionUrl: '/courses',
        actionLabel: 'Voir le cours'
      },
      {
        id: '4',
        type: 'info',
        title: 'Mise à jour de quota',
        message: 'Votre quota mensuel a été renouvelé. Vous avez 50 générations disponibles',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true
      },
      {
        id: '5',
        type: 'social',
        title: 'Nouveau follower',
        message: 'Dr. Sophie Martin suit maintenant vos playlists',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'music':
        return notification.type === 'music';
      case 'course':
        return notification.type === 'course';
      case 'social':
        return notification.type === 'social';
      default:
        return true;
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'music':
        return <Music className="h-5 w-5 text-blue-500" />;
      case 'course':
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      case 'social':
        return <Users className="h-5 w-5 text-pink-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'À l\'instant';
    if (diffInMins < 60) return `Il y a ${diffInMins}min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return timestamp.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    toast({
      title: "Notifications marquées comme lues",
      description: "Toutes les notifications ont été marquées comme lues"
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée"
    });
  };

  const clearAll = () => {
    setNotifications([]);
    toast({
      title: "Toutes les notifications supprimées",
      description: "Votre centre de notifications a été vidé"
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-96 bg-background border-l shadow-2xl z-50"
          >
            <Card className="h-full border-0 rounded-none">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <CardTitle>Notifications</CardTitle>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-1 mt-3">
                  {[
                    { key: 'all', label: 'Toutes' },
                    { key: 'unread', label: 'Non lues' },
                    { key: 'music', label: 'Musique' },
                    { key: 'course', label: 'Cours' },
                    { key: 'social', label: 'Social' }
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant={filter === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(key as any)}
                      className="text-xs h-7"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-0 h-full">
                <ScrollArea className="h-full">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 px-4 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Aucune notification</p>
                      <p className="text-sm">
                        {filter === 'unread' 
                          ? 'Toutes vos notifications ont été lues'
                          : 'Vous n\'avez aucune notification pour le moment'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 hover:bg-muted/50 transition-colors ${
                            !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`text-sm font-medium ${
                                  !notification.read ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {notification.title}
                                </h4>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTimestamp(notification.timestamp)}</span>
                                </div>
                                
                                {notification.actionUrl && notification.actionLabel && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast({
                                        title: "Navigation",
                                        description: `Redirection vers ${notification.actionLabel}`
                                      });
                                    }}
                                  >
                                    {notification.actionLabel}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Footer Actions */}
                {notifications.length > 0 && (
                  <div className="border-t p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      className="w-full gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer toutes les notifications
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};