import { useState } from 'react';
import { Bell, Check, X, Settings, Clock } from 'lucide-react'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Helmet } from 'react-helmet-async';

// Pure JS component with enhanced functionality
function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Nouvelle fonctionnalité IA disponible',
      message: 'Découvrez la génération de musique thérapeutique avec IA avancée',
      timestamp: new Date(),
      read: false,
      type: 'feature'
    },
    {
      id: '2', 
      title: 'Maintenance programmée',
      message: 'Maintenance de 2h prévue ce weekend pour améliorer les performances',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      type: 'maintenance'
    },
    {
      id: '3',
      title: 'Quota bientôt atteint', 
      message: 'Il vous reste 15% de votre quota mensuel de génération',
      timestamp: new Date(Date.now() - 7200000),
      read: true,
      type: 'warning'
    }
  ]);

  const [settings, setSettings] = useState({
    email: true,
    push: false,
    features: true,
    maintenance: true,
    quota: true,
    community: false
  });

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getTypeColor = (type) => {
    const colors = {
      feature: "bg-blue-500",
      maintenance: "bg-orange-500", 
      warning: "bg-yellow-500",
      error: "bg-red-500",
      success: "bg-green-500"
    };
    return colors[type] || "bg-gray-500";
  };

  const getTypeBadge = (type) => {
    const variants = {
      feature: "default",
      maintenance: "secondary",
      warning: "destructive",
      error: "destructive", 
      success: "default"
    };
    return variants[type] || "secondary";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h`;
    } else {
      return `${Math.floor(diff / 86400000)}j`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Helmet>
        <title>Notifications - MED-MNG</title>
        <meta name="description" content="Centre de notifications et préférences" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Bell className="h-8 w-8 text-primary" />
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-muted-foreground mt-2">
                  {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  Tout marquer comme lu
                </Button>
              )}
              <Button variant="outline" onClick={clearAll}>
                Tout effacer
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Notifications List */}
            <div className="lg:col-span-2 space-y-4">
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">Aucune notification</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card 
                    key={notification.id}
                    className={`cursor-pointer transition-all ${
                      !notification.read ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-3 h-3 rounded-full mt-2 ${getTypeColor(notification.type)}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-foreground">
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant={getTypeBadge(notification.type)}>
                                {notification.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Settings Panel */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Préférences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Moyens de notification</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email</span>
                        <Switch
                          checked={settings.email}
                          onCheckedChange={() => toggleSetting('email')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Notifications push</span>
                        <Switch
                          checked={settings.push}
                          onCheckedChange={() => toggleSetting('push')}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Types de notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Nouvelles fonctionnalités</span>
                        <Switch
                          checked={settings.features}
                          onCheckedChange={() => toggleSetting('features')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Maintenance</span>
                        <Switch
                          checked={settings.maintenance}
                          onCheckedChange={() => toggleSetting('maintenance')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Alertes quota</span>
                        <Switch
                          checked={settings.quota}
                          onCheckedChange={() => toggleSetting('quota')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Activité communauté</span>
                        <Switch
                          checked={settings.community}
                          onCheckedChange={() => toggleSetting('community')}
                        />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    Sauvegarder les préférences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;