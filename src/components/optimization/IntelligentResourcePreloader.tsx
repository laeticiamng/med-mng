import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Download, Clock, TrendingUp, Brain, Target, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PreloadRule {
  id: string;
  name: string;
  pattern: string;
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
  hitRate: number;
  lastUsed: Date;
}

interface PredictionMetric {
  resource: string;
  confidence: number;
  timesSaved: number;
  avgTimeSaved: number;
}

interface PreloadStats {
  totalPreloaded: number;
  hitRate: number;
  bandwidthSaved: number;
  timesSaved: number;
}

export const IntelligentResourcePreloader: React.FC = () => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(true);
  const [preloadRules, setPreloadRules] = useState<PreloadRule[]>([]);
  const [predictions, setPredictions] = useState<PredictionMetric[]>([]);
  const [stats, setStats] = useState<PreloadStats>({
    totalPreloaded: 0,
    hitRate: 0,
    bandwidthSaved: 0,
    timesSaved: 0
  });
  const [learningMode, setLearningMode] = useState(true);

  // Simuler l'apprentissage automatique des patterns utilisateur
  useEffect(() => {
    const mockRules: PreloadRule[] = [
      {
        id: '1',
        name: 'Navigation Dashboard',
        pattern: '/dashboard*',
        priority: 'high',
        enabled: true,
        hitRate: 92,
        lastUsed: new Date()
      },
      {
        id: '2',
        name: 'Images Produits',
        pattern: '/products/*/images',
        priority: 'medium',
        enabled: true,
        hitRate: 78,
        lastUsed: new Date()
      },
      {
        id: '3',
        name: 'Scripts Critiques',
        pattern: '/assets/critical-*.js',
        priority: 'high',
        enabled: true,
        hitRate: 95,
        lastUsed: new Date()
      },
      {
        id: '4',
        name: 'Données Utilisateur',
        pattern: '/api/user/profile',
        priority: 'medium',
        enabled: true,
        hitRate: 85,
        lastUsed: new Date()
      }
    ];

    const mockPredictions: PredictionMetric[] = [
      { resource: '/dashboard', confidence: 94, timesSaved: 156, avgTimeSaved: 240 },
      { resource: '/profile', confidence: 87, timesSaved: 89, avgTimeSaved: 180 },
      { resource: '/settings', confidence: 72, timesSaved: 45, avgTimeSaved: 320 },
      { resource: '/analytics', confidence: 68, timesSaved: 23, avgTimeSaved: 150 }
    ];

    const mockStats: PreloadStats = {
      totalPreloaded: 1247,
      hitRate: 83.5,
      bandwidthSaved: 2.1,
      timesSaved: 4.8
    };

    setPreloadRules(mockRules);
    setPredictions(mockPredictions);
    setStats(mockStats);
  }, []);

  // Préchargement intelligent basé sur les patterns
  const preloadResource = useCallback((url: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!isEnabled) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    if (priority === 'high') {
      link.rel = 'preload';
      link.as = 'fetch';
    }
    
    document.head.appendChild(link);
    
    // Nettoyer après utilisation
    setTimeout(() => {
      document.head.removeChild(link);
    }, 30000);
  }, [isEnabled]);

  // Prédiction basée sur le comportement utilisateur
  const predictNextResources = useCallback(() => {
    const currentPath = window.location.pathname;
    const matchingRules = preloadRules.filter(rule => 
      rule.enabled && new RegExp(rule.pattern.replace('*', '.*')).test(currentPath)
    );

    matchingRules.forEach(rule => {
      if (rule.hitRate > 70) {
        // Simuler le préchargement des ressources prédites
        console.log(`Preloading resources matching pattern: ${rule.pattern}`);
        
        if (rule.priority === 'high') {
          preloadResource(`/api/data${currentPath}`, 'high');
        }
      }
    });
  }, [preloadRules, preloadResource]);

  // Apprentissage automatique des patterns
  useEffect(() => {
    if (!learningMode) return;

    const handleNavigation = () => {
      predictNextResources();
      
      // Mettre à jour les statistiques d'usage
      const currentPath = window.location.pathname;
      setPreloadRules(prev => prev.map(rule => {
        if (new RegExp(rule.pattern.replace('*', '.*')).test(currentPath)) {
          return { ...rule, lastUsed: new Date() };
        }
        return rule;
      }));
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [learningMode, predictNextResources]);

  const toggleRule = (ruleId: string) => {
    setPreloadRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    
    toast({
      title: "Règle mise à jour",
      description: "La configuration de préchargement a été modifiée",
    });
  };

  const optimizeRules = () => {
    // Désactiver les règles peu performantes
    setPreloadRules(prev => prev.map(rule => ({
      ...rule,
      enabled: rule.hitRate > 60
    })));
    
    toast({
      title: "Optimisation terminée",
      description: "Les règles peu performantes ont été désactivées",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration principale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Préchargement Intelligent de Ressources
          </CardTitle>
          <CardDescription>
            Système d'apprentissage automatique pour prédire et précharger les ressources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
                <label className="text-sm font-medium">
                  Préchargement activé
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={learningMode}
                  onCheckedChange={setLearningMode}
                />
                <label className="text-sm font-medium">
                  Mode apprentissage
                </label>
              </div>
            </div>
            <Button onClick={optimizeRules} variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Optimiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="rules">Règles</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="analytics">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ressources Préchargées</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.totalPreloaded}</div>
                <p className="text-xs text-muted-foreground">+12% cette semaine</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.hitRate}%</div>
                <Progress value={stats.hitRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bande Passante Économisée</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{stats.bandwidthSaved} MB</div>
                <p className="text-xs text-muted-foreground">Par session moyenne</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temps Économisé</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.timesSaved}s</div>
                <p className="text-xs text-muted-foreground">Par page chargée</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="space-y-3">
            {preloadRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground">{rule.pattern}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(rule.priority) as any}>
                      {rule.priority}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">{rule.hitRate}%</div>
                      <div className="text-xs text-muted-foreground">Réussite</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="space-y-3">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{prediction.resource}</div>
                      <div className="text-sm text-muted-foreground">
                        Utilisé {prediction.timesSaved} fois • {prediction.avgTimeSaved}ms économisés en moyenne
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{prediction.confidence}%</div>
                      <div className="text-xs text-muted-foreground">Confiance</div>
                    </div>
                  </div>
                  <Progress value={prediction.confidence} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyse des Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-success" />
                    <span className="font-medium">Pattern le plus efficace</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scripts critiques (95% de réussite)
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className="font-medium">Amélioration possible</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Optimiser le timing des images produits
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <h4 className="font-medium text-sm">Nouveau Pattern Détecté</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Les utilisateurs visitent souvent /reports après /dashboard
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-secondary/20 bg-secondary/5">
                  <h4 className="font-medium text-sm">Optimisation Suggérée</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Précharger les données d'analyse le matin (9h-11h)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};