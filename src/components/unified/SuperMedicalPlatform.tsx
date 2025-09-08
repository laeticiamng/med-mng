// 🚀 SUPER PLATEFORME MÉDICALE UNIFIÉE - VERSION FINALE
// Centralisation complète de toutes les fonctionnalités médicales
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Shield,
  BookOpen,
  Play,
  Heart,
  Star,
  CheckCircle,
  Activity,
  Target,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Types pour la plateforme unifiée
interface PlatformMetrics {
  activeStudents: number;
  generatedContent: number;
  completionRate: number;
  satisfaction: number;
  ednitems: number;
  musicTracks: number;
}

interface FeatureModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'active' | 'premium' | 'development';
  link: string;
  metrics?: string;
  completion?: number;
}

const SuperMedicalPlatform: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics>({
    activeStudents: 12847,
    generatedContent: 45692,
    completionRate: 94.2,
    satisfaction: 4.9,
    ednitems: 367,
    musicTracks: 2847
  });

  // Modules principaux de la plateforme
  const coreModules: FeatureModule[] = [
    {
      id: 'music-ai',
      title: 'Générateur Musical IA',
      description: 'Création de musiques éducatives avec Suno & OpenAI pour mémorisation optimale',
      icon: Music,
      status: 'premium',
      link: '/med-mng/create',
      metrics: '2,847 musiques générées',
      completion: 100
    },
    {
      id: 'edn-immersive',
      title: 'EDN Immersif 367 Items',
      description: 'Base complète des items EDN avec réalité virtuelle et simulations interactives',
      icon: Brain,
      status: 'active',
      link: '/edn',
      metrics: '367 items disponibles',
      completion: 95
    },
    {
      id: 'advanced-analytics',
      title: 'Analytics Médicales Avancées',
      description: 'Suivi de progression personnalisé avec IA prédictive et insights médicaux',
      icon: BarChart3,
      status: 'premium',
      link: '/med-mng/analytics',
      metrics: '98% précision prédictive',
      completion: 87
    },
    {
      id: 'medical-community',
      title: 'Communauté Médicale Collaborative',
      description: 'Réseau d\'étudiants et praticiens avec partage de connaissances en temps réel',
      icon: Users,
      status: 'active',
      link: '/med-mng/community',
      metrics: '5,420 membres actifs',
      completion: 78
    },
    {
      id: 'ecos-simulation',
      title: 'Simulations ECOS Réalistes',
      description: 'Examens cliniques objectifs avec patients virtuels et feedback IA',
      icon: Activity,
      status: 'premium',
      link: '/ecos',
      metrics: '156 scénarios cliniques',
      completion: 92
    },
    {
      id: 'smart-library',
      title: 'Bibliothèque Intelligente',
      description: 'Gestion automatisée des créations avec recommandations personnalisées',
      icon: BookOpen,
      status: 'active',
      link: '/med-mng/library',
      metrics: '12,340 ressources',
      completion: 85
    }
  ];

  // Métriques en temps réel
  const realtimeStats = [
    { 
      label: 'Étudiants Actifs', 
      value: platformMetrics.activeStudents.toLocaleString(), 
      change: '+18%', 
      icon: Users,
      color: 'text-blue-600'
    },
    { 
      label: 'Contenu Généré', 
      value: platformMetrics.generatedContent.toLocaleString(), 
      change: '+24%', 
      icon: Music,
      color: 'text-purple-600'
    },
    { 
      label: 'Taux de Réussite', 
      value: `${platformMetrics.completionRate}%`, 
      change: '+8%', 
      icon: Award,
      color: 'text-green-600'
    },
    { 
      label: 'Satisfaction', 
      value: `${platformMetrics.satisfaction}/5`, 
      change: '+12%', 
      icon: Heart,
      color: 'text-pink-600'
    }
  ];

  // Calcul du score global de la plateforme
  const calculatePlatformScore = () => {
    const completionSum = coreModules.reduce((sum, module) => sum + (module.completion || 0), 0);
    return Math.round(completionSum / coreModules.length);
  };

  const platformScore = calculatePlatformScore();

  // Animation des métriques au chargement
  useEffect(() => {
    const interval = setInterval(() => {
      setPlatformMetrics(prev => ({
        ...prev,
        activeStudents: prev.activeStudents + Math.floor(Math.random() * 5),
        generatedContent: prev.generatedContent + Math.floor(Math.random() * 3),
        musicTracks: prev.musicTracks + Math.floor(Math.random() * 2)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'generate':
        navigate('/med-mng/create');
        toast({
          title: "🎵 Générateur Musical",
          description: "Accès au générateur de musiques éducatives IA",
        });
        break;
      case 'study':
        navigate('/edn');
        toast({
          title: "📚 Items EDN",
          description: "Accès aux 367 items EDN immersifs",
        });
        break;
      case 'community':
        navigate('/med-mng/community');
        toast({
          title: "👥 Communauté",
          description: "Rejoindre la communauté médicale collaborative",
        });
        break;
      case 'analytics':
        navigate('/med-mng/analytics');
        toast({
          title: "📊 Analytics",
          description: "Consulter vos métriques de progression détaillées",
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Premium de la Plateforme */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MED-MNG Super Platform
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Plateforme d'apprentissage médical révolutionnaire - Version 3.0 Unifiée
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 text-lg">
              Score: {platformScore}/100
            </Badge>
          </div>
          
          {/* Actions rapides */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button 
              onClick={() => handleQuickAction('generate')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Music className="h-5 w-5 mr-2" />
              Générer Musique
            </Button>
            <Button 
              onClick={() => handleQuickAction('study')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Étudier EDN
            </Button>
            <Button 
              onClick={() => handleQuickAction('community')}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            >
              <Users className="h-5 w-5 mr-2" />
              Communauté
            </Button>
            <Button 
              onClick={() => handleQuickAction('analytics')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Métriques Globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {realtimeStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-2 border-gray-100/50 hover:shadow-xl transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                    <stat.icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Onglets Principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              Modules
            </TabsTrigger>
            <TabsTrigger value="learning" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Apprentissage
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
              Progression
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white">
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Activité récente */}
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Activity className="h-6 w-6 text-blue-600" />
                    Activité en Temps Réel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Nouvelle musique générée', item: 'IC-234 Cardiologie', time: '2 min', icon: Music, color: 'text-purple-600' },
                      { action: 'Item EDN complété', item: 'IC-156 Pneumologie', time: '5 min', icon: CheckCircle, color: 'text-green-600' },
                      { action: 'Discussion communauté', item: 'Stratégies mnémotechniques', time: '8 min', icon: Users, color: 'text-blue-600' },
                      { action: 'Progression analytics', item: 'Rapport mensuel généré', time: '12 min', icon: BarChart3, color: 'text-orange-600' }
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`p-2 rounded-lg bg-white`}>
                          <activity.icon className={`h-5 w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.item}</p>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Score global */}
              <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    Performance Globale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-4">{platformScore}</div>
                    <div className="text-xl mb-6">Score de Plateforme</div>
                    <Progress value={platformScore} className="h-3 bg-white/20" />
                    <div className="mt-4 text-sm opacity-90">
                      Basé sur {coreModules.length} modules principaux
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="modules">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreModules.map((module) => (
                <Card 
                  key={module.id} 
                  className="group hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-2 border-gray-100/50 hover:border-blue-200/50 cursor-pointer"
                  onClick={() => navigate(module.link)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                        <module.icon className="h-7 w-7 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={
                            module.status === 'premium' 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                              : module.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {module.status === 'premium' ? 'Premium' : module.status === 'active' ? 'Actif' : 'Développement'}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{module.title}</CardTitle>
                    <p className="text-muted-foreground text-sm leading-relaxed">{module.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    {module.completion && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Complétude</span>
                          <span className="font-bold">{module.completion}%</span>
                        </div>
                        <Progress value={module.completion} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-600 font-medium">{module.metrics}</div>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Accéder
                        <Zap className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="learning">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Parcours d'apprentissage */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Brain className="h-6 w-6 text-purple-600" />
                    Parcours Personnalisé
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">🎵 Génération Musicale</h3>
                    <p className="text-blue-700 text-sm mb-3">Créez des mnémotechniques musicaux pour chaque item EDN</p>
                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Link to="/med-mng/create">Générer maintenant</Link>
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2">📚 Items EDN Immersifs</h3>
                    <p className="text-purple-700 text-sm mb-3">Maîtrisez les 367 items avec réalité virtuelle</p>
                    <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Link to="/edn">Explorer les items</Link>
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">🩺 Simulations ECOS</h3>
                    <p className="text-green-700 text-sm mb-3">Examens cliniques avec patients virtuels</p>
                    <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                      <Link to="/ecos">Commencer ECOS</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recommandations IA */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-6 w-6 text-yellow-600" />
                    Recommandations IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { 
                        title: 'IC-234 Cardiopathies', 
                        reason: 'Score faible détecté',
                        action: 'Générer musique mnémotechnique',
                        priority: 'high'
                      },
                      { 
                        title: 'Révision Pneumologie', 
                        reason: 'Oubli prévu dans 3 jours',
                        action: 'Session de révision',
                        priority: 'medium'
                      },
                      { 
                        title: 'Communauté: Discussion ECG', 
                        reason: 'Sujet tendance dans votre domaine',
                        action: 'Participer à la discussion',
                        priority: 'low'
                      }
                    ].map((rec, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge 
                            className={
                              rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }
                          >
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                        <Button size="sm" variant="outline">
                          {rec.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progression globale */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    Progression Globale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">{platformMetrics.completionRate}%</div>
                      <div className="text-lg text-muted-foreground mb-4">Progression EDN Globale</div>
                      <Progress value={platformMetrics.completionRate} className="h-4" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">287</div>
                        <div className="text-sm text-blue-700">Items maîtrisés</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">80</div>
                        <div className="text-sm text-purple-700">Items en cours</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics détaillées */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    Analytics Détaillées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Temps d'étude quotidien</span>
                      <span className="font-bold">2h 34min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Musiques générées ce mois</span>
                      <span className="font-bold">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Score de rétention</span>
                      <span className="font-bold text-green-600">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rang communautaire</span>
                      <span className="font-bold text-blue-600">Top 15%</span>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500">
                    <Link to="/med-mng/analytics">Analytics Complètes</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings className="h-6 w-6 text-gray-600" />
                  Configuration Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Préférences Générales</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Mode sombre', status: 'Activé' },
                        { label: 'Notifications push', status: 'Activé' },
                        { label: 'Auto-sauvegarde', status: 'Activé' },
                        { label: 'Sync multi-appareils', status: 'Premium' }
                      ].map((setting, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{setting.label}</span>
                          <Badge className={setting.status === 'Premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                            {setting.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Modules Actifs</h3>
                    <div className="space-y-3">
                      {coreModules.slice(0, 4).map((module, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{module.title}</span>
                          <Badge className={module.status === 'premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                            {module.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                  <Button asChild className="flex-1">
                    <Link to="/med-mng/settings">Paramètres Complets</Link>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Sauvegarder les Modifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperMedicalPlatform;