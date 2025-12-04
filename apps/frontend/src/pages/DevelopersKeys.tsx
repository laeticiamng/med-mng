import { Helmet } from 'react-helmet-async';
import { Link, Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Key, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function DevelopersKeys() {
  // ✅ SÉCURITÉ: Vérification d'authentification
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/med-mng/login" replace />;
  }

  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});
  const keys = [
    { id: 1, name: 'Production API', key: 'sk_live_1234567890abcdef', created: '2024-01-15', lastUsed: '2 heures', requests: 15420 },
    { id: 2, name: 'Development', key: 'sk_test_abcdef1234567890', created: '2024-02-20', lastUsed: '5 min', requests: 8750 },
  ];

  return (
    <>
      <Helmet><title>Clés API | Développeurs</title></Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to={ROUTE_PATHS.developers}><Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button></Link>
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="text-4xl font-bold text-gray-900">Clés API</h1><p className="text-lg text-gray-600">Gérez vos clés d'accès à l'API</p></div>
            <Button><Plus className="w-4 h-4 mr-2" />Nouvelle Clé</Button>
          </div>

          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="text-yellow-900"><strong>⚠️ Sécurité:</strong> Ne partagez jamais vos clés API. Elles donnent un accès complet à votre compte.</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {keys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="w-6 h-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                        <div className="text-sm text-gray-500">Créée le {apiKey.created}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <code className="flex-1 px-4 py-2 bg-gray-100 rounded font-mono text-sm">
                      {showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••'}
                    </code>
                    <Button variant="outline" size="sm" onClick={() => setShowKeys({ ...showKeys, [apiKey.id]: !showKeys[apiKey.id] })}>
                      {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm"><Copy className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Dernière utilisation: {apiKey.lastUsed}</span>
                    <span>{apiKey.requests.toLocaleString()} requêtes</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm">Régénérer</Button>
                    <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Supprimer</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
