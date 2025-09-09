import React, { useState } from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  CheckCircle2, 
  Clock,
  Music,
  Award,
  Users,
  Settings,
  Trash2,
  Archive,
  Filter,
  MoreVertical,
  Volume2,
  Mail,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

const NewNotifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sound: true,
    achievements: true,
    songComplete: true,
    communityUpdates: false,
    systemAlerts: true
  });

  const notifications = [
    {
      id: 1,
      type: 'achievement',
      title: 'Nouveau succès débloqué !',
      message: 'Félicitations ! Vous avez débloqué le badge "Créateur Musical" pour avoir généré 10 chansons.',
      time: '2 minutes',
      read: false,
      priority: 'high',
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      id: 2,
      type: 'song',
      title: 'Chanson générée avec succès',
      message: 'Votre chanson "Relaxation Anatomie Avancée" est prête. Durée: 5:30 - Genre: Ambient.',
      time: '15 minutes',
      read: false,
      priority: 'medium',
      icon: Music,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'community',
      title: 'Nouveau commentaire',
      message: 'Dr. Marie a commenté votre chanson "Focus Cardiologie": "Excellent pour réviser ! Merci du partage."',
      time: '1 heure',
      read: true,
      priority: 'low',
      icon: Users,
      color: 'text-green-600'
    },
    {
      id: 4,
      type: 'system',
      title: 'Mise à jour disponible',
      message: 'Une nouvelle version de MED-MNG est disponible avec des améliorations de performance et de nouvelles fonctionnalités.',
      time: '2 heures',
      read: true,
      priority: 'medium',
      icon: Settings,
      color: 'text-purple-600'
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Série de 7 jours !',
      message: 'Bravo ! Vous avez maintenu une série de connexion de 7 jours consécutifs.',
      time: '1 jour',
      read: true,
      priority: 'high',
      icon: Award,
      color: 'text-orange-600'
    },
    {
      id: 6,
      type: 'song',
      title: 'Génération en attente',
      message: 'Votre demande de génération "Énergie Chirurgie Complexe" est en file d\'attente. Temps estimé: 2 minutes.',
      time: '2 jours',
      read: true,
      priority: 'low',
      icon: Clock,
      color: 'text-gray-600'
    }
  ];

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    today: notifications.filter(n => ['2 minutes', '15 minutes', '1 heure'].includes(n.time)).length,
    thisWeek: notifications.filter(n => !['2 jours'].includes(n.time)).length
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.read) return false;
    if (activeTab === 'read' && !notification.read) return false;
    if (filterType !== 'all' && notification.type !== filterType) return false;
    return true;
  });

  const markAsRead = (id: number) => {
    toast.success('Notification marquée comme lue');
  };

  const markAllAsRead = () => {
    toast.success('Toutes les notifications marquées comme lues');
  };

  const deleteNotification = (id: number) => {
    toast.success('Notification supprimée');
  };

  const archiveNotification = (id: number) => {
    toast.success('Notification archivée');
  };

  const updateSettings = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Paramètres mis à jour');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'achievement': return 'Succès';
      case 'song': return 'Musique';
      case 'community': return 'Communauté';
      case 'system': return 'Système';
      default: return 'Autre';
    }
  };

  return (
    <ConsistentBackground variant="primary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Notifications"
          subtitle="Restez informé de vos activités et accomplissements"
          icon={Bell}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
              <div className="text-sm text-muted-foreground">Non lues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
              <div className="text-sm text-muted-foreground">Aujourd'hui</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
              <div className="text-sm text-muted-foreground">Cette semaine</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">Toutes ({stats.total})</TabsTrigger>
              <TabsTrigger value="unread">Non lues ({stats.unread})</TabsTrigger>
              <TabsTrigger value="read">Lues</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="achievement">Succès</SelectItem>
                  <SelectItem value="song">Musique</SelectItem>
                  <SelectItem value="community">Communauté</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
              
              {stats.unread > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Tout marquer comme lu
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {filteredNotifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <Card key={notification.id} className={`transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full bg-muted ${notification.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className={`font-semibold ${!notification.read ? 'text-primary' : ''}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Marquer comme lu
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => archiveNotification(notification.id)}
                          >
                            <Archive className="h-4 w-4 mr-1" />
                            Archiver
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Aucune notification</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'unread' 
                      ? 'Toutes vos notifications sont lues !'
                      : 'Vous n\'avez pas encore de notifications.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {filteredNotifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <Card key={notification.id} className="border-l-4 border-l-primary bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full bg-muted ${notification.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-primary">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{notification.message}</p>
                        <Button 
                          size="sm" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Marquer comme lu
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="read" className="space-y-4">
            {filteredNotifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <Card key={notification.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full bg-muted ${notification.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">{notification.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notifications</CardTitle>
                <p className="text-muted-foreground">
                  Configurez comment et quand vous souhaitez recevoir des notifications
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Notifications par email</div>
                        <div className="text-sm text-muted-foreground">Recevez des résumés par email</div>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.email}
                      onCheckedChange={(checked) => updateSettings('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Notifications push</div>
                        <div className="text-sm text-muted-foreground">Notifications dans le navigateur</div>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.push}
                      onCheckedChange={(checked) => updateSettings('push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Sons de notification</div>
                        <div className="text-sm text-muted-foreground">Jouer un son pour les notifications importantes</div>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.sound}
                      onCheckedChange={(checked) => updateSettings('sound', checked)}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Types de notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-yellow-600" />
                        <div>
                          <div className="font-medium">Succès et badges</div>
                          <div className="text-sm text-muted-foreground">Nouveaux accomplissements</div>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.achievements}
                        onCheckedChange={(checked) => updateSettings('achievements', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Génération musicale</div>
                          <div className="text-sm text-muted-foreground">Quand vos musiques sont prêtes</div>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.songComplete}
                        onCheckedChange={(checked) => updateSettings('songComplete', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Activité communautaire</div>
                          <div className="text-sm text-muted-foreground">Commentaires et interactions</div>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.communityUpdates}
                        onCheckedChange={(checked) => updateSettings('communityUpdates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-purple-600" />
                        <div>
                          <div className="font-medium">Alertes système</div>
                          <div className="text-sm text-muted-foreground">Mises à jour et maintenance</div>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.systemAlerts}
                        onCheckedChange={(checked) => updateSettings('systemAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ConsistentBackground>
  );
};

export default NewNotifications;