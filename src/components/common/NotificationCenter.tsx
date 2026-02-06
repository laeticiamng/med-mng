import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertTriangle,
    Bell,
    BellOff,
    Check,
    CheckCircle,
    Info,
    Settings,
    Trash2,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
  action?: () => void;
  actionLabel?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  maxVisible?: number;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  maxVisible = 50
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-destructive bg-destructive/10';
      case 'high':
        return 'border-warning bg-warning/10';
      case 'medium':
        return 'border-warning/70 bg-warning/5';
      case 'low':
        return 'border-primary bg-primary/10';
      default:
        return 'border-muted bg-muted/50';
    }
  };

  const filteredNotifications = notifications
    .filter(notif => {
      if (filter === 'unread' && notif.read) return false;
      if (filter === 'critical' && notif.type !== 'critical') return false;
      if (categoryFilter !== 'all' && notif.category !== categoryFilter) return false;
      return true;
    })
    .slice(0, maxVisible)
    .sort((a, b) => {
      // Sort by priority, then by timestamp
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.type === 'critical').length;

  // Play sound for new critical notifications
  useEffect(() => {
    if (soundEnabled && criticalCount > 0) {
      // In a real app, you'd play a sound here
      if (import.meta.env.DEV) console.log('🔔 Critical notification sound');
    }
  }, [criticalCount, soundEnabled]);

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action) {
      notification.action();
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Centre de Notifications</span>
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unreadCount}
              </Badge>
            )}
            {criticalCount > 0 && (
              <Badge variant="destructive" className="bg-destructive">
                {criticalCount} critique{criticalCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Toutes ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Non lues ({unreadCount})
              </Button>
              <Button
                variant={filter === 'critical' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setFilter('critical')}
              >
                Critiques ({criticalCount})
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">Toutes catégories</option>
                <option value="system">Système</option>
                <option value="extraction">Extraction</option>
                <option value="quota">Quota</option>
                <option value="security">Sécurité</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
                      <Check className="h-4 w-4 mr-2" />
                      Tout marquer lu
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={onClearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vider tout
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* Notifications List */}
            <ScrollArea className="h-96 w-full">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                        getPriorityColor(notification.priority)
                      } ${
                        !notification.read ? 'bg-primary/10 border-primary' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {getIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'font-bold' : ''}`}>
                                  {notification.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                                <Badge 
                                  className={`text-xs ${
                                    notification.priority === 'urgent' ? 'bg-destructive' :
                                    notification.priority === 'high' ? 'bg-warning' :
                                    notification.priority === 'medium' ? 'bg-warning/70' :
                                    'bg-primary'
                                  }`}
                                >
                                  {notification.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(notification.timestamp)}
                                </span>
                                {notification.actionable && (
                                  <Button variant="outline" size="sm">
                                    {notification.actionLabel || 'Action'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notification.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <h3 className="font-medium">Paramètres de notification</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notifications sonores</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notifications critiques</span>
                  <Badge variant="destructive">Toujours actives</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rétention des notifications</span>
                  <span className="text-sm text-muted-foreground">7 jours</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}