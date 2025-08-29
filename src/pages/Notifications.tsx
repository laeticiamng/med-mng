import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { usePlatformAnalytics } from '@/hooks/usePlatformAnalytics';
import { 
  Bell, 
  Check, 
  X, 
  Settings, 
  Search, 
  Filter,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Star,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

const Notifications: React.FC = () => {
  const { getDashboardStats, markNotificationRead } = usePlatformAnalytics();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    marketing_notifications: false,
    security_alerts: true,
    activity_updates: true,
    system_maintenance: true
  });

  useEffect(() => {
    const loadNotifications = async () => {
      const stats = await getDashboardStats();
      if (stats?.notifications) {
        // Mock additional notifications for demo
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Bienvenue sur MED-MNG',
            message: 'Votre compte a été créé avec succès. Explorez toutes les fonctionnalités disponibles.',
            type: 'success',
            is_read: false,
            action_url: '/platform',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
          },
          {
            id: '2',
            title: 'Maintenance planifiée',
            message: 'Une maintenance système est prévue demain de 2h à 4h du matin.',
            type: 'warning',
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2h ago
          },
          {
            id: '3',
            title: 'Nouveau contenu disponible',
            message: 'De nouveaux modules EDN ont été ajoutés à la plateforme.',
            type: 'info',
            is_read: true,
            action_url: '/edn',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
          },
          {
            id: '4',
            title: 'Limite de quota atteinte',
            message: 'Vous avez utilisé 90% de votre quota mensuel. Considérez une mise à niveau.',
            type: 'warning',
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
          },
          {
            id: '5',
            title: 'Fonctionnalité mise à jour',
            message: 'Le système d\'analytics a été amélioré avec de nouvelles métriques.',
            type: 'info',
            is_read: false,
            action_url: '/analytics',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
          }
        ];
        
        setNotifications([...stats.notifications, ...mockNotifications]);
      }
      setLoading(false);
    };

    loadNotifications();
  }, [getDashboardStats]);

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationRead(notificationId);
    if (result.success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    
    for (const notification of unreadNotifications) {
      await markNotificationRead(notification.id);
    }
    
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-400" />;
      case 'info':
      default: return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} jour(s)`;
  };

  const filteredNotifications = notifications
    .filter(notif => {
      const matchesSearch = searchQuery === '' || 
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesReadFilter = filterType === 'all' || 
        (filterType === 'read' && notif.is_read) ||
        (filterType === 'unread' && !notif.is_read);
      
      const matchesTypeFilter = selectedType === 'all' || notif.type === selectedType;
      
      return matchesSearch && matchesReadFilter && matchesTypeFilter;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <ConsistentBackground variant="secondary">
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Bell className="h-10 w-10" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                  )}
                </h1>
                <p className="text-white/70">Gérez vos notifications et préférences</p>
              </div>
              
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Tout marquer lu
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="list" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              {/* Filtres et recherche */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                      <Input
                        placeholder="Rechercher dans les notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-3 py-2 bg-white/5 border border-white/20 text-white rounded-md text-sm"
                      >
                        <option value="all">Toutes</option>
                        <option value="unread">Non lues</option>
                        <option value="read">Lues</option>
                      </select>
                      
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as any)}
                        className="px-3 py-2 bg-white/5 border border-white/20 text-white rounded-md text-sm"
                      >
                        <option value="all">Tous types</option>
                        <option value="info">Info</option>
                        <option value="success">Succès</option>
                        <option value="warning">Avertissement</option>
                        <option value="error">Erreur</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des notifications */}
              <div className="space-y-4">
                {loading ? (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white/70">Chargement des notifications...</p>
                    </CardContent>
                  </Card>
                ) : filteredNotifications.length === 0 ? (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="py-12 text-center">
                      <Bell className="h-12 w-12 text-white/50 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-medium mb-2">
                        Aucune notification
                      </h3>
                      <p className="text-white/60">
                        {searchQuery || filterType !== 'all' || selectedType !== 'all'
                          ? 'Aucune notification ne correspond à vos critères.'
                          : 'Vous n\'avez aucune notification pour le moment.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-200 ${
                        !notification.is_read ? 'border-l-4 border-l-blue-400' : ''
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getTypeIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="text-white font-medium mb-1">
                                  {notification.title}
                                  {!notification.is_read && (
                                    <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-200 text-xs">
                                      Nouveau
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-white/70 text-sm mb-2">{notification.message}</p>
                                
                                <div className="flex items-center gap-3 text-white/50 text-xs">
                                  <Clock className="h-3 w-3" />
                                  <span>{getTimeAgo(notification.created_at)}</span>
                                  <Badge variant="outline" className="border-white/20 text-white/60">
                                    {notification.type}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {!notification.is_read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-white/70 hover:text-white hover:bg-white/10"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="text-white/70 hover:text-red-400 hover:bg-white/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {notification.action_url && (
                              <Button
                                size="sm"
                                className="mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                asChild
                              >
                                <a href={notification.action_url}>Voir plus</a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Préférences de notification</CardTitle>
                  <CardDescription className="text-white/70">
                    Configurez comment vous souhaitez recevoir les notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Notifications par email</Label>
                        <p className="text-sm text-white/70">Recevez des emails pour les notifications importantes</p>
                      </div>
                      <Switch
                        checked={settings.email_notifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Notifications push</Label>
                        <p className="text-sm text-white/70">Notifications dans le navigateur</p>
                      </div>
                      <Switch
                        checked={settings.push_notifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push_notifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Marketing et promotions</Label>
                        <p className="text-sm text-white/70">Nouveautés et offres spéciales</p>
                      </div>
                      <Switch
                        checked={settings.marketing_notifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, marketing_notifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Alertes de sécurité</Label>
                        <p className="text-sm text-white/70">Notifications critiques de sécurité</p>
                      </div>
                      <Switch
                        checked={settings.security_alerts}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, security_alerts: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Mises à jour d'activité</Label>
                        <p className="text-sm text-white/70">Résumés de votre activité</p>
                      </div>
                      <Switch
                        checked={settings.activity_updates}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, activity_updates: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Maintenance système</Label>
                        <p className="text-sm text-white/70">Notifications de maintenance planifiée</p>
                      </div>
                      <Switch
                        checked={settings.system_maintenance}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, system_maintenance: checked }))}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                      Sauvegarder les préférences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Notifications;