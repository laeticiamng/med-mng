import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  ExternalLink,
  CheckCheck 
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.action?.url) {
      navigate(notification.action.url);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Restez informé des dernières mises à jour et de vos progrès
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Actions globales */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {notifications.length} notification{notifications.length > 1 ? 's' : ''}
            </span>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Tout marquer lu
              </Button>
            )}
          </div>

          {/* Liste des notifications */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune notification</p>
                  <p className="text-sm text-muted-foreground">
                    Vous serez notifié des nouvelles mises à jour ici
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      notification.read 
                        ? 'bg-muted/30 border-muted' 
                        : 'bg-background border-primary/20 shadow-sm'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Indicateur non lu */}
                    {!notification.read && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
                    )}

                    {/* Bouton supprimer */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className={`font-medium text-sm ${
                            notification.read ? 'text-muted-foreground' : 'text-foreground'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm ${
                            notification.read ? 'text-muted-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.message}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </span>

                          {notification.action && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                            >
                              {notification.action.label}
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Préférences de notification */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                navigate('/settings/notifications');
                onClose();
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Paramètres de notification
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};