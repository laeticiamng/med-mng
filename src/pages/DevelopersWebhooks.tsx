import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Webhook, Plus, CheckCircle2, XCircle } from 'lucide-react';

export default function DevelopersWebhooks() {
  const webhooks = [
    { id: 1, url: 'https://api.myapp.com/webhooks/medmng', events: ['user.created', 'challenge.completed'], status: 'active', lastDelivery: '5 min', success: 1247, failed: 3 },
    { id: 2, url: 'https://hooks.example.com/medmng', events: ['achievement.unlocked'], status: 'inactive', lastDelivery: '2 jours', success: 856, failed: 12 },
  ];

  const availableEvents = [
    { category: 'Utilisateurs', events: ['user.created', 'user.updated', 'user.deleted'] },
    { category: 'Challenges', events: ['challenge.completed', 'challenge.started', 'challenge.failed'] },
    { category: 'Achievements', events: ['achievement.unlocked', 'badge.earned'] },
    { category: 'Sessions', events: ['session.started', 'session.completed'] },
  ];

  return (
    <>
      <Helmet><title>Webhooks | Développeurs</title></Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Link to={ROUTE_PATHS.developers}><Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button></Link>
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="text-4xl font-bold text-gray-900">Webhooks</h1><p className="text-lg text-gray-600">Recevez des événements en temps réel</p></div>
            <Button><Plus className="w-4 h-4 mr-2" />Nouveau Webhook</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Webhook className="w-6 h-6 text-purple-600" />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{webhook.url}</CardTitle>
                          <div className="text-sm text-gray-500">Dernière livraison: {webhook.lastDelivery}</div>
                        </div>
                      </div>
                      <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>{webhook.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Événements souscrits:</div>
                      <div className="flex flex-wrap gap-2">
                        {webhook.events.map((event) => <Badge key={event} variant="outline">{event}</Badge>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" />{webhook.success} réussis</div>
                      <div className="flex items-center gap-2 text-red-600"><XCircle className="w-4 h-4" />{webhook.failed} échoués</div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm">Tester</Button>
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="destructive" size="sm">Supprimer</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card>
                <CardHeader><CardTitle>Événements Disponibles</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {availableEvents.map((cat) => (
                    <div key={cat.category}>
                      <div className="font-semibold text-gray-900 mb-2">{cat.category}</div>
                      {cat.events.map((event) => <div key={event} className="text-sm text-gray-600 ml-2">• {event}</div>)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
