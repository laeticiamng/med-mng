import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Bell, 
  Check, 
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  Music,
  BookOpen,
  Users,
  AlertCircle,
  Info,
  Star,
  Clock,
  X
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'music' | 'learning' | 'social' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
  category: string;
  metadata?: Record<string, any>;
}

// Données de test pour les notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'music',
    title: 'Nouvelle chanson générée',
    message: 'Votre chanson "Anatomie Cardiaque" a été générée avec succès !',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    read: false,
    priority: 'medium',
    category: 'Génération',
    actionUrl: '/med-mng/library',
    actionLabel: 'Écouter'
  },
  {
    id: '2',
    type: 'learning',
    title: 'Nouvel item EDN ajouté',
    message: 'L\'item IC-236 "Insuffisance cardiaque" est maintenant disponible',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    read: false,
    priority: 'high',
    category: 'Contenu',
    actionUrl: '/edn/IC-236',
    actionLabel: 'Découvrir'
  },
  {
    id: '3',
    type: 'system',
    title: 'Maintenance programmée',
    message: 'Une maintenance aura lieu dimanche de 2h à 4h du matin',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    priority: 'low',
    category: 'Système'
  },
  {
    id: '4',
    type: 'social',
    title: 'Nouveau commentaire',
    message: 'Dr. Martin a commenté votre playlist "Cardiologie Essentielle"',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
    read: false,
    priority: 'medium',
    category: 'Communauté',
    actionUrl: '/med-mng/community',
    actionLabel: 'Voir'
  },
  {
    id: '5',
    type: 'success',
    title: 'Quiz terminé',
    message: 'Excellent ! Vous avez obtenu 18/20 au quiz "Anatomie cardiaque"',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
    read: true,
    priority: 'medium',
    category: 'Évaluation'
  },
  {
    id: '6',
    type: 'warning',
    title: 'Quota presque atteint',
    message: 'Il vous reste 2 générations musicales ce mois-ci',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
    read: false,
    priority: 'high',
    category: 'Quota',
    actionUrl: '/med-mng/pricing',
    actionLabel: 'Upgrader'
  }
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'music': return Music;
    case 'learning': return BookOpen;
    case 'social': return Users;
    case 'error': return AlertCircle;
    case 'warning': return AlertCircle;
    case 'success': return Check;
    case 'system': return Settings;
    default: return Info;
  }
};

const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
  if (priority === 'urgent') return 'text-red-600 dark:text-red-400';
  if (priority === 'high') return 'text-orange-600 dark:text-orange-400';
  
  switch (type) {
    case 'music': return 'text-blue-600 dark:text-blue-400';
    case 'learning': return 'text-green-600 dark:text-green-400';
    case 'social': return 'text-purple-600 dark:text-purple-400';
    case 'error': return 'text-red-600 dark:text-red-400';
    case 'warning': return 'text-yellow-600 dark:text-yellow-400';
    case 'success': return 'text-green-600 dark:text-green-400';
    case 'system': return 'text-gray-600 dark:text-gray-400';
    default: return 'text-blue-600 dark:text-blue-400';
  }
};

const getPriorityBadgeVariant = (priority: Notification['priority']) => {
  switch (priority) {
    case 'urgent': return 'destructive';
    case 'high': return 'secondary';
    case 'medium': return 'outline';
    case 'low': return 'secondary';
    default: return 'outline';
  }
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (notification: Notification) => void;
}> = ({ notification, onMarkAsRead, onDelete, onAction }) => {
  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type, notification.priority);

  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 hover:bg-accent/50 ${
      notification.read ? 'bg-muted/30' : 'bg-card'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`mt-1 ${colorClass}`}>
          <Icon size={18} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                  {notification.title}
                </h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={getPriorityBadgeVariant(notification.priority)} className="text-xs">
                    {notification.category}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock size={10} className="mr-1" />
                    {formatDistanceToNow(notification.timestamp, { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </div>
                </div>
                
                {notification.actionUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAction?.(notification)}
                    className="text-xs h-6"
                  >
                    {notification.actionLabel || 'Voir'}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 w-6 p-0"
                  title="Marquer comme lu"
                >
                  <Check size={12} />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(notification.id)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                title="Supprimer"
              >
                <X size={12} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<Notification['type'] | 'all'>('all');
  const { toast } = useToast();

  // Statistiques des notifications
  const stats = useMemo(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;
    const totalCount = notifications.length;
    
    return { unreadCount, urgentCount, totalCount };
  }, [notifications]);

  // Filtrer les notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesReadFilter = 
        filter === 'all' || 
        (filter === 'unread' && !notification.read) ||
        (filter === 'read' && notification.read);
      
      const matchesTypeFilter = 
        typeFilter === 'all' || notification.type === typeFilter;
      
      return matchesReadFilter && matchesTypeFilter;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notifications, filter, typeFilter]);

  // Types de notifications disponibles
  const availableTypes = useMemo(() => {
    const types = Array.from(new Set(notifications.map(n => n.type)));
    return types.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      count: notifications.filter(n => n.type === type).length
    }));
  }, [notifications]);

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    toast({
      title: "Notifications marquées",
      description: "Toutes les notifications ont été marquées comme lues"
    });
  }, [toast]);

  const handleDelete = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
    toast({
      title: "Notifications supprimées",
      description: "Toutes les notifications ont été supprimées"
    });
  }, [toast]);

  const handleNotificationAction = useCallback((notification: Notification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    handleMarkAsRead(notification.id);
  }, [handleMarkAsRead]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label={`Notifications (${stats.unreadCount} non lues)`}
        >
          <Bell size={20} />
          {stats.unreadCount > 0 && (
            <>
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {stats.unreadCount > 9 ? '9+' : stats.unreadCount}
              </Badge>
              {stats.urgentCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bell size={18} />
                <span><TranslatedText text="Notifications" /></span>
                {stats.unreadCount > 0 && (
                  <Badge variant="secondary">
                    {stats.unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMarkAllAsRead}
                  disabled={stats.unreadCount === 0}
                  className="text-xs"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearAll}
                  disabled={stats.totalCount === 0}
                  className="text-xs text-destructive hover:text-destructive"
                  title="Tout supprimer"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-4">
            {/* Filtres */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                {(['all', 'unread', 'read'] as const).map(filterType => (
                  <Button
                    key={filterType}
                    size="sm"
                    variant={filter === filterType ? "default" : "ghost"}
                    onClick={() => setFilter(filterType)}
                    className="text-xs h-7"
                  >
                    {filterType === 'all' ? 'Tout' : 
                     filterType === 'unread' ? 'Non lues' : 'Lues'}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant={typeFilter === 'all' ? "default" : "ghost"}
                  onClick={() => setTypeFilter('all')}
                  className="text-xs h-7"
                >
                  <Filter size={12} className="mr-1" />
                  Tous types
                </Button>
                {availableTypes.slice(0, 3).map(type => (
                  <Button
                    key={type.value}
                    size="sm"
                    variant={typeFilter === type.value ? "default" : "ghost"}
                    onClick={() => setTypeFilter(type.value as Notification['type'])}
                    className="text-xs h-7"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Liste des notifications */}
            <ScrollArea className="h-80">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <Bell className="mx-auto text-muted-foreground" size={32} />
                  <p className="text-muted-foreground">
                    <TranslatedText text="Aucune notification" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {filter === 'unread' 
                      ? "Toutes vos notifications ont été lues"
                      : "Vous n'avez aucune notification"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      onAction={handleNotificationAction}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer avec statistiques */}
            {stats.totalCount > 0 && (
              <>
                <Separator className="mt-4 mb-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {stats.totalCount} notification{stats.totalCount !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center space-x-3">
                    {stats.unreadCount > 0 && (
                      <span className="flex items-center">
                        <Star size={10} className="mr-1" />
                        {stats.unreadCount} non lue{stats.unreadCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {stats.urgentCount > 0 && (
                      <span className="flex items-center text-red-600">
                        <AlertCircle size={10} className="mr-1" />
                        {stats.urgentCount} urgent{stats.urgentCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;