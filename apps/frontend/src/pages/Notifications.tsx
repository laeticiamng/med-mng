import { useState, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Bell,
  Search,
  Trash2,
  Settings,
  CheckCheck,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import {
  useFetchNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '@/hooks/useNotificationsService';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userId = user?.id ?? '';

  // Queries
  const { data: notifications = [], isLoading } = useFetchNotifications(userId, 100);

  // Mutations
  const markAsReadMutation = useMarkAsRead(userId);
  const markAllAsReadMutation = useMarkAllAsRead(userId);
  const deleteNotificationMutation = useDeleteNotification(userId);
  const deleteAllMutation = useDeleteAllNotifications(userId);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.length - unreadCount;

  const tabLabels: Record<string, string> = {
    all: 'Toutes',
    like: "J'aime",
    comment: 'Commentaires',
    follow: 'Abonnements',
    mention: 'Mentions',
  };

  const typeCounts = useMemo(
    () =>
      notifications.reduce(
        (acc, notification) => {
          acc[notification.type] = (acc[notification.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    [notifications]
  );

  // Filter and search
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by type
    if (activeTab !== 'all') {
      filtered = filtered.filter(n => n.type === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        n =>
          n.title.toLowerCase().includes(query) ||
          (n.message && n.message.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [notifications, activeTab, searchQuery]);

  const filteredCount = filteredNotifications.length;

  const completionRate = notifications.length
    ? Math.round((readCount / notifications.length) * 100)
    : 0;

  const unauthenticatedView = (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentification requise</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Veuillez vous connecter pour accéder à vos notifications.
          </p>
          <Button className="w-full mt-4" onClick={() => navigate('/login')}>
            Se connecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (!user) {
    return unauthenticatedView;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDelete = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteAll = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      deleteAllMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-2">Gérez et consultez vos notifications</p>
          </div>
          <Link to="/settings/notifications">
            <Button variant="outline" size="icon" data-testid="notification-settings-button">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Overview */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Progression de lecture
                </p>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold">
                    {completionRate}% des notifications traitées
                  </span>
                  <Badge variant="secondary">{readCount} lues</Badge>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${completionRate}%` }}
                    aria-label={`Progression de lecture ${completionRate}%`}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Cliquez sur une notification pour la marquer comme lue et garder votre centre à
                  jour.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Astuces de gestion</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Utilisez les onglets pour filtrer rapidement par type.</li>
                      <li>"Marquer tout comme lu" permet de réinitialiser votre compteur.</li>
                      <li>Supprimez les alertes obsolètes pour garder un historique clair.</li>
                    </ul>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="outline" className="capitalize" key="all">
                        Toutes {notifications.length ? `• ${notifications.length}` : ''}
                      </Badge>
                      {Object.entries(typeCounts).map(([type, count]) => (
                        <Badge key={type} variant="outline" className="capitalize">
                          {type} • {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Notifications totales</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Non lues</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{readCount}</p>
                <p className="text-sm text-muted-foreground">Lues</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex gap-2 mb-6">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              data-testid="mark-all-read-button"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marquer tout comme lu
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              disabled={deleteAllMutation.isPending}
              data-testid="delete-all-button"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tout supprimer
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans vos notifications..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="notification-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground mb-4">
          <div>
            Affichage de <span className="font-semibold text-foreground">{filteredCount}</span>{' '}
            notification{filteredCount > 1 ? 's' : ''} sur {notifications.length}.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Filtre actif : {tabLabels[activeTab]}</Badge>
            {searchQuery && <Badge variant="secondary">Recherche : “{searchQuery}”</Badge>}
            {!searchQuery && <Badge variant="secondary">Aucune recherche active</Badge>}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tous ({notifications.length})</TabsTrigger>
            <TabsTrigger value="like">J'aime ({typeCounts.like || 0})</TabsTrigger>
            <TabsTrigger value="comment">Commentaires ({typeCounts.comment || 0})</TabsTrigger>
            <TabsTrigger value="follow">Follow ({typeCounts.follow || 0})</TabsTrigger>
            <TabsTrigger value="mention">AtSigns ({typeCounts.mention || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full rounded" />
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? 'Aucune notification ne correspond à votre recherche'
                      : activeTab === 'all'
                        ? 'Aucune notification pour le moment'
                        : `Aucune notification de type ${activeTab}`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map(notification => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.is_read
                        ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800'
                        : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                    data-testid={`notification-item-${notification.id}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-base line-clamp-1">
                                  {notification.title}
                                </p>
                                {!notification.is_read && (
                                  <Badge variant="default" className="text-xs">
                                    Nouveau
                                  </Badge>
                                )}
                              </div>
                              {notification.message && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {notification.message}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={e => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              disabled={deleteNotificationMutation.isPending}
                              data-testid={`delete-notification-${notification.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
