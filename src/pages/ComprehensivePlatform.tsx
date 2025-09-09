import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, BookOpen, Brain, Users, Music, BarChart3, Settings, 
  Heart, Shield, Zap, Target, Trophy, PlayCircle, CheckCircle,
  ArrowRight, Home, RefreshCw, Sparkles, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PlatformModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  progress: number;
  status: 'active' | 'beta' | 'new' | 'premium';
  features: string[];
  category: 'core' | 'medical' | 'analytics' | 'community' | 'tools';
}

const modules: PlatformModule[] = [
  {
    id: 'edn-system',
    name: 'Système EDN Complet',
    description: 'Tous les 367 items EDN avec contenus immersifs et IA',
    icon: BookOpen,
    path: '/edn',
    progress: 100,
    status: 'active',
    features: ['367 Items', 'Scènes Immersives', 'IA Musicale', 'Quiz Adaptatifs'],
    category: 'medical'
  },
  {
    id: 'music-generator',
    name: 'Générateur Musical IA',
    description: 'Créez des musiques pédagogiques personnalisées',
    icon: Music,
    path: '/generator',
    progress: 95,
    status: 'active',
    features: ['Suno IA', 'Paroles Médicales', 'Styles Multiples', 'Export HD'],
    category: 'tools'
  },
  {
    id: 'analytics-suite',
    name: 'Suite Analytics Avancée',
    description: 'Analyses détaillées et prédictions IA',
    icon: BarChart3,
    path: '/analytics',
    progress: 90,
    status: 'premium',
    features: ['Métriques Temps Réel', 'Prédictions IA', 'Rapports PDF', 'Insights'],
    category: 'analytics'
  },
  {
    id: 'ai-assistant',
    name: 'Assistant IA Médical',
    description: 'Chat intelligent spécialisé en médecine',
    icon: Brain,
    path: '/chat',
    progress: 85,
    status: 'beta',
    features: ['Chat Médical', 'Diagnostic Aide', 'Références', 'Multi-langue'],
    category: 'tools'
  },
  {
    id: 'community-hub',
    name: 'Hub Communautaire',
    description: 'Espace d\'échange et de collaboration',
    icon: Users,
    path: '/community',
    progress: 80,
    status: 'active',
    features: ['Forums', 'Partage', 'Mentorat', 'Événements'],
    category: 'community'
  },
  {
    id: 'dashboard-unified',
    name: 'Dashboard Unifié',
    description: 'Vue d\'ensemble complète de vos performances',
    icon: Activity,
    path: '/dashboard',
    progress: 100,
    status: 'active',
    features: ['Vue Globale', 'Métriques', 'Objectifs', 'Progression'],
    category: 'core'
  }
];

const ComprehensivePlatform: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [overallProgress, setOverallProgress] = useState(0);

  const categories = [
    { id: 'all', name: 'Tout', icon: Sparkles },
    { id: 'core', name: 'Core', icon: Target },
    { id: 'medical', name: 'Médical', icon: Heart },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'community', name: 'Communauté', icon: Users },
    { id: 'tools', name: 'Outils', icon: Settings }
  ];

  const filteredModules = selectedCategory === 'all' 
    ? modules 
    : modules.filter(module => module.category === selectedCategory);

  useEffect(() => {
    const avgProgress = modules.reduce((sum, module) => sum + module.progress, 0) / modules.length;
    setOverallProgress(avgProgress);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'beta': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'new': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'premium': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <>
      <Helmet>
        <title>Plateforme Complète MED-MNG - Tous les Modules</title>
        <meta name="description" content="Accédez à tous les modules MED-MNG : EDN, IA musicale, analytics, communauté et plus encore." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/platform')}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Vue Plateforme
              </Button>
            </div>

            <div>
              <Badge className="mb-4 bg-primary/10 text-primary">
                <Sparkles className="w-4 h-4 mr-2" />
                Plateforme Complète
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
                MED-MNG Ecosystem
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Découvrez tous les modules de notre écosystème d'apprentissage médical révolutionnaire
              </p>
            </div>

            {/* Global Progress */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">Progression Globale</h3>
                  <div className="text-3xl font-bold text-primary mb-2">{Math.round(overallProgress)}%</div>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {modules.length} modules • {modules.filter(m => m.progress === 100).length} complétés
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </Button>
            ))}
          </motion.div>

          {/* Modules Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="h-full"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer"
                      onClick={() => navigate(module.path)}>
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <module.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge className={cn("text-xs", getStatusColor(module.status))}>
                        {module.status}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {module.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        {module.description}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Complétude</span>
                        <span className="font-medium">{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Fonctionnalités</h4>
                      <div className="flex flex-wrap gap-1">
                        {module.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <Button 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      variant="outline"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Accéder au module
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: BookOpen, value: '367', label: 'Items EDN', color: 'text-blue-400' },
              { icon: Music, value: '24', label: 'Fonctionnalités', color: 'text-purple-400' },
              { icon: Users, value: '10K+', label: 'Utilisateurs', color: 'text-green-400' },
              { icon: TrendingUp, value: '95%', label: 'Satisfaction', color: 'text-orange-400' }
            ].map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <stat.icon className={cn("w-8 h-8 mx-auto mb-3", stat.color)} />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-12"
          >
            <h2 className="text-3xl font-bold mb-4">Prêt à Explorer ?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Commencez votre parcours d'apprentissage médical révolutionnaire avec tous nos outils
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/dashboard')} className="gap-2">
                <Activity className="w-5 h-5" />
                Accéder au Dashboard
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/edn')} className="gap-2">
                <BookOpen className="w-5 h-5" />
                Commencer par EDN
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ComprehensivePlatform;