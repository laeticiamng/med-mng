import { Helmet } from 'react-helmet-async';
import { Link, Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Code, Zap, Users, Calendar, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DevelopersDocs() {
  // ✅ SÉCURITÉ: Vérification d'authentification
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/med-mng-login" replace />;
  }

  const endpoints = [
    { category: 'Authentification', count: 5, icon: Users, methods: ['POST /auth/login', 'POST /auth/register', 'POST /auth/refresh', 'POST /auth/logout', 'GET /auth/me'] },
    { category: 'Utilisateurs', count: 8, icon: Users, methods: ['GET /users', 'GET /users/:id', 'PATCH /users/:id', 'GET /users/:id/profile', 'GET /users/:id/achievements'] },
    { category: 'Challenges', count: 7, icon: Trophy, methods: ['GET /challenges', 'GET /challenges/:id', 'POST /challenges/:id/participate', 'GET /challenges/daily'] },
    { category: 'Calendrier', count: 6, icon: Calendar, methods: ['GET /events', 'POST /events', 'GET /events/:id', 'PATCH /events/:id', 'DELETE /events/:id'] },
  ];

  return (
    <>
      <Helmet><title>Documentation API | Développeurs</title></Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Link to={ROUTE_PATHS.developers}><Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Retour au Portail</Button></Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Documentation API</h1>
          <p className="text-lg text-gray-600 mb-8">Référence complète de l'API REST Med-Mng v1.0</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card><CardHeader><div className="flex items-center gap-3"><BookOpen className="w-8 h-8 text-blue-600" /><div><CardTitle>REST API</CardTitle><CardDescription>JSON sur HTTPS</CardDescription></div></div></CardHeader></Card>
            <Card><CardHeader><div className="flex items-center gap-3"><Zap className="w-8 h-8 text-yellow-600" /><div><CardTitle>Rate Limit</CardTitle><CardDescription>1000 req/heure</CardDescription></div></div></CardHeader></Card>
            <Card><CardHeader><div className="flex items-center gap-3"><Code className="w-8 h-8 text-green-600" /><div><CardTitle>Version</CardTitle><CardDescription>v1.0 stable</CardDescription></div></div></CardHeader></Card>
          </div>

          {endpoints.map((endpoint, index) => {
            const Icon = endpoint.icon;
            return (
              <Card key={index} className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-blue-600" />
                      <CardTitle>{endpoint.category}</CardTitle>
                    </div>
                    <Badge>{endpoint.count} endpoints</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {endpoint.methods.map((method, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded font-mono text-sm">
                        <Badge variant={method.startsWith('GET') ? 'default' : method.startsWith('POST') ? 'secondary' : 'outline'}>
                          {method.split(' ')[0]}
                        </Badge>
                        <code className="text-gray-700">{method.split(' ')[1]}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader><CardTitle>Besoin d'aide ?</CardTitle></CardHeader>
            <CardContent className="flex gap-3">
              <Link to={ROUTE_PATHS.helpContact}><Button>Contacter le Support</Button></Link>
              <Button variant="outline">Voir les exemples</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
