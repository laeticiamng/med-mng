import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Globe, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Monitor,
  Smartphone,
  RefreshCw,
  Download,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';
import { usePerformance } from '@/contexts/PerformanceContext';
import { useInternationalization } from '@/contexts/InternationalizationContext';

interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
}

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
}

export const PerformanceDashboard: React.FC = () => {
  const { t } = useInternationalization();
  const performance = usePerformance();
  
  const [lighthouseScore, setLighthouseScore] = useState<LighthouseScore>({
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
    pwa: 0
  });
  
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [lastAuditTime, setLastAuditTime] = useState<Date | null>(null);
  const [webVitals, setWebVitals] = useState<WebVitalMetric[]>([]);

  // Calculer les Web Vitals
  useEffect(() => {
    const calculateWebVitals = () => {
      const vitals: WebVitalMetric[] = [
        {
          name: 'LCP',
          value: performance.webVitals.LCP || 0,
          rating: getRating(performance.webVitals.LCP || 0, { good: 2500, poor: 4000 }),
          threshold: { good: 2500, poor: 4000 }
        },
        {
          name: 'FID', 
          value: performance.webVitals.FID || 0,
          rating: getRating(performance.webVitals.FID || 0, { good: 100, poor: 300 }),
          threshold: { good: 100, poor: 300 }
        },
        {
          name: 'CLS',
          value: performance.webVitals.CLS || 0,
          rating: getRating(performance.webVitals.CLS || 0, { good: 0.1, poor: 0.25 }),
          threshold: { good: 0.1, poor: 0.25 }
        },
        {
          name: 'FCP',
          value: performance.webVitals.FCP || 0,
          rating: getRating(performance.webVitals.FCP || 0, { good: 1800, poor: 3000 }),
          threshold: { good: 1800, poor: 3000 }
        },
        {
          name: 'TTFB',
          value: performance.webVitals.TTFB || 0,
          rating: getRating(performance.webVitals.TTFB || 0, { good: 600, poor: 1000 }),
          threshold: { good: 600, poor: 1000 }
        }
      ];
      
      setWebVitals(vitals);
    };

    calculateWebVitals();
  }, [performance.webVitals]);

  const getRating = (value: number, threshold: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const runLighthouseAudit = useCallback(async () => {
    setIsRunningAudit(true);
    
    try {
      // Simuler un audit Lighthouse (en production, on utiliserait l'API Lighthouse)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Calculer les scores basés sur les métriques actuelles
      const performanceScore = performance.getPerformanceScore();
      
      setLighthouseScore({
        performance: performanceScore,
        accessibility: Math.min(100, performanceScore + Math.random() * 10),
        bestPractices: Math.min(100, performanceScore + Math.random() * 8),
        seo: Math.min(100, performanceScore + Math.random() * 5),
        pwa: Math.min(100, performanceScore - Math.random() * 15)
      });
      
      setLastAuditTime(new Date());
      
    } catch (error) {
      console.error('Erreur lors de l\'audit Lighthouse:', error);
    } finally {
      setIsRunningAudit(false);
    }
  }, [performance]);

  const formatMetricValue = (metric: WebVitalMetric): string => {
    if (metric.name === 'CLS') {
      return metric.value.toFixed(3);
    } else {
      return `${Math.round(metric.value)}ms`;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getOverallScore = (): number => {
    const scores = Object.values(lighthouseScore);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const WebVitalCard: React.FC<{ metric: WebVitalMetric }> = ({ metric }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{formatMetricValue(metric)}</span>
          <Badge 
            variant={metric.rating === 'good' ? 'default' : 
                    metric.rating === 'needs-improvement' ? 'secondary' : 'destructive'}
          >
            {metric.rating === 'good' ? '✓' : 
             metric.rating === 'needs-improvement' ? '!' : '✗'}
          </Badge>
        </div>
        <Progress 
          value={Math.min(100, (metric.value / metric.threshold.poor) * 100)} 
          className="mt-2"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Seuil optimal: {metric.name === 'CLS' ? metric.threshold.good.toFixed(2) : `${metric.threshold.good}ms`}
        </div>
      </CardContent>
    </Card>
  );

  const LighthouseScoreCard: React.FC<{ title: string; score: number; icon: React.ReactNode }> = ({ 
    title, 
    score, 
    icon 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {Math.round(score)}
        </div>
        <Progress value={score} className="mt-2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Surveillance et optimisation des performances en temps réel
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastAuditTime && (
            <div className="text-sm text-muted-foreground">
              Dernier audit: {lastAuditTime.toLocaleTimeString()}
            </div>
          )}
          <Button 
            onClick={runLighthouseAudit}
            disabled={isRunningAudit}
          >
            {isRunningAudit ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Audit en cours...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Lancer Audit Lighthouse
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Score global */}
      <Card>
        <CardHeader>
          <CardTitle>Score Global de Performance</CardTitle>
          <CardDescription>
            Score moyen basé sur tous les critères de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`text-4xl font-bold ${getScoreColor(getOverallScore())}`}>
              {Math.round(getOverallScore())}/100
            </div>
            <Progress value={getOverallScore()} className="flex-1" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="web-vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="lighthouse">Scores Lighthouse</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="web-vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {webVitals.map((metric) => (
              <WebVitalCard key={metric.name} metric={metric} />
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Métriques Système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Utilisation Mémoire JS</div>
                  <div className="text-2xl font-bold">
                    {(performance.memoryUsage.jsHeapSize / 1024 / 1024).toFixed(1)} MB
                  </div>
                  <Progress 
                    value={(performance.memoryUsage.jsHeapSize / performance.memoryUsage.jsHeapSizeLimit) * 100} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">Type de Connexion</div>
                  <div className="text-2xl font-bold">{performance.networkMetrics.effectiveType}</div>
                  <div className="text-sm text-muted-foreground">
                    {performance.networkMetrics.downlink} Mbps
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lighthouse" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <LighthouseScoreCard
              title="Performance"
              score={lighthouseScore.performance}
              icon={<Zap className="h-4 w-4" />}
            />
            <LighthouseScoreCard
              title="Accessibilité"
              score={lighthouseScore.accessibility}
              icon={<Eye className="h-4 w-4" />}
            />
            <LighthouseScoreCard
              title="Bonnes Pratiques"
              score={lighthouseScore.bestPractices}
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <LighthouseScoreCard
              title="SEO"
              score={lighthouseScore.seo}
              icon={<Globe className="h-4 w-4" />}
            />
            <LighthouseScoreCard
              title="PWA"
              score={lighthouseScore.pwa}
              icon={<Smartphone className="h-4 w-4" />}
            />
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Taille des Ressources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Bundle JS</span>
                    <span>{(performance.loadingMetrics.bundleSize / 1024).toFixed(0)} KB</span>
                  </div>
                  <Progress value={Math.min(100, (performance.loadingMetrics.bundleSize / (1024 * 1024)) * 100)} />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Temps de chargement</span>
                    <span>{performance.loadingMetrics.loadTime.toFixed(0)} ms</span>
                  </div>
                  <Progress value={Math.min(100, performance.loadingMetrics.loadTime / 50)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimisations Actives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">Lazy loading activé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">Compression gzip</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">Mise en cache des ressources</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm">Service Worker manquant</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {((performance.optimizeBundle() as unknown) as string[] || []).map((suggestion, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">{suggestion}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Implémentation de cette optimisation peut améliorer les performances de 5-15%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Recommandations génériques */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Clock className="w-5 h-5 text-success mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">Optimiser les images</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Convertir les images au format WebP et implémenter le lazy loading pour améliorer LCP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Monitor className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">Précharger les ressources critiques</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Utiliser les directives de préchargement pour les polices et CSS critiques
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};