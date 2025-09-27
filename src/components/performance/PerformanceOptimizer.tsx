import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  TrendingUp, 
  Monitor, 
  Gauge,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Target,
  Activity,
  Smartphone,
  Wifi
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  status: 'good' | 'needs-improvement' | 'poor';
  description: string;
  category: 'core-vitals' | 'lighthouse' | 'network' | 'memory';
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: 'images' | 'javascript' | 'css' | 'network' | 'caching';
  description: string;
  implementation: string;
  estimatedGain: string;
  implemented: boolean;
}

export const PerformanceOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [lighthouseScore, setLighthouseScore] = useState(0);

  const runPerformanceAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // Mesures Web Vitals réelles
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      // Calcul des métriques
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const lcp = await measureLCP();
      const cls = await measureCLS();
      const fid = await measureFID();
      
      const newMetrics: PerformanceMetric[] = [
        {
          name: 'First Contentful Paint (FCP)',
          value: Math.round(fcp),
          threshold: 1800,
          unit: 'ms',
          status: fcp <= 1800 ? 'good' : fcp <= 3000 ? 'needs-improvement' : 'poor',
          description: 'Temps avant l\'affichage du premier contenu',
          category: 'core-vitals'
        },
        {
          name: 'Largest Contentful Paint (LCP)',
          value: Math.round(lcp),
          threshold: 2500,
          unit: 'ms',
          status: lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor',
          description: 'Temps de chargement du contenu principal',
          category: 'core-vitals'
        },
        {
          name: 'Cumulative Layout Shift (CLS)',
          value: Math.round(cls * 1000) / 1000,
          threshold: 0.1,
          unit: '',
          status: cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor',
          description: 'Stabilité visuelle de la page',
          category: 'core-vitals'
        },
        {
          name: 'First Input Delay (FID)',
          value: Math.round(fid),
          threshold: 100,
          unit: 'ms',
          status: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor',
          description: 'Réactivité aux interactions utilisateur',
          category: 'core-vitals'
        },
        {
          name: 'Time to Interactive (TTI)',
          value: Math.round(navigation?.loadEventEnd - navigation?.fetchStart || 0),
          threshold: 3800,
          unit: 'ms',
          status: (navigation?.loadEventEnd - navigation?.fetchStart || 0) <= 3800 ? 'good' : 'needs-improvement',
          description: 'Temps avant interactivité complète',
          category: 'lighthouse'
        },
        {
          name: 'Total Bundle Size',
          value: await getBundleSize(),
          threshold: 250,
          unit: 'KB',
          status: await getBundleSize() <= 250 ? 'good' : await getBundleSize() <= 500 ? 'needs-improvement' : 'poor',
          description: 'Taille totale des ressources JavaScript',
          category: 'network'
        }
      ];

      setMetrics(newMetrics);
      
      // Calcul du score Lighthouse simulé
      const coreVitalScore = calculateCoreVitalScore(newMetrics);
      setLighthouseScore(coreVitalScore);
      
      // Générer les suggestions d'optimisation
      generateOptimizationSuggestions(newMetrics);
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse performance:', error);
    } finally {
      setIsAnalyzing(false);
      setLastAnalysis(new Date());
    }
  }, []);

  const measureLCP = (): Promise<number> => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          resolve(entries[entries.length - 1].startTime);
          observer.disconnect();
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // Timeout après 5 secondes
      setTimeout(() => {
        observer.disconnect();
        resolve(2000); // Valeur par défaut
      }, 5000);
    });
  };

  const measureCLS = (): Promise<number> => {
    return new Promise((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, 3000);
    });
  };

  const measureFID = (): Promise<number> => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          resolve((entries[0] as any).processingStart - entries[0].startTime);
          observer.disconnect();
        }
      });
      observer.observe({ type: 'first-input', buffered: true });
      
      // Simulation si pas de FID mesuré
      setTimeout(() => {
        observer.disconnect();
        resolve(50); // Valeur optimiste
      }, 3000);
    });
  };

  const getBundleSize = async (): Promise<number> => {
    // Estimation basée sur les ressources chargées
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    const totalSize = jsResources.reduce((sum, r) => sum + (r as any).transferSize || 0, 0);
    return Math.round(totalSize / 1024); // Convertir en KB
  };

  const calculateCoreVitalScore = (metrics: PerformanceMetric[]): number => {
    const coreVitals = metrics.filter(m => m.category === 'core-vitals');
    const goodCount = coreVitals.filter(m => m.status === 'good').length;
    const totalCount = coreVitals.length;
    
    const baseScore = (goodCount / totalCount) * 90;
    const bonusPoints = metrics.filter(m => m.status === 'good').length * 2;
    
    return Math.min(100, Math.round(baseScore + bonusPoints));
  };

  const generateOptimizationSuggestions = (metrics: PerformanceMetric[]) => {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Suggestions basées sur les métriques
    const poorMetrics = metrics.filter(m => m.status === 'poor');
    const needsImprovement = metrics.filter(m => m.status === 'needs-improvement');
    
    if (poorMetrics.some(m => m.name.includes('LCP'))) {
      suggestions.push({
        id: 'lcp_images',
        title: 'Optimiser les images hero/principales',
        impact: 'high',
        effort: 'medium',
        category: 'images',
        description: 'Utiliser des formats modernes (WebP/AVIF) et lazy loading',
        implementation: 'Implémenter next/image ou des composants optimisés',
        estimatedGain: '-800ms LCP',
        implemented: false
      });
    }

    if (poorMetrics.some(m => m.name.includes('FCP'))) {
      suggestions.push({
        id: 'critical_css',
        title: 'Inline Critical CSS',
        impact: 'high',
        effort: 'medium',
        category: 'css',
        description: 'Charger le CSS critique en inline pour accélérer le rendu',
        implementation: 'Extraire le CSS above-the-fold et l\'insérer dans <head>',
        estimatedGain: '-500ms FCP',
        implemented: false
      });
    }

    if (metrics.find(m => m.name.includes('Bundle'))?.status !== 'good') {
      suggestions.push({
        id: 'code_splitting',
        title: 'Code Splitting agressif',
        impact: 'high',
        effort: 'high',
        category: 'javascript',
        description: 'Diviser le bundle en chunks plus petits avec lazy loading',
        implementation: 'Utiliser React.lazy() et dynamic imports',
        estimatedGain: '-200KB bundle',
        implemented: false
      });
    }

    if (needsImprovement.some(m => m.name.includes('CLS'))) {
      suggestions.push({
        id: 'layout_stability',
        title: 'Stabiliser le layout',
        impact: 'medium',
        effort: 'low',
        category: 'css',
        description: 'Définir des dimensions explicites pour les éléments dynamiques',
        implementation: 'Ajouter aspect-ratio et dimensions fixes',
        estimatedGain: '-0.05 CLS',
        implemented: false
      });
    }

    suggestions.push({
      id: 'service_worker',
      title: 'Service Worker pour le cache',
      impact: 'medium',
      effort: 'medium',
      category: 'caching',
      description: 'Mettre en cache les ressources statiques avec un service worker',
      implementation: 'Implémenter Workbox ou un SW custom',
      estimatedGain: '95% cache hit rate',
      implemented: false
    });

    suggestions.push({
      id: 'preload_resources',
      title: 'Preload des ressources critiques',
      impact: 'medium',
      effort: 'low',
      category: 'network',
      description: 'Précharger fonts, CSS et JS critiques',
      implementation: '<link rel="preload"> pour les ressources essentielles',
      estimatedGain: '-200ms temps de chargement',
      implemented: false
    });

    setSuggestions(suggestions);
  };

  const implementSuggestion = (suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestionId 
          ? { ...s, implemented: true }
          : s
      )
    );
  };

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
    }
  };

  const getImpactColor = (impact: OptimizationSuggestion['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  useEffect(() => {
    // Lancer l'analyse initiale
    runPerformanceAnalysis();
  }, [runPerformanceAnalysis]);

  return (
    <div className="space-y-6">
      {/* Header avec score Lighthouse */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Optimiseur de Performance
            </CardTitle>
            <div className="flex items-center gap-4">
              {lastAnalysis && (
                <span className="text-sm text-muted-foreground">
                  Dernière analyse: {lastAnalysis.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={runPerformanceAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Activity className="w-4 h-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyse...' : 'Analyser'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{lighthouseScore}</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-transparent"
                style={{
                  background: `conic-gradient(${
                    lighthouseScore >= 90 ? '#22c55e' : 
                    lighthouseScore >= 70 ? '#f59e0b' : '#ef4444'
                  } ${lighthouseScore * 3.6}deg, transparent ${lighthouseScore * 3.6}deg)`
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Core Web Vitals & Métriques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{metric.name}</h4>
                    <Badge className={cn("text-xs", getStatusColor(metric.status))}>
                      {metric.status === 'good' ? 'BON' : 
                       metric.status === 'needs-improvement' ? 'À AMÉLIORER' : 'MAUVAIS'}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {metric.value}{metric.unit}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Seuil: {metric.threshold}{metric.unit}
                  </div>
                  <Progress 
                    value={metric.status === 'good' ? 100 : metric.status === 'needs-improvement' ? 60 : 30} 
                    className="h-2 mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions d'optimisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Suggestions d'Optimisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className={cn(
                "border transition-colors",
                suggestion.implemented && "bg-green-50 border-green-200"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <Badge className={getImpactColor(suggestion.impact)}>
                          Impact {suggestion.impact.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                        {suggestion.implemented && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      <div className="text-xs space-y-1">
                        <div><strong>Implementation:</strong> {suggestion.implementation}</div>
                        <div><strong>Gain estimé:</strong> {suggestion.estimatedGain}</div>
                      </div>
                    </div>
                    {!suggestion.implemented && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => implementSuggestion(suggestion.id)}
                      >
                        Marquer Implémenté
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};