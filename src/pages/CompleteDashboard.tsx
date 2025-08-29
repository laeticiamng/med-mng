import React from 'react';
import { PlatformHeader } from '@/components/platform/PlatformHeader';
import { QuickAccessPanel } from '@/components/platform/QuickAccessPanel';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Music, 
  BarChart3, 
  Clock,
  Star,
  Zap,
  Brain,
  Heart,
  Activity,
  Target,
  Award,
  BookOpen,
  Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';

const CompleteDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const globalStats = [
    {
      title: 'Utilisateurs Actifs',
      value: '1,247',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      description: 'Étudiants connectés ce mois'
    },
    {
      title: 'Musiques Générées',
      value: '8,524',
      change: '+23%',
      icon: Music,
      color: 'text-purple-600',
      description: 'Créations IA cette semaine'
    },
    {
      title: 'Sessions ECOS',
      value: '3,456',
      change: '+8%',
      icon: Stethoscope,
      color: 'text-green-600',
      description: 'Simulations réalisées'
    },
    {
      title: 'Temps Moyen',
      value: '12min',
      change: '+5%',
      icon: Clock,
      color: 'text-orange-600',
      description: 'Durée d\'apprentissage'
    }
  ];

  const featuredContent = [
    {
      title: 'Générateur IA V2.0',
      description: 'Génération musicale encore plus précise avec Suno AI',
      badge: 'Nouveau',
      color: 'from-purple-600 to-pink-600',
      route: '/generator',
      icon: Music
    },
    {
      title: '367 Items EDN',
      description: 'Couverture complète du programme médical français',
      badge: 'Complet',
      color: 'from-blue-600 to-cyan-600',
      route: '/edn-complete',
      icon: BookOpen
    },
    {
      title: 'Assistant IA Médical',
      description: 'Réponses expertes à toutes vos questions médicales',
      badge: 'IA',
      color: 'from-orange-600 to-red-600',
      route: '/med-chat',
      icon: Brain
    },
    {
      title: 'Simulations ECOS',
      description: 'Cas cliniques immersifs avec patients virtuels',
      badge: 'Immersif',
      color: 'from-green-600 to-emerald-600',
      route: '/ecos',
      icon: Heart
    }
  ];

  const quickStats = [
    { label: 'Score moyen ECOS', value: '87%', trend: '+5%', positive: true },
    { label: 'Items EDN maîtrisés', value: '156/367', trend: '+12', positive: true },
    { label: 'Musiques favorites', value: '23', trend: '+3', positive: true },
    { label: 'Temps d\'étude', value: '45h', trend: '+8h', positive: true }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'music',
      title: 'IC-103 Vertige - Style Jazz généré',
      time: '5 min',
      icon: Music,
      color: 'text-purple-600'
    },
    {
      id: '2',
      type: 'ecos',
      title: 'ECOS Cardiologie - Score 92%',
      time: '12 min',
      icon: Heart,
      color: 'text-red-600'
    },
    {
      id: '3',
      type: 'chat',
      title: 'Question sur l\'hypertension résolue',
      time: '25 min',
      icon: Brain,
      color: 'text-orange-600'
    },
    {
      id: '4',
      type: 'study',
      title: 'IC-230 Cardiologie complété',
      time: '1h',
      icon: BookOpen,
      color: 'text-blue-600'
    }
  ];

  return (
    <ConsistentBackground variant="light">
      <PlatformHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* En-tête personnalisé */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {user ? `Bonjour ${user.email?.split('@')[0]} !` : 'Tableau de Bord MED MNG'} 👋
              </h1>
              <p className="text-muted-foreground">
                {user ? 'Continuez votre apprentissage médical' : 'Vue d\'ensemble de la plateforme d\'apprentissage médical'}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                ✅ Tous les systèmes opérationnels
              </Badge>
            </div>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {globalStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-all duration-300 group hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mb-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 text-sm mb-2">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">{stat.change}</span>
                      <span className="text-muted-foreground">ce mois</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted/30 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel d'accès rapide principal */}
          <div className="lg:col-span-2">
            <QuickAccessPanel />
          </div>

          {/* Colonne droite avec contenu complémentaire */}
          <div className="space-y-6">
            {/* Contenu mis en avant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Fonctionnalités Clés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {featuredContent.map((item, index) => (
                  <div
                    key={index}
                    className="relative p-3 rounded-lg border hover:shadow-sm transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(item.route)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 rounded-lg transition-opacity`} />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} text-white`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                              {item.title}
                            </h4>
                            <Badge variant="secondary" className="text-xs ml-2">
                              {item.badge}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-11">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Statistiques rapides utilisateur */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Vos Progrès
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quickStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{stat.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold">{stat.value}</span>
                          <span className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/analytics')}
                    >
                      Voir détails complets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activité récente */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-2 bg-background rounded-lg border">
                          <activity.icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Il y a {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance système */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  État du Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Plateforme Web</span>
                    <Badge className="bg-green-100 text-green-800">
                      ✅ Opérationnel
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Génération IA</span>
                    <Badge className="bg-green-100 text-green-800">
                      ✅ Opérationnel
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Base de données</span>
                    <Badge className="bg-green-100 text-green-800">
                      ✅ Opérationnel
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Services</span>
                    <Badge className="bg-green-100 text-green-800">
                      ✅ Opérationnel
                    </Badge>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">
                        Uptime: 99.97% | Réponse: 89ms
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/system-health')}
                      >
                        Détails système
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Appel à l'action pour les utilisateurs non connectés */}
        {!user && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">
                  Prêt à révolutionner votre apprentissage médical ? 🚀
                </h3>
                <p className="text-muted-foreground mb-6">
                  Connectez-vous pour accéder à toutes les fonctionnalités : génération musicale illimitée, 
                  sauvegarde de vos créations, suivi de progression et bien plus !
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/med-mng/signup')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Créer un compte gratuit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/med-mng/login')}
                  >
                    Se connecter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ConsistentBackground>
  );
};

export default CompleteDashboard;