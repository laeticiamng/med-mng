// 🚀 PLATEFORME MÉDICALE UNIFIÉE ULTRA-OPTIMISÉE
import React from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Stethoscope,
  Music,
  Brain,
  BarChart3,
  Users,
  Settings,
  Zap,
  Award,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    id: 'music-learning',
    title: 'Apprentissage Musical IA',
    description: 'Générez de la musique éducative avec Suno & OpenAI',
    icon: Music,
    status: 'premium',
    link: '/med-mng/create',
    metrics: '1,247 musiques générées'
  },
  {
    id: 'edn-system',
    title: 'Système EDN Immersif',
    description: 'Items EDN avec réalité virtuelle et interactions',
    icon: Brain,
    status: 'active',
    link: '/edn',
    metrics: '367 items disponibles'
  },
  {
    id: 'analytics',
    title: 'Analytics Avancées',
    description: 'Suivi de progression et insights personnalisés',
    icon: BarChart3,
    status: 'premium',
    link: '/analytics',
    metrics: '98% précision'
  },
  {
    id: 'community',
    title: 'Communauté Médicale',
    description: 'Réseau collaboratif d\'étudiants et praticiens',
    icon: Users,
    status: 'active',
    link: '/med-mng/community',
    metrics: '5,420 membres actifs'
  }
];

const stats = [
  { label: 'Étudiants actifs', value: '12,847', change: '+18%', icon: Users },
  { label: 'Contenu généré', value: '45,692', change: '+24%', icon: Music },
  { label: 'Taux de réussite', value: '94.2%', change: '+8%', icon: Award },
  { label: 'Satisfaction', value: '4.9/5', change: '+12%', icon: TrendingUp }
];

export const UnifiedPlatform: React.FC = () => {
  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MED-MNG Platform
            </h1>
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1">
              Version 3.0 Unifiée
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Plateforme d'apprentissage médical révolutionnaire combinant IA, musique thérapeutique et réalité immersive
          </p>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100/50 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
            <TabsTrigger value="learning">Apprentissage</TabsTrigger>
            <TabsTrigger value="progress">Progression</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <Card key={feature.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-100/50 hover:border-blue-200/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg group-hover:scale-110 transition-transform">
                          <feature.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                      <Badge 
                        className={feature.status === 'premium' 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                          : 'bg-green-100 text-green-700'
                        }
                      >
                        {feature.status === 'premium' ? 'Premium' : 'Actif'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-600 font-medium">{feature.metrics}</div>
                      <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Link to={feature.link}>
                          Accéder
                          <Zap className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="learning">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Parcours d'Apprentissage Personnalisé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900">EDN - Items Essentiels</h3>
                    <p className="text-blue-700 text-sm">Maîtrisez les 367 items avec musique et immersion</p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link to="/edn">Commencer</Link>
                    </Button>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900">Génération Musicale IA</h3>
                    <p className="text-purple-700 text-sm">Créez des mnémotechniques musicaux personnalisés</p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link to="/med-mng/create">Générer</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Suivi de Progression Avancé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">87%</div>
                    <div className="text-sm text-muted-foreground">Progression globale EDN</div>
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-green-500 to-blue-500">
                    <Link to="/med-mng/analytics">Voir Analytics Détaillées</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Configuration Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Mode sombre</span>
                    <Button variant="outline" size="sm">Basculer</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Notifications</span>
                    <Badge className="bg-green-100 text-green-700">Activées</Badge>
                  </div>
                  <Button asChild className="w-full">
                    <Link to="/med-mng/settings">Paramètres Complets</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PremiumLayout>
  );
};

export default UnifiedPlatform;