/**
 * Liste des notifications avec actions
 */

import React from 'react';
import { Eye, Search, AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const NotificationList: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'trending-item':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'popular-search':
        return <Search className="h-4 w-4 text-green-600" />;
      case 'performance-alert':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };
  
  if (notifications.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune notification</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            Tout marquer lu
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs"
          >
            Effacer
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors hover:bg-muted/50 ${
                notification.read ? 'opacity-60' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(notification.timestamp, { 
                      addSuffix: true,
                      locale: fr 
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
