import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from '@/components/ui/AccessibilityProvider';
import { 
  Bell, 
  X, 
  Check, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Music,
  BookOpen,
  Users,
  Settings,
  Zap,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'music' | 'study' | 'social' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  actions?: NotificationAction[];
  autoClose?: number; // ms
  persistent?: boolean;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  archiveNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface SmartNotificationSystemProps {
  children: React.ReactNode;
  maxNotifications?: number;
  persistentTypes?: NotificationType[];
}

export const SmartNotificationProvider: React.FC<SmartNotificationSystemProps> = ({
  children,
  maxNotifications = 50,
  persistentTypes = ['error', 'system']
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { announceToScreenReader } = useAccessibility();
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addNotification = useCallback((
    notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      id,
      timestamp: new Date(),
      read: false,
      priority: 'normal',
      ...notificationData
    };

    setNotifications(prev => {
      const updated = [notification, ...prev];
      
      // Limit the number of notifications
      if (updated.length > maxNotifications) {
        const toRemove = updated.slice(maxNotifications);
        toRemove.forEach(n => {
          const timeout = timeoutRefs.current.get(n.id);
          if (timeout) {
            clearTimeout(timeout);
            timeoutRefs.current.delete(n.id);
          }
        });
        return updated.slice(0, maxNotifications);
      }
      
      return updated;
    });

    // Screen reader announcement
    const priorityText = notification.priority === 'urgent' ? 'Urgent: ' : 
                        notification.priority === 'high' ? 'Important: ' : '';
    announceToScreenReader(
      `${priorityText}${notification.title}. ${notification.message}`,
      notification.priority === 'urgent' ? 'assertive' : 'polite'
    );

    // Auto-close functionality
    if (notification.autoClose && !notification.persistent && !persistentTypes.includes(notification.type)) {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, notification.autoClose);
      timeoutRefs.current.set(id, timeout);
    }

    return id;
  }, [maxNotifications, persistentTypes, announceToScreenReader]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    announceToScreenReader('Toutes les notifications ont été marquées comme lues', 'polite');
  }, [announceToScreenReader]);

  const clearAll = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    
    setNotifications([]);
    announceToScreenReader('Toutes les notifications ont été supprimées', 'polite');
  }, [announceToScreenReader]);

  const archiveNotification = useCallback((id: string) => {
    // In a real app, this would move to an archive instead of removing
    removeNotification(id);
    announceToScreenReader('Notification archivée', 'polite');
  }, [removeNotification, announceToScreenReader]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    archiveNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  className
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    archiveNotification,
    clearAll 
  } = useNotifications();
  const { announceToScreenReader, keyboardNavigation } = useAccessibility();
  const [filter, setFilter] = useState<'all' | NotificationType>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'type'>('timestamp');

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'music': return <Music className="w-4 h-4 text-primary" />;
      case 'study': return <BookOpen className="w-4 h-4 text-accent" />;
      case 'social': return <Users className="w-4 h-4 text-secondary" />;
      case 'system': return <Settings className="w-4 h-4 text-muted-foreground" />;
      default: return <Info className="w-4 h-4 text-info" />;
    }
  };

  const getNotificationTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'Succès';
      case 'error': return 'Erreur';
      case 'warning': return 'Avertissement';
      case 'music': return 'Musique';
      case 'study': return 'Étude';
      case 'social': return 'Social';
      case 'system': return 'Système';
      default: return 'Information';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const filteredNotifications = notifications
    .filter(n => filter === 'all' || n.type === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          return (priorityOrder[b.priority || 'normal'] || 2) - (priorityOrder[a.priority || 'normal'] || 2);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
      )}
      role="dialog"
      aria-labelledby="notification-panel-title"
      aria-modal="true"
    >
      <div className="fixed right-4 top-4 bottom-4 w-96 max-w-[calc(100vw-2rem)]">
        <Card className="h-full overflow-hidden shadow-2xl border-2">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 
                id="notification-panel-title"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Bell className="w-5 h-5 text-primary" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Fermer les notifications"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters and Actions */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
                  aria-label="Filtrer les notifications"
                >
                  <option value="all">Toutes</option>
                  <option value="info">Informations</option>
                  <option value="success">Succès</option>
                  <option value="warning">Avertissements</option>
                  <option value="error">Erreurs</option>
                  <option value="music">Musique</option>
                  <option value="study">Étude</option>
                  <option value="social">Social</option>
                  <option value="system">Système</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
                  aria-label="Trier les notifications"
                >
                  <option value="timestamp">Plus récentes</option>
                  <option value="priority">Par priorité</option>
                  <option value="type">Par type</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex-1 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Tout lire
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  className="flex-1 text-xs"
                >
                  <Archive className="w-3 h-3 mr-1" />
                  Tout effacer
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 h-[calc(100%-10rem)]">
            <div className="p-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {filter === 'all' ? 'Aucune notification' : `Aucune notification ${getNotificationTypeLabel(filter as NotificationType).toLowerCase()}`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={cn(
                          "p-3 rounded-lg border transition-colors cursor-pointer",
                          "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                          !notification.read && "bg-primary/5 border-primary/20",
                          notification.priority === 'urgent' && "border-destructive/50 bg-destructive/5",
                          notification.priority === 'high' && "border-warning/50 bg-warning/5"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleNotificationClick(notification);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Notification: ${notification.title}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                "font-medium text-sm truncate",
                                !notification.read && "text-foreground",
                                notification.read && "text-muted-foreground"
                              )}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {notification.priority && notification.priority !== 'normal' && (
                                  <Badge variant="outline" className={cn("text-xs h-5", getPriorityColor(notification.priority))}>
                                    {notification.priority}
                                  </Badge>
                                )}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full" aria-label="Non lu" />
                                )}
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {getNotificationTypeLabel(notification.type)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {notification.timestamp.toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="h-6 w-6 p-0"
                                    aria-label="Marquer comme lu"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    archiveNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0"
                                  aria-label="Archiver"
                                >
                                  <Archive className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 hover:text-destructive"
                                  aria-label="Supprimer"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Actions */}
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {notification.actions.map((action, actionIndex) => (
                                  <Button
                                    key={actionIndex}
                                    variant={action.variant || 'outline'}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.action();
                                    }}
                                    className="text-xs"
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {index < filteredNotifications.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

// Convenience hook for quick notifications
export const useQuickNotifications = () => {
  const { addNotification } = useNotifications();

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message: message || '',
      autoClose: 5000,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message: message || '',
      persistent: true,
      priority: 'high',
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message: message || '',
      autoClose: 8000,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message: message || '',
      autoClose: 6000,
      ...options
    });
  }, [addNotification]);

  const showMusicNotification = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'music',
      title,
      message: message || '',
      category: 'Génération musicale',
      autoClose: 10000,
      ...options
    });
  }, [addNotification]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showMusicNotification
  };
};