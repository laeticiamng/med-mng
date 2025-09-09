import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  Clock, 
  User,
  MessageSquare,
  Award,
  Calendar,
  BookOpen,
  Target,
  Users,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  RotateCcw
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'study_reminder' | 'achievement' | 'social' | 'system' | 'deadline' | 'recommendation';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  actionLabel?: string;
  relatedUser?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    itemId?: string;
    groupId?: string;
    achievementId?: string;
  };
}

interface NotificationSettings {
  studyReminders: boolean;
  achievements: boolean;
  socialActivity: boolean;
  systemUpdates: boolean;
  deadlineAlerts: boolean;
  recommendations: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export const EdnNotifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Données simulées
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: 'n1',
        type: 'study_reminder',
        title: 'Rappel d\'étude quotidien',
        message: 'Il est temps de reprendre votre session sur l\'insuffisance cardiaque aiguë',
        createdAt: '2024-01-15T14:30:00',
        isRead: false,
        isImportant: true,
        actionUrl: '/edn/insuffisance-cardiaque-aigue',
        actionLabel: 'Continuer l\'étude',
        metadata: { itemId: 'ic-001' }
      },
      {
        id: 'n2',
        type: 'achievement',
        title: 'Nouveau succès débloqué !',
        message: 'Félicitations ! Vous avez obtenu le badge "Streak de feu" pour 5 jours consécutifs d\'étude',
        createdAt: '2024-01-15T10:15:00',
        isRead: false,
        isImportant: true,
        actionUrl: '/profile/achievements',
        actionLabel: 'Voir mes succès',
        metadata: { achievementId: 'streak-5' }
      },
      {
        id: 'n3',
        type: 'social',
        title: 'Nouvelle réponse à votre discussion',
        message: 'Thomas a répondu à votre question sur les critères diagnostiques',
        createdAt: '2024-01-15T09:45:00',
        isRead: true,
        isImportant: false,
        relatedUser: {
          name: 'Thomas Dubois',
          avatar: '/avatars/thomas.jpg'
        },
        actionUrl: '/collaboration/discussions/d1',
        actionLabel: 'Voir la discussion',
        metadata: { groupId: 'g1' }
      },
      {
        id: 'n4',
        type: 'deadline',
        title: 'Échéance dans 2 jours',
        message: 'Votre objectif hebdomadaire "Compléter 5 items" se termine bientôt',
        createdAt: '2024-01-14T18:00:00',
        isRead: true,
        isImportant: true,
        actionUrl: '/dashboard/goals',
        actionLabel: 'Voir mes objectifs'
      },
      {
        id: 'n5',
        type: 'recommendation',
        title: 'Nouvel item recommandé',
        message: 'Basé sur votre progression, nous vous recommandons "Pneumonie communautaire"',
        createdAt: '2024-01-14T16:30:00',
        isRead: false,
        isImportant: false,
        actionUrl: '/edn/pneumonie-communautaire',
        actionLabel: 'Découvrir',
        metadata: { itemId: 'ic-002' }
      },
      {
        id: 'n6',
        type: 'system',
        title: 'Nouvelle fonctionnalité disponible',
        message: 'Découvrez les sessions d\'étude collaborative avec vos groupes',
        createdAt: '2024-01-14T12:00:00',
        isRead: true,
        isImportant: false,
        actionUrl: '/collaboration/sessions',
        actionLabel: 'Explorer'
      }
    ];

    const mockSettings: NotificationSettings = {
      studyReminders: true,
      achievements: true,
      socialActivity: true,
      systemUpdates: false,
      deadlineAlerts: true,
      recommendations: true,
      emailNotifications: true,
      pushNotifications: true,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00'
      },
      frequency: 'immediate'
    };

    setNotifications(mockNotifications);
    setSettings(mockSettings);
  }, []);

  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;

    // Filtrage par statut
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'important') {
      filtered = filtered.filter(n => n.isImportant);
    }

    // Filtrage par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, filter, selectedType]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({
      title: "Toutes les notifications marquées comme lues",
      description: `${notifications.filter(n => !n.isRead).length} notifications mises à jour`
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée de votre liste"
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "Toutes les notifications supprimées",
      description: "Votre liste de notifications a été vidée"
    });
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    if (!settings) return;
    
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
    toast({
      title: "Paramètres mis à jour",
      description: "Vos préférences de notification ont été sauvegardées"
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'study_reminder': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'achievement': return <Award className="h-5 w-5 text-yellow-600" />;
      case 'social': return <Users className="h-5 w-5 text-green-600" />;
      case 'system': return <Settings className="h-5 w-5 text-gray-600" />;
      case 'deadline': return <Calendar className="h-5 w-5 text-red-600" />;
      case 'recommendation': return <BookOpen className="h-5 w-5 text-purple-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseColors = {
      study_reminder: 'border-l-blue-500',
      achievement: 'border-l-yellow-500',
      social: 'border-l-green-500',
      system: 'border-l-gray-500',
      deadline: 'border-l-red-500',
      recommendation: 'border-l-purple-500'
    };

    return `${baseColors[type as keyof typeof baseColors] || 'border-l-gray-500'} ${
      !isRead ? 'bg-blue-50/50' : ''
    }`;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      study_reminder: 'Rappel d\'étude',
      achievement: 'Succès',
      social: 'Social',
      system: 'Système',
      deadline: 'Échéance',
      recommendation: 'Recommandation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR');
  };

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-muted-foreground">Chargement des notifications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Bell className="h-7 w-7" />
                Notifications
              </CardTitle>
              <CardDescription className="text-indigo-100 mt-2">
                Restez informé de votre progression et des activités communautaires
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {unreadCount} non lues
                </Badge>
              )}
              {importantCount > 0 && (
                <Badge variant="secondary" className="bg-red-500 text-white">
                  {importantCount} importantes
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="notifications">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Contrôles */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Filtres */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="all">Toutes</option>
                      <option value="unread">Non lues ({unreadCount})</option>
                      <option value="important">Importantes ({importantCount})</option>
                    </select>
                  </div>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">Tous les types</option>
                    <option value="study_reminder">Rappels d'étude</option>
                    <option value="achievement">Succès</option>
                    <option value="social">Social</option>
                    <option value="deadline">Échéances</option>
                    <option value="recommendation">Recommandations</option>
                    <option value="system">Système</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Tout marquer comme lu
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Tout supprimer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des notifications */}
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune notification</h3>
                <p className="text-muted-foreground">
                  {filter === 'unread' 
                    ? 'Toutes vos notifications ont été lues' 
                    : filter === 'important'
                    ? 'Aucune notification importante'
                    : 'Vous n\'avez pas encore de notifications'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-l-4 cursor-pointer transition-all hover:shadow-md ${
                    getNotificationColor(notification.type, notification.isRead)
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            
                            {notification.isImportant && (
                              <Badge variant="destructive" className="text-xs">
                                Important
                              </Badge>
                            )}
                            
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          
                          <p className={`text-sm mb-2 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(notification.type)}
                              </Badge>
                              
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                              
                              {notification.relatedUser && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {notification.relatedUser.name}
                                </span>
                              )}
                            </div>
                            
                            {notification.actionUrl && (
                              <Button variant="ghost" size="sm" className="text-xs">
                                {notification.actionLabel || 'Voir'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-1"
                        >
                          {notification.isRead ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-blue-600" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-red-600 hover:text-red-700"
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
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Types de notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Types de notifications</CardTitle>
                <CardDescription>
                  Choisissez les types de notifications que vous souhaitez recevoir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Rappels d'étude</span>
                    </div>
                    <Switch
                      checked={settings.studyReminders}
                      onCheckedChange={(checked) => updateSetting('studyReminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Succès et récompenses</span>
                    </div>
                    <Switch
                      checked={settings.achievements}
                      onCheckedChange={(checked) => updateSetting('achievements', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Activité sociale</span>
                    </div>
                    <Switch
                      checked={settings.socialActivity}
                      onCheckedChange={(checked) => updateSetting('socialActivity', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Alertes d'échéances</span>
                    </div>
                    <Switch
                      checked={settings.deadlineAlerts}
                      onCheckedChange={(checked) => updateSetting('deadlineAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Recommandations</span>
                    </div>
                    <Switch
                      checked={settings.recommendations}
                      onCheckedChange={(checked) => updateSetting('recommendations', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Mises à jour système</span>
                    </div>
                    <Switch
                      checked={settings.systemUpdates}
                      onCheckedChange={(checked) => updateSetting('systemUpdates', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Canaux de notification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Canaux de notification</CardTitle>
                <CardDescription>
                  Configurez comment vous souhaitez recevoir les notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Notifications email</span>
                    <div className="text-xs text-muted-foreground">Recevoir par email</div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Notifications push</span>
                    <div className="text-xs text-muted-foreground">Dans le navigateur</div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fréquence</label>
                  <select
                    value={settings.frequency}
                    onChange={(e) => updateSetting('frequency', e.target.value)}
                    className="w-full text-sm border rounded px-2 py-1"
                  >
                    <option value="immediate">Immédiate</option>
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Heures de silence */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Heures de silence</CardTitle>
                <CardDescription>
                  Définissez une période pendant laquelle vous ne recevrez pas de notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Activer les heures de silence</span>
                  <Switch
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(checked) => updateSetting('quietHours', { 
                      ...settings.quietHours, 
                      enabled: checked 
                    })}
                  />
                </div>
                
                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Début</label>
                      <input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => updateSetting('quietHours', {
                          ...settings.quietHours,
                          start: e.target.value
                        })}
                        className="w-full text-sm border rounded px-2 py-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Fin</label>
                      <input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => updateSetting('quietHours', {
                          ...settings.quietHours,
                          end: e.target.value
                        })}
                        className="w-full text-sm border rounded px-2 py-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Les paramètres sont automatiquement sauvegardés
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};