import { Helmet } from 'react-helmet-async';
import { Link, Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Key, Webhook, BookOpen, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DevelopersPortal() {
  // ✅ SÉCURITÉ: Vérification d'authentification
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/med-mng/login" replace />;
  }

  const sections = [
    { icon: BookOpen, title: 'Documentation', description: 'API complète et guides', link: ROUTE_PATHS.developersDocs, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { icon: Key, title: 'Clés API', description: 'Gérez vos clés d\'accès', link: ROUTE_PATHS.developersKeys, color: 'text-green-600', bgColor: 'bg-green-100' },
    { icon: Webhook, title: 'Webhooks', description: 'Événements en temps réel', link: ROUTE_PATHS.developersWebhooks, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  return (
    <>
      <Helmet><title>Portail Développeurs | Med-Mng</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white mb-4">
              <Code className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Portail Développeurs</h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">Intégrez Med-Mng dans vos applications avec notre API REST</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.title} to={section.link}>
                  <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 bg-white/10 backdrop-blur border-white/20 h-full">
                    <CardHeader className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${section.bgColor} ${section.color} mx-auto mb-4`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-white text-xl">{section.title}</CardTitle>
                      <CardDescription className="text-blue-200">{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">Explorer</Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Zap className="w-5 h-5 text-yellow-400" />Performance</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold text-yellow-400 mb-1">99.9%</div><div className="text-blue-200">Uptime garanti</div></CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Shield className="w-5 h-5 text-green-400" />Sécurité</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold text-green-400 mb-1">OAuth2</div><div className="text-blue-200">Authentification</div></CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Code className="w-5 h-5 text-purple-400" />Endpoints</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold text-purple-400 mb-1">50+</div><div className="text-blue-200">Routes disponibles</div></CardContent>
            </Card>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader><CardTitle className="text-white">Démarrage Rapide</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
                <div>curl -X GET https://api.med-mng.com/v1/user/profile \</div>
                <div className="ml-4">-H "Authorization: Bearer YOUR_API_KEY"</div>
              </div>
              <Link to={ROUTE_PATHS.developersDocs}><Button className="bg-blue-600 hover:bg-blue-700">Voir la Documentation</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
