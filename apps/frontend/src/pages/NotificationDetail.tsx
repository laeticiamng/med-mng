import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Bell, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function NotificationDetail() {
  const { notifId } = useParams<{ notifId: string }>();

  const { data: notification, isLoading } = useQuery({
    queryKey: ['notification', notifId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notifId)
        .single();

      if (error) throw error;

      // Mark as read
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notifId);

      return data;
    },
    enabled: !!notifId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Notification introuvable</p>
            <Link to={ROUTE_PATHS.notifications}>
              <Button variant="outline" className="mt-4">
                Retour aux notifications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{notification.title} | Notifications | Med-Mng</title>
        <meta name="description" content={notification.message} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link to={ROUTE_PATHS.notifications}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux notifications
            </Button>
          </Link>
        </div>

        {/* Notification Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <Badge variant={notification.type === 'info' ? 'default' : 'secondary'}>
                    {notification.type || 'info'}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{notification.title}</CardTitle>
                <CardDescription className="mt-2">
                  {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-base text-foreground whitespace-pre-wrap">
                {notification.message}
              </p>

              {notification.data && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Informations supplémentaires</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(notification.data, null, 2)}
                  </pre>
                </div>
              )}

              {notification.action_url && (
                <div className="mt-6">
                  <a
                    href={notification.action_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>
                      Voir plus
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Notifications */}
        {notification.type && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Notifications similaires</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pas d'autres notifications de ce type pour le moment
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
