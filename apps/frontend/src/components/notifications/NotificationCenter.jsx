import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Settings, 
  Music, 
  Shield, 
  Users,
  TrendingUp,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';

/**
 * Centre de Notifications Avancé
 */
export const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Génération Audio Terminée',
      message: 'Votre piste musicale thérapeutique a été générée avec succès',
      time: '2 minutes',
      read: false,
      category: 'music',
      icon: Music,
      action: { label: 'Écouter', path: '/med-mng/library' }
    },
    {
      id: 2,
      type: 'warning',
      title: 'Maintenance Programmée',
      message: 'Maintenance système prévue demain de 2h à 4h du matin',
      time: '1 heure',
      read: false,
      category: 'system',
      icon: Settings,
      action: { label: 'Détails', path: '/admin-panel' }
    },
    {
      id: 3,
      type: 'info',
      title: 'Nouveau Utilisateur',
      message: '3 nouveaux utilisateurs se sont inscrits aujourd\'hui',
      time: '3 heures',
      read: true,
      category: 'users',
      icon: Users,
      action: { label: 'Voir', path: '/admin-panel' }
    },
    {
      id: 4,
      type: 'success',
      title: 'Audit Complété',
      message: 'L\'audit de sécurité système s\'est terminé sans problème',
      time: '5 heures',
      read: true,
      category: 'security',
      icon: Shield,
      action: { label: 'Rapport', path: '/audit' }
    },
    {
      id: 5,
      type: 'info',
      title: 'Mise à Jour Disponible',
      message: 'Une nouvelle version de la plateforme est disponible',
      time: '1 jour',
      read: false,
      category: 'system',
      icon: TrendingUp,
      action: { label: 'Mettre à jour', path: '/admin-panel' }
    }
  ]);

  const [filter, setFilter] = useState('all');
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return X;
      default: return Info;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md border-l bg-background shadow-lg">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="border-b p-4">
            <div className="flex gap-2">
              {['all', 'unread', 'read'].map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                  className="text-xs"
                >
                  {filterType === 'all' ? 'Toutes' : 
                   filterType === 'unread' ? 'Non lues' : 'Lues'}
                </Button>
              ))}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="mt-2 text-xs text-muted-foreground"
              >
                Marquer tout comme lu
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const CategoryIcon = notification.icon;
                
                return (
                  <Card 
                    key={notification.id}
                    className={`transition-all hover:shadow-md cursor-pointer ${
                      !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className={`rounded-full p-2 ${
                            notification.type === 'success' ? 'bg-success/10' :
                            notification.type === 'warning' ? 'bg-warning/10' :
                            notification.type === 'error' ? 'bg-destructive/10' :
                            'bg-primary/10'
                          }`}>
                            <CategoryIcon className={`h-4 w-4 ${getNotificationColor(notification.type)}`} />
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <div className="flex items-center gap-1">
                              <IconComponent className={`h-3 w-3 ${getNotificationColor(notification.type)}`} />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-destructive/10"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Il y a {notification.time}
                            </span>
                            
                            {notification.action && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Navigation vers l'action
                                }}
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4">
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres de notification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;