import React, { useEffect } from 'react';
import { 
  Bell, X, Check, CheckCheck, Trash2, Info, 
  AlertTriangle, CheckCircle, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotifications } from '@/contexts/NotificationContext';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NotificationCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  actionable?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-success" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    default:
      return <Info className="w-4 h-4 text-primary" />;
  }
};

const getNotificationBorderColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'border-l-success';
    case 'warning':
      return 'border-l-warning';
    case 'error':
      return 'border-l-destructive';
    default:
      return 'border-l-primary';
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const {
    notifications,
    removeNotification,
    clearAll
  } = useNotifications();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    if (isOpen) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'notification_center', action: 'open' }
      });
    }
  }, [isOpen]);

  // Notifications incluant gamification
  const demoNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: '🏆 Badge débloqué !',
      message: 'Félicitations ! Vous avez débloqué le badge "Série de 7 jours".',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      actionable: true,
      action: { label: 'Voir mes badges', handler: () => {} }
    },
    {
      id: '2',
      type: 'success',
      title: 'Musique générée',
      message: 'Votre musique pour IC-157 a été générée avec succès !',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      actionable: true,
      action: { label: 'Écouter', handler: () => {} }
    },
    {
      id: '3',
      type: 'warning',
      title: '🔥 Streak en danger !',
      message: 'N\'oubliez pas de réviser aujourd\'hui pour maintenir votre série de 5 jours.',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      read: false,
      actionable: true,
      action: { label: 'Réviser maintenant', handler: () => {} }
    },
    {
      id: '4',
      type: 'info',
      title: '⬆️ Niveau supérieur !',
      message: 'Vous êtes passé au niveau 8 ! +500 XP bonus.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: true
    },
    {
      id: '5',
      type: 'info',
      title: 'Nouveau contenu',
      message: 'De nouveaux items EDN sont disponibles.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true
    }
  ];

  const unreadCount = demoNotifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    // Logique pour marquer comme lu
  };

  const markAllAsRead = () => {
    // Logique pour tout marquer comme lu
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      notification.action.handler();
    }
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div
      className={`p-4 border-l-4 ${getNotificationBorderColor(notification.type)} ${
        !notification.read ? 'bg-primary/5' : 'bg-card'
      } border border-border rounded-r-lg cursor-pointer hover:bg-muted transition-colors`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getNotificationIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-foreground">
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.timestamp, {
                  addSuffix: true, 
                  locale: fr 
                })}
              </span>
              {notification.actionable && (
                <Badge variant="outline" className="text-xs">
                  {notification.action?.label || 'Action disponible'}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            removeNotification(notification.id);
          }}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  const content = (
    <div className="h-full flex flex-col">
      <SheetHeader className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </SheetTitle>
            <SheetDescription>
              {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Aucune nouvelle notification'}
            </SheetDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {demoNotifications.length > 0 && (
          <div className="flex items-center gap-2 pt-3">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="w-3 h-3 mr-1" />
                Tout marquer comme lu
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 className="w-3 h-3 mr-1" />
              Tout supprimer
            </Button>
          </div>
        )}
      </SheetHeader>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {demoNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aucune notification
              </h3>
              <p className="text-muted-foreground">
                Vous n'avez aucune notification pour le moment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {demoNotifications.map((notification) => (
                <div key={notification.id} className="group">
                  <NotificationItem notification={notification} />
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (isOpen !== undefined) {
    // Mode contrôlé (avec props isOpen/onClose)
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:w-96">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  // Mode non-contrôlé (avec trigger intégré)
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96">
        {content}
      </SheetContent>
    </Sheet>
  );
};