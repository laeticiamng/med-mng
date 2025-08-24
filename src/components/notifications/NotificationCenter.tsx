import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Star, 
  Users, 
  Music, 
  BookOpen, 
  Trophy,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Heart,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'achievement' | 'social' | 'study' | 'system' | 'music' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
  action?: {
    label: string;
    url?: string;
    callback?: () => void;
  };
}

interface NotificationSettings {
  achievements: boolean;
  social: boolean;
  study: boolean;
  system: boolean;
  music: boolean;
  reminders: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
}

export const NotificationCenter: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    achievements: true,
    social: true,
    study: true,
    system: true,
    music: true,
    reminders: true,
    sound: true,
    desktop: true,
    email: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'today'>('all');

  // Notifications simulées
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'achievement',
        title: 'Nouveau succès débloqué !',
        message: 'Félicitations ! Vous avez obtenu le badge "Virtuose Musical" en créant 25 chansons éducatives.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        priority: 'high',
        actionable: true,
        action: { label: 'Voir le badge', url: '/profile' }
      },
      {
        id: '2',
        type: 'social',
        title: 'Nouveau commentaire',
        message: 'Dr. Martin a commenté votre chanson "IC-230 Insuffisance cardiaque" : "Excellente mémorisation !"',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        priority: 'medium',
        actionable: true,
        action: { label: 'Répondre', url: '/library' }
      },
      {
        id: '3',
        type: 'study',
        title: 'Révision programmée',
        message: 'Il est temps de réviser "IC-91 Déficit neurologique". Votre dernière session remonte à 3 jours.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        priority: 'medium',
        actionable: true,
        action: { label: 'Commencer', url: '/edn/ic-91' }
      },
      {
        id: '4',
        type: 'music',
        title: 'Génération terminée',
        message: 'Votre chanson pour "IC-156 BPCO" est prête ! Style Electronic, durée 3m42s.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        read: true,
        priority: 'low',
        actionable: true,
        action: { label: 'Écouter', url: '/generator' }
      },
      {
        id: '5',
        type: 'system',
        title: 'Mise à jour disponible',
        message: 'Une nouvelle version de MED MNG est disponible avec des améliorations de performance.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        priority: 'low',
        actionable: true,
        action: { label: 'Mettre à jour', callback: () => toast({ title: 'Mise à jour en cours...' }) }
      }
    ];
    setNotifications(mockNotifications);
  }, [toast]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-400" />;
      case 'social': return <Users className="h-4 w-4 text-blue-400" />;
      case 'study': return <BookOpen className="h-4 w-4 text-green-400" />;
      case 'system': return <Info className="h-4 w-4 text-gray-400" />;
      case 'music': return <Music className="h-4 w-4 text-purple-400" />;
      case 'reminder': return <Clock className="h-4 w-4 text-orange-400" />;
      default: return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-400';
      case 'medium': return 'border-l-yellow-400';
      case 'low': return 'border-l-green-400';
      default: return 'border-l-gray-400';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: 'Toutes les notifications marquées comme lues' });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(n => {
    switch (filter) {
      case 'unread': return !n.read;
      case 'today': return n.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000);
      default: return true;
    }
  });

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      <div className="w-full max-w-md mt-16 mr-4">
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <BellRing className="h-5 w-5 text-blue-400" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500/20 text-red-300 border-red-400/30">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {!showSettings && (
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Button
                    variant={filter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}
                  >
                    Toutes
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                    className={filter === 'unread' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}
                  >
                    Non lues
                  </Button>
                  <Button
                    variant={filter === 'today' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('today')}
                    className={filter === 'today' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}
                  >
                    Aujourd'hui
                  </Button>
                </div>
                
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Tout lire
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            {showSettings ? (
              <div className="p-4 space-y-4">
                <h4 className="text-white font-medium">Paramètres de Notification</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span className="text-white text-sm">Succès et badges</span>
                    </div>
                    <Switch 
                      checked={settings.achievements}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, achievements: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">Interactions sociales</span>
                    </div>
                    <Switch 
                      checked={settings.social}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, social: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-400" />
                      <span className="text-white text-sm">Rappels d'étude</span>
                    </div>
                    <Switch 
                      checked={settings.study}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, study: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-purple-400" />
                      <span className="text-white text-sm">Génération musicale</span>
                    </div>
                    <Switch 
                      checked={settings.music}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, music: checked }))}
                    />
                  </div>
                  
                  <hr className="border-white/20" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {settings.sound ? <Volume2 className="h-4 w-4 text-green-400" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
                      <span className="text-white text-sm">Sons de notification</span>
                    </div>
                    <Switch 
                      checked={settings.sound}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sound: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">Notifications bureau</span>
                    </div>
                    <Switch 
                      checked={settings.desktop}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, desktop: checked }))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="p-4 space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400">Aucune notification</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} ${
                          notification.read ? 'bg-white/5 border-white/10' : 'bg-blue-500/10 border-white/20'
                        } hover:bg-white/10 transition-colors`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="text-white font-medium text-sm truncate">
                                  {notification.title}
                                </h5>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-gray-300 text-xs mb-2 leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500 text-xs">
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                                {notification.actionable && notification.action && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-white border-white/20 hover:bg-white/10"
                                    onClick={() => {
                                      if (notification.action?.callback) {
                                        notification.action.callback();
                                      }
                                      markAsRead(notification.id);
                                    }}
                                  >
                                    {notification.action.label}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};