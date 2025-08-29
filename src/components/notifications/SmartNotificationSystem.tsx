import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Smartphone,
  Mail,
  MessageSquare,
  Calendar,
  Music,
  BookOpen,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  X,
  Pause,
  Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreference {
  type: string;
  enabled: boolean;
  sound: boolean;
  push: boolean;
  email: boolean;
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

interface SmartNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: number;
  category: 'learning' | 'music' | 'system' | 'social' | 'progress';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionable?: boolean;
  action?: () => void;
  actionLabel?: string;
}

export const SmartNotificationSystem = memo(() => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [preferences, setPreferences] = useState<Record<string, NotificationPreference>>({
    learning_progress: {
      type: 'learning_progress',
      enabled: true,
      sound: true,
      push: true,
      email: false,
      frequency: 'instant'
    },
    music_generated: {
      type: 'music_generated',
      enabled: true,
      sound: true,
      push: true,
      email: false,
      frequency: 'instant'
    },
    achievements: {
      type: 'achievements',
      enabled: true,
      sound: true,
      push: true,
      email: true,
      frequency: 'instant'
    },
    study_reminders: {
      type: 'study_reminders',
      enabled: true,
      sound: false,
      push: true,
      email: false,
      frequency: 'daily'
    },
    system_updates: {
      type: 'system_updates',
      enabled: true,
      sound: false,
      push: true,
      email: true,
      frequency: 'weekly'
    }
  });
  
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState({ start: 22, end: 8, enabled: true });
  const [adaptiveEnabled, setAdaptiveEnabled] = useState(true);

  // Détection intelligente des patterns d'utilisation
  const [userPatterns, setUserPatterns] = useState({
    activeHours: [9, 10, 11, 14, 15, 16, 19, 20, 21],
    preferredDevices: ['desktop', 'mobile'],
    responseRate: 0.75,
    mostEngagedWith: 'learning_progress'
  });

  // Génération de notifications intelligentes
  const generateSmartNotification = useCallback((
    type: SmartNotification['type'],
    category: SmartNotification['category'],
    title: string,
    message: string,
    priority: SmartNotification['priority'] = 'medium',
    actionable: boolean = false,
    action?: () => void,
    actionLabel?: string
  ) => {
    const notification: SmartNotification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      category,
      priority,
      read: false,
      actionable,
      action,
      actionLabel
    };

    // Vérification des préférences et logique adaptative
    const shouldShow = shouldShowNotification(notification);
    
    if (shouldShow) {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Limite à 50
      
      // Notification native si supportée et autorisée
      if ('Notification' in window && Notification.permission === 'granted') {
        const nativeNotif = new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
          requireInteraction: priority === 'urgent',
          silent: !soundEnabled || isQuietHours()
        });
        
        nativeNotif.onclick = () => {
          action?.();
          nativeNotif.close();
        };
      }

      // Son personnalisé
      if (soundEnabled && !isQuietHours() && preferences[category]?.sound) {
        playNotificationSound(priority);
      }

      // Toast pour les notifications importantes
      if (priority === 'high' || priority === 'urgent') {
        toast({
          title,
          description: message,
          duration: priority === 'urgent' ? 10000 : 5000
        });
      }
    }

    return notification.id;
  }, [preferences, soundEnabled, toast]);

  // Logique pour déterminer si une notification doit être affichée
  const shouldShowNotification = (notification: SmartNotification): boolean => {
    if (!globalEnabled) return false;
    
    const pref = preferences[notification.category];
    if (!pref?.enabled) return false;
    
    // Heures silencieuses
    if (isQuietHours() && notification.priority !== 'urgent') return false;
    
    // Logique adaptative basée sur les patterns d'utilisation
    if (adaptiveEnabled) {
      const currentHour = new Date().getHours();
      if (!userPatterns.activeHours.includes(currentHour) && notification.priority === 'low') {
        return false;
      }
      
      // Taux de réponse faible = moins de notifications non-urgentes
      if (userPatterns.responseRate < 0.3 && notification.priority !== 'urgent' && notification.priority !== 'high') {
        return Math.random() < 0.3; // 30% de chance seulement
      }
    }
    
    return true;
  };

  // Vérifie si on est dans les heures silencieuses
  const isQuietHours = (): boolean => {
    if (!quietHours.enabled) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    if (quietHours.start < quietHours.end) {
      return currentHour >= quietHours.start && currentHour < quietHours.end;
    } else {
      // Cas où les heures silencieuses traversent minuit
      return currentHour >= quietHours.start || currentHour < quietHours.end;
    }
  };

  // Joue un son de notification personnalisé selon la priorité
  const playNotificationSound = (priority: SmartNotification['priority']) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Fréquences selon la priorité
    const frequencies = {
      low: [440, 330],
      medium: [523, 659],
      high: [659, 783, 659],
      urgent: [880, 1047, 880, 1047]
    };
    
    const freqs = frequencies[priority];
    let currentNote = 0;
    
    const playNote = () => {
      oscillator.frequency.setValueAtTime(freqs[currentNote], audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      currentNote++;
      if (currentNote < freqs.length) {
        setTimeout(playNote, 200);
      }
    };
    
    oscillator.start();
    playNote();
    oscillator.stop(audioContext.currentTime + freqs.length * 0.2);
  };

  // Demande d'autorisation pour les notifications natives
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "✅ Notifications activées",
          description: "Vous recevrez désormais des notifications natives"
        });
      }
    }
  };

  // Marque une notification comme lue
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Supprime une notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Marque toutes comme lues
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  // Exemples de notifications pour démonstration
  useEffect(() => {
    const generateExamples = () => {
      generateSmartNotification(
        'success',
        'music',
        '🎵 Nouvelle musique générée',
        'Votre chanson sur la cardiologie est prête à écouter',
        'high',
        true,
        () => toast({ title: "Redirection vers la musique" }),
        'Écouter'
      );

      setTimeout(() => {
        generateSmartNotification(
          'achievement',
          'learning',
          '🏆 Objectif atteint !',
          'Vous avez terminé 5 items EDN aujourd\'hui',
          'medium',
          true,
          () => toast({ title: "Voir les progrès" }),
          'Voir'
        );
      }, 3000);

      setTimeout(() => {
        generateSmartNotification(
          'reminder',
          'learning',
          '📚 Session d\'étude recommandée',
          'Il est temps de réviser la neurologie selon votre planning',
          'low',
          true,
          () => toast({ title: "Commencer la révision" }),
          'Étudier'
        );
      }, 6000);
    };

    generateExamples();
  }, [generateSmartNotification, toast]);

  // Mise à jour des préférences
  const updatePreference = (type: string, key: keyof NotificationPreference, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value
      }
    }));
  };

  // Couleurs selon le type
  const getTypeColor = (type: SmartNotification['type']) => {
    const colors = {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      info: 'text-blue-600 bg-blue-100',
      error: 'text-red-600 bg-red-100',
      achievement: 'text-purple-600 bg-purple-100',
      reminder: 'text-orange-600 bg-orange-100'
    };
    return colors[type] || colors.info;
  };

  // Icônes selon la catégorie
  const getCategoryIcon = (category: SmartNotification['category']) => {
    const icons = {
      learning: BookOpen,
      music: Music,
      system: Settings,
      social: MessageSquare,
      progress: Trophy
    };
    return icons[category] || Bell;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles globaux */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {globalEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              Notifications Intelligentes
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Switch
                checked={globalEnabled}
                onCheckedChange={setGlobalEnabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={requestNotificationPermission}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Activer les notifications natives
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications ({notifications.length})</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune notification pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification) => {
                const IconComponent = getCategoryIcon(notification.category);
                return (
                  <Card 
                    key={notification.id}
                    className={`transition-all duration-200 ${
                      !notification.read ? 'border-primary/50 bg-primary/5' : 'bg-background'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {notification.actionable && notification.action && (
                            <Button
                              size="sm"
                              onClick={() => {
                                notification.action?.();
                                markAsRead(notification.id);
                              }}
                            >
                              {notification.actionLabel || 'Action'}
                            </Button>
                          )}
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Notifications Adaptatives</div>
                  <div className="text-sm text-muted-foreground">
                    Ajuste automatiquement selon vos habitudes d'utilisation
                  </div>
                </div>
                <Switch
                  checked={adaptiveEnabled}
                  onCheckedChange={setAdaptiveEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Heures Silencieuses</div>
                  <div className="text-sm text-muted-foreground">
                    22h - 8h (notifications urgentes uniquement)
                  </div>
                </div>
                <Switch
                  checked={quietHours.enabled}
                  onCheckedChange={(enabled) => 
                    setQuietHours(prev => ({ ...prev, enabled }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Préférences par Catégorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(preferences).map(([type, pref]) => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium capitalize">
                      {type.replace('_', ' ')}
                    </div>
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={(enabled) => 
                        updatePreference(type, 'enabled', enabled)
                      }
                    />
                  </div>
                  
                  {pref.enabled && (
                    <div className="ml-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Son</span>
                        <Switch
                          checked={pref.sound}
                          onCheckedChange={(sound) => 
                            updatePreference(type, 'sound', sound)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Notifications natives</span>
                        <Switch
                          checked={pref.push}
                          onCheckedChange={(push) => 
                            updatePreference(type, 'push', push)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email</span>
                        <Switch
                          checked={pref.email}
                          onCheckedChange={(email) => 
                            updatePreference(type, 'email', email)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

SmartNotificationSystem.displayName = 'SmartNotificationSystem';