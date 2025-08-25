import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Wand2, 
  MessageCircle, 
  SearchCheck, 
  Shield, 
  Music,
  User,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

export const PlatformShowcase = () => {
  const features = [
    {
      id: 'home',
      title: 'Dashboard Avancé',
      description: 'Tableau de bord complet avec statistiques, activités récentes, et accès rapide',
      icon: Home,
      route: '/home',
      status: 'completed',
      color: 'text-blue-600'
    },
    {
      id: 'generator',
      title: 'Générateur IA Multimédia',
      description: 'Création de contenu médical (texte, musique, images, vidéos) avec intelligence artificielle',
      icon: Wand2,
      route: '/generator',
      status: 'completed',
      color: 'text-purple-600'
    },
    {
      id: 'chat',
      title: 'Assistant IA Médical',
      description: 'Chat intelligent pour répondre aux questions médicales avec sources fiables',
      icon: MessageCircle,
      route: '/chat',
      status: 'completed',
      color: 'text-green-600'
    },
    {
      id: 'audit',
      title: 'Centre d\'Audit & Qualité',
      description: 'Surveillance et contrôle qualité des données médicales avec rapports détaillés',
      icon: SearchCheck,
      route: '/audit',
      status: 'completed',
      color: 'text-amber-600'
    },
    {
      id: 'admin',
      title: 'Panneau d\'Administration',
      description: 'Gestion complète des utilisateurs, contenu, système et paramètres',
      icon: Shield,
      route: '/admin-panel',
      status: 'completed',
      color: 'text-red-600'
    },
    {
      id: 'library',
      title: 'Bibliothèque Musicale',
      description: 'Gestion avancée des créations musicales avec lecteur intégré',
      icon: Music,
      route: '/music-library',
      status: 'completed',
      color: 'text-amber-600'
    },
    {
      id: 'profile',
      title: 'Profil Utilisateur',
      description: 'Gestion du profil, suivi des progrès, succès et paramètres personnels',
      icon: User,
      route: '/profile',
      status: 'completed',
      color: 'text-indigo-600'
    }
  ];

  const platformStats = {
    totalFeatures: 7,
    completedFeatures: 7,
    totalPages: 15,
    totalComponents: 50,
    completionRate: 100
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MED-MNG Platform
            </h1>
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Plateforme médicale complète avec intelligence artificielle
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="default" className="text-lg px-4 py-2 bg-green-600">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              100% Complète
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              {platformStats.totalFeatures} Fonctionnalités
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Target className="h-4 w-4 mr-2" />
              {platformStats.totalPages} Pages
            </Badge>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{platformStats.totalFeatures}</div>
              <div className="text-sm text-muted-foreground">Fonctionnalités</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{platformStats.totalPages}</div>
              <div className="text-sm text-muted-foreground">Pages</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{platformStats.totalComponents}+</div>
              <div className="text-sm text-muted-foreground">Composants</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-amber-600 mb-2">{platformStats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Complétude</div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <Card 
              key={feature.id} 
              className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white to-gray-50"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Terminé
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => window.location.href = feature.route}
                >
                  Découvrir
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technical Stack */}
        <Card className="bg-gradient-to-br from-gray-900 to-blue-900 text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-400" />
              Stack Technique
            </CardTitle>
            <CardDescription className="text-gray-300">
              Technologies modernes et performantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-blue-400">Frontend</h4>
                <ul className="space-y-2 text-sm">
                  <li>• React 18 + TypeScript</li>
                  <li>• Tailwind CSS + shadcn/ui</li>
                  <li>• React Router + Lazy Loading</li>
                  <li>• Framer Motion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-green-400">Backend</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Supabase (Auth + DB)</li>
                  <li>• Edge Functions</li>
                  <li>• Real-time subscriptions</li>
                  <li>• Row Level Security</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-purple-400">Fonctionnalités</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Intelligence Artificielle</li>
                  <li>• Génération multimédia</li>
                  <li>• Audit automatisé</li>
                  <li>• Interface responsive</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};