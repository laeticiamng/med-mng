import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, AlertCircle, Clock, Target, TrendingUp, Activity,
  BookOpen, Music, Users, BarChart3, Brain, Heart, Trophy, Star,
  ArrowRight, RefreshCw, Zap, Shield, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleStatus {
  id: string;
  name: string;
  category: string;
  completion: number;
  status: 'completed' | 'in-progress' | 'pending' | 'error';
  lastUpdated: string;
  issues: number;
  features: number;
  icon: React.ComponentType<any>;
}

interface CompletionStats {
  overall: number;
  categories: {
    [key: string]: {
      name: string;
      completion: number;
      modules: number;
      icon: React.ComponentType<any>;
    };
  };
  recent: ModuleStatus[];
  issues: {
    critical: number;
    warnings: number;
    info: number;
  };
}

const mockData: CompletionStats = {
  overall: 89,
  categories: {
    medical: { name: 'Médical', completion: 95, modules: 8, icon: Heart },
    core: { name: 'Core', completion: 100, modules: 6, icon: Target },
    ai: { name: 'IA & ML', completion: 85, modules: 4, icon: Brain },
    community: { name: 'Communauté', completion: 80, modules: 3, icon: Users },
    analytics: { name: 'Analytics', completion: 92, modules: 5, icon: BarChart3 },
    premium: { name: 'Premium', completion: 75, modules: 4, icon: Star }
  },
  recent: [
    {
      id: 'edn-system',
      name: 'Système EDN',
      category: 'medical',
      completion: 100,
      status: 'completed',
      lastUpdated: '2024-01-15',
      issues: 0,
      features: 24,
      icon: BookOpen
    },
    {
      id: 'music-generator',
      name: 'Générateur Musical',
      category: 'ai',
      completion: 95,
      status: 'in-progress',
      lastUpdated: '2024-01-14',
      issues: 1,
      features: 18,
      icon: Music
    },
    {
      id: 'analytics-suite',
      name: 'Suite Analytics',
      category: 'analytics',
      completion: 88,
      status: 'in-progress',
      lastUpdated: '2024-01-13',
      issues: 2,
      features: 15,
      icon: BarChart3
    }
  ],
  issues: {
    critical: 0,
    warnings: 3,
    info: 7
  }
};

export const CompletionDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(mockData.overall);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'in-progress': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Activity;
      case 'pending': return Clock;
      case 'error': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard de Complétude
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Suivi en temps réel de l'état de tous les modules et fonctionnalités de la plateforme
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeLinecap="round"
                  className="text-primary"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: animatedProgress / 100 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  style={{
                    strokeDasharray: "339.292",
                    strokeDashoffset: 339.292 * (1 - animatedProgress / 100)
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{animatedProgress}%</div>
                  <div className="text-sm text-muted-foreground">Complété</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Progression Globale</h3>
              <p className="text-sm text-muted-foreground">
                30 modules • 26 complétés • 4 en cours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="issues">Problèmes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                <div className="text-2xl font-bold mb-1">26</div>
                <div className="text-sm text-muted-foreground">Modules Complétés</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <div className="text-2xl font-bold mb-1">4</div>
                <div className="text-sm text-muted-foreground">En Développement</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-400" />
                <div className="text-2xl font-bold mb-1">+12%</div>
                <div className="text-sm text-muted-foreground">Cette Semaine</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recent.map((module) => {
                  const StatusIcon = getStatusIcon(module.status);
                  return (
                    <div key={module.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <module.icon className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {module.features} fonctionnalités • Mis à jour le {module.lastUpdated}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(module.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {module.completion}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(mockData.categories).map(([key, category]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <category.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progression</span>
                        <span className="font-medium">{category.completion}%</span>
                      </div>
                      <Progress value={category.completion} className="h-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {category.modules}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Modules inclus
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <div className="space-y-4">
            {mockData.recent.concat([
              // Add more mock modules for demonstration
              {
                id: 'community-hub',
                name: 'Hub Communautaire',
                category: 'community',
                completion: 80,
                status: 'in-progress' as const,
                lastUpdated: '2024-01-12',
                issues: 1,
                features: 12,
                icon: Users
              },
              {
                id: 'security-system',
                name: 'Système de Sécurité',
                category: 'core',
                completion: 100,
                status: 'completed' as const,
                lastUpdated: '2024-01-10',
                issues: 0,
                features: 8,
                icon: Shield
              }
            ]).map((module) => {
              const StatusIcon = getStatusIcon(module.status);
              return (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <module.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{module.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.category} • {module.features} fonctionnalités
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">{module.completion}%</div>
                          <Progress value={module.completion} className="w-24 h-2" />
                        </div>
                        
                        <Badge className={getStatusColor(module.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {module.status}
                        </Badge>
                        
                        {module.issues > 0 && (
                          <Badge variant="destructive" className="bg-red-500/10 text-red-400">
                            {module.issues} problème{module.issues > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-400" />
                <div className="text-2xl font-bold mb-1 text-red-400">{mockData.issues.critical}</div>
                <div className="text-sm text-muted-foreground">Critique</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                <div className="text-2xl font-bold mb-1 text-yellow-400">{mockData.issues.warnings}</div>
                <div className="text-sm text-muted-foreground">Avertissements</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <div className="text-2xl font-bold mb-1 text-blue-400">{mockData.issues.info}</div>
                <div className="text-sm text-muted-foreground">Informations</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Problèmes Récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: 'warning', message: 'Performance lente sur le générateur musical', module: 'IA' },
                  { type: 'info', message: 'Mise à jour de sécurité disponible', module: 'Core' },
                  { type: 'warning', message: 'Cache non optimisé pour les analytics', module: 'Analytics' }
                ].map((issue, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <AlertCircle className={cn(
                      "w-5 h-5",
                      issue.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    )} />
                    <div className="flex-1">
                      <p className="font-medium">{issue.message}</p>
                      <p className="text-sm text-muted-foreground">Module: {issue.module}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Résoudre
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button className="gap-2" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          Paramètres
        </Button>
      </div>
    </div>
  );
};

export default CompletionDashboard;