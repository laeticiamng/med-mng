import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Check, Filter, Settings, X } from 'lucide-react';
import React, { useState } from 'react';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredNotifications = notifications.filter(notification => {
    const statusMatch = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read);
    
    const typeMatch = selectedType === 'all' || notification.type === selectedType;
    
    return statusMatch && typeMatch;
  });

  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const today = new Date().toDateString();
    const notificationDate = notification.timestamp.toDateString();
    
    let key = 'Aujourd\'hui';
    if (notificationDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      key = notificationDate === yesterday.toDateString() ? 'Hier' : 'Plus ancien';
    }
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return iconMap[type as keyof typeof iconMap] || 'ℹ️';
  };

  const getNotificationColor = (type: string) => {
    const colorMap = {
      success: 'bg-success/10 border-success/20',
      warning: 'bg-warning/10 border-warning/20',
      error: 'bg-destructive/10 border-destructive/20',
      info: 'bg-primary/10 border-primary/20'
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-muted border-muted';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
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
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-1" />
            Tout lire
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Toutes ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Lues ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 mt-4 mb-4">
            <Filter className="h-4 w-4" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="info">Informations</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissements</option>
              <option value="error">Erreurs</option>
            </select>
          </div>

          <TabsContent value={filter} className="mt-4">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : Object.keys(groupedNotifications).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune notification
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([date, notifications]) => (
                  <div key={date} className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {date}
                    </h3>
                    
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${getNotificationColor(notification.type)} ${
                            !notification.read ? 'shadow-md' : 'opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="text-lg">
                                {getNotificationIcon(notification.type)}
                              </span>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
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
                                  
                                  {notification.action && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() => window.open(notification.action?.url || '#', '_blank')}
                                    >
                                      {notification.action?.label || 'Voir'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};