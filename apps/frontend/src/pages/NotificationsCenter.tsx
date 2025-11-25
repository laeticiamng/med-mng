import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import {
  Bell,
  Settings,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Clock3,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export default function NotificationsCenter() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('read', false);
      } else if (filter === 'read') {
        query = query.eq('read', true);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  const unreadCount = notifications?.filter(n => !(n.read ?? n.is_read)).length || 0;
  const totalCount = notifications?.length || 0;
  const readCount = totalCount - unreadCount;

  const typeBreakdown =
    notifications?.reduce<Record<string, number>>((acc, notification) => {
      const type = notification.type || 'général';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

  const lastNotificationDate = notifications?.[0]?.created_at
    ? new Date(notifications[0].created_at).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Aucune notification';

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - target.getTime()) / (1000 * 60));

    if (diffMinutes < 60) return `Il y a ${diffMinutes || 1} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} j`;
  };

  return (
    <>
      <Helmet>
        <title>Notifications | Med-Mng</title>
        <meta name="description" content="Centre de notifications et alertes" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && <Badge variant="destructive">{unreadCount} non lues</Badge>}
            </div>
            <p className="text-muted-foreground">Gérez vos notifications et restez informé</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Tout marquer comme lu
            </Button>
            <Link to={ROUTE_PATHS.notificationsSettings}>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
            </Link>
          </div>
        </div>

        {/* Global overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardDescription>Total reçu</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Bell className="h-5 w-5 text-primary" />
                {totalCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {lastNotificationDate === 'Aucune notification'
                ? 'En attente de premières alertes'
                : `Dernière mise à jour : ${lastNotificationDate}`}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Taux de lecture</CardDescription>
              <CardTitle className="text-2xl">
                {totalCount ? Math.round((readCount / totalCount) * 100) : 0}%
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={totalCount ? (readCount / totalCount) * 100 : 0} />
              <p className="text-xs text-muted-foreground">
                {readCount} lues · {unreadCount} en attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Activité récente</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Clock3 className="h-5 w-5 text-amber-500" />
                {Math.min(unreadCount, 99)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Alertes arrivées depuis votre dernière visite
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Répartition</CardDescription>
              <CardTitle className="text-xl">Top catégories</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(typeBreakdown).length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune catégorie détectée</p>
              ) : (
                Object.entries(typeBreakdown)
                  .sort(([, aCount], [, bCount]) => bCount - aCount)
                  .slice(0, 3)
                  .map(([type, count]) => (
                    <Badge key={type} variant="secondary" className="capitalize">
                      {type} · {count}
                    </Badge>
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Toutes
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            size="sm"
          >
            Non lues ({unreadCount})
          </Button>
          <Button
            variant={filter === 'read' ? 'default' : 'outline'}
            onClick={() => setFilter('read')}
            size="sm"
          >
            Lues
          </Button>
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            Visualisez vos alertes et l'état de lecture en un coup d'œil.
          </span>
        </div>

        {notifications && notifications.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Temps réel</CardTitle>
              <CardDescription>Les 3 dernières notifications arrivées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.slice(0, 3).map(notification => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between rounded-lg bg-muted/40 p-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="capitalize">
                        {notification.type || 'général'}
                      </Badge>
                      {!(notification.read ?? notification.is_read) && (
                        <Badge variant="secondary" className="text-[11px]">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium leading-tight">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(notification.created_at)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-accent transition-colors ${
                      !(notification.read ?? notification.is_read) ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <Badge variant="outline" className="capitalize">
                            {notification.type || 'général'}
                          </Badge>
                          {!(notification.read ?? notification.is_read) && (
                            <Badge variant="secondary" className="text-xs">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span>{formatRelativeTime(notification.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!(notification.read ?? notification.is_read) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune notification pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
