import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { 
  Bell, 
  Music, 
  CheckCircle, 
  Settings, 
  Trash2, 
  Volume2,
  MessageSquare,
  Star,
  Clock,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'music_generated',
      title: 'Musique générée avec succès',
      message: 'Votre chanson "Concentration - Anatomie" est prête à l\'écoute',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      icon: Music,
      color: 'text-green-500'
    },
    {
      id: '2',
      type: 'system',
      title: 'Mise à jour disponible',
      message: 'Une nouvelle version de MED-MNG est disponible avec des améliorations de performance',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: Settings,
      color: 'text-blue-500'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Objectif atteint !',
      message: 'Félicitations ! Vous avez généré 10 musiques ce mois-ci',
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Session d\'étude programmée',
      message: 'N\'oubliez pas votre session d\'étude de cardiologie à 14h',
      read: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      icon: Clock,
      color: 'text-purple-500'
    }
  ]);

  const [settings, setSettings] = useState({
    musicGeneration: true,
    systemUpdates: true,
    achievements: true,
    reminders: true,
    emailNotifications: false,
    pushNotifications: true,
    soundNotifications: true
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ConsistentBackground>
      <Helmet>
        <title>Notifications | MED-MNG</title>
        <meta name="description" content="Gérez vos notifications et préférences de MED-MNG." />
      </Helmet>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Notifications
              </h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune nouvelle notification'}
              </p>
            </div>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tout marquer lu
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAll}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Tout effacer
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Toutes ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="settings">
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Aucune notification
                </h3>
                <p className="text-muted-foreground">
                  Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.
                </p>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className={`transition-all ${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full bg-background ${notification.color}`}>
                        <notification.icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(notification.createdAt, { 
                                addSuffix: true, 
                                locale: fr 
                              })}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {notifications.filter(n => !n.read).length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Tout est lu !
                </h3>
                <p className="text-muted-foreground">
                  Vous avez lu toutes vos notifications.
                </p>
              </Card>
            ) : (
              notifications
                .filter(n => !n.read)
                .map((notification) => (
                  <Card key={notification.id} className="border-primary/50 bg-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full bg-background ${notification.color}`}>
                          <notification.icon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">
                                  {notification.title}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  Nouveau
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-sm mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notification.createdAt, { 
                                  addSuffix: true, 
                                  locale: fr 
                                })}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Types de notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Génération de musique</h4>
                    <p className="text-sm text-muted-foreground">Notifications quand vos musiques sont prêtes</p>
                  </div>
                  <Switch
                    checked={settings.musicGeneration}
                    onCheckedChange={(value) => updateSetting('musicGeneration', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Mises à jour système</h4>
                    <p className="text-sm text-muted-foreground">Informations sur les nouvelles fonctionnalités</p>
                  </div>
                  <Switch
                    checked={settings.systemUpdates}
                    onCheckedChange={(value) => updateSetting('systemUpdates', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Objectifs et réussites</h4>
                    <p className="text-sm text-muted-foreground">Félicitations pour vos accomplissements</p>
                  </div>
                  <Switch
                    checked={settings.achievements}
                    onCheckedChange={(value) => updateSetting('achievements', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Rappels d'étude</h4>
                    <p className="text-sm text-muted-foreground">Notifications pour vos sessions programmées</p>
                  </div>
                  <Switch
                    checked={settings.reminders}
                    onCheckedChange={(value) => updateSetting('reminders', value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Méthodes de notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Notifications push</h4>
                    <p className="text-sm text-muted-foreground">Notifications dans l'application</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(value) => updateSetting('pushNotifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Notifications email</h4>
                    <p className="text-sm text-muted-foreground">Recevoir par email les notifications importantes</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(value) => updateSetting('emailNotifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Sons de notification</h4>
                    <p className="text-sm text-muted-foregroup">Jouer un son lors des notifications</p>
                  </div>
                  <Switch
                    checked={settings.soundNotifications}
                    onCheckedChange={(value) => updateSetting('soundNotifications', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ConsistentBackground>
  );
};

export default Notifications;