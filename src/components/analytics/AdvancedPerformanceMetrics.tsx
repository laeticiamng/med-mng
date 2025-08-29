import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Gauge
} from 'lucide-react';
import { toast } from 'sonner';

interface WebVitalsMetrics {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
  inp: number;
}

interface PerformanceBudget {
  metric: string;
  target: number;
  current: number;
  status: 'good' | 'warning' | 'poor';
}

export const AdvancedPerformanceMetrics = () => {
  const [webVitals, setWebVitals] = useState<WebVitalsMetrics | null>(null);
  const [budgets, setBudgets] = useState<PerformanceBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  useEffect(() => {
    initializeMetrics();
    startRealTimeMonitoring();
  }, []);

  const initializeMetrics = async () => {
    try {
      // Simulate advanced Web Vitals collection
      const vitals: WebVitalsMetrics = {
        lcp: Math.random() * 1000 + 1500,
        fid: Math.random() * 50 + 50,
        cls: Math.random() * 0.1 + 0.05,
        ttfb: Math.random() * 200 + 300,
        fcp: Math.random() * 800 + 1200,
        inp: Math.random() * 100 + 100
      };

      const performanceBudgets: PerformanceBudget[] = [
        { metric: 'LCP (Largest Contentful Paint)', target: 2500, current: vitals.lcp, status: vitals.lcp <= 2500 ? 'good' : vitals.lcp <= 4000 ? 'warning' : 'poor' },
        { metric: 'FID (First Input Delay)', target: 100, current: vitals.fid, status: vitals.fid <= 100 ? 'good' : vitals.fid <= 300 ? 'warning' : 'poor' },
        { metric: 'CLS (Cumulative Layout Shift)', target: 0.1, current: vitals.cls, status: vitals.cls <= 0.1 ? 'good' : vitals.cls <= 0.25 ? 'warning' : 'poor' },
        { metric: 'TTFB (Time to First Byte)', target: 600, current: vitals.ttfb, status: vitals.ttfb <= 600 ? 'good' : vitals.ttfb <= 1500 ? 'warning' : 'poor' },
        { metric: 'FCP (First Contentful Paint)', target: 1800, current: vitals.fcp, status: vitals.fcp <= 1800 ? 'good' : vitals.fcp <= 3000 ? 'warning' : 'poor' },
        { metric: 'INP (Interaction to Next Paint)', target: 200, current: vitals.inp, status: vitals.inp <= 200 ? 'good' : vitals.inp <= 500 ? 'warning' : 'poor' }
      ];

      setWebVitals(vitals);
      setBudgets(performanceBudgets);
    } catch (error) {
      toast.error('Erreur lors du chargement des métriques avancées');
    } finally {
      setLoading(false);
    }
  };

  const startRealTimeMonitoring = () => {
    const interval = setInterval(() => {
      const newDataPoint = {
        timestamp: new Date().toISOString(),
        responseTime: Math.random() * 100 + 150,
        memoryUsage: Math.random() * 20 + 60,
        cpuUsage: Math.random() * 30 + 40
      };
      
      setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
    }, 2000);

    return () => clearInterval(interval);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculatePerformanceScore = () => {
    if (!budgets.length) return 0;
    const goodCount = budgets.filter(b => b.status === 'good').length;
    return Math.round((goodCount / budgets.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des métriques avancées...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Métriques Performance Avancées</h2>
          <p className="text-muted-foreground">Analyse complète des performances Web Vitals</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Score: {calculatePerformanceScore()}%
          </Badge>
          <Button onClick={initializeMetrics} size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Performance Score Alert */}
      {calculatePerformanceScore() < 80 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Score de performance faible ({calculatePerformanceScore()}%). 
            Optimisations recommandées pour améliorer l'expérience utilisateur.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="budgets">Budgets Performance</TabsTrigger>
          <TabsTrigger value="realtime">Temps Réel</TabsTrigger>
          <TabsTrigger value="analysis">Analyse Détaillée</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          {webVitals && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">LCP</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(webVitals.lcp)}ms</div>
                  <Progress value={(webVitals.lcp / 4000) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Largest Contentful Paint
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">FID</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(webVitals.fid)}ms</div>
                  <Progress value={(webVitals.fid / 300) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    First Input Delay
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CLS</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{webVitals.cls.toFixed(3)}</div>
                  <Progress value={(webVitals.cls / 0.25) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cumulative Layout Shift
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">TTFB</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(webVitals.ttfb)}ms</div>
                  <Progress value={(webVitals.ttfb / 1500) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Time to First Byte
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">FCP</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(webVitals.fcp)}ms</div>
                  <Progress value={(webVitals.fcp / 3000) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    First Contentful Paint
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">INP</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(webVitals.inp)}ms</div>
                  <Progress value={(webVitals.inp / 500) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Interaction to Next Paint
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budgets de Performance</CardTitle>
              <CardDescription>
                Suivi des objectifs de performance définis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgets.map((budget, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(budget.status)}
                      <div>
                        <div className="font-medium">{budget.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          Objectif: {budget.target}{budget.metric.includes('CLS') ? '' : 'ms'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getStatusColor(budget.status)}`}>
                        {Math.round(budget.current)}{budget.metric.includes('CLS') ? '' : 'ms'}
                      </div>
                      <Badge variant={budget.status === 'good' ? 'default' : budget.status === 'warning' ? 'secondary' : 'destructive'}>
                        {budget.status === 'good' ? 'Excellent' : budget.status === 'warning' ? 'Attention' : 'À améliorer'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Temps de Réponse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {realTimeData.length > 0 ? Math.round(realTimeData[realTimeData.length - 1]?.responseTime) : 0}ms
                </div>
                <p className="text-sm text-muted-foreground">Moyenne des 30 dernières secondes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilisation Mémoire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {realTimeData.length > 0 ? Math.round(realTimeData[realTimeData.length - 1]?.memoryUsage) : 0}%
                </div>
                <Progress 
                  value={realTimeData.length > 0 ? realTimeData[realTimeData.length - 1]?.memoryUsage : 0} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CPU</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {realTimeData.length > 0 ? Math.round(realTimeData[realTimeData.length - 1]?.cpuUsage) : 0}%
                </div>
                <Progress 
                  value={realTimeData.length > 0 ? realTimeData[realTimeData.length - 1]?.cpuUsage : 0} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse et Recommandations</CardTitle>
              <CardDescription>
                Suggestions d'optimisation basées sur les métriques actuelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgets.filter(b => b.status !== 'good').map((budget, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-medium">
                          Optimisation requise: {budget.metric}
                        </div>
                        <div className="text-sm">
                          {budget.metric.includes('LCP') && 'Optimisez le chargement des images et réduisez la taille des ressources critiques.'}
                          {budget.metric.includes('FID') && 'Réduisez le JavaScript bloquant et optimisez les event listeners.'}
                          {budget.metric.includes('CLS') && 'Définissez des dimensions fixes pour les images et évitez l\'insertion dynamique de contenu.'}
                          {budget.metric.includes('TTFB') && 'Optimisez la configuration serveur et utilisez un CDN.'}
                          {budget.metric.includes('FCP') && 'Réduisez le CSS bloquant et optimisez les polices web.'}
                          {budget.metric.includes('INP') && 'Optimisez les gestionnaires d\'événements et réduisez les tâches JavaScript longues.'}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
                
                {budgets.every(b => b.status === 'good') && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      🎉 Excellent ! Toutes vos métriques de performance respectent les budgets définis. 
                      Votre site offre une expérience utilisateur optimale.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};