import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle, Target, Gauge } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface TimeSeriesData {
  timestamp: string;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

export const AdvancedPerformanceDashboard: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceScore, setPerformanceScore] = useState(0);

  // Simuler des données de performance
  useEffect(() => {
    const generateMockData = () => {
      const mockMetrics: PerformanceMetric[] = [
        { name: 'LCP', value: 1.2, target: 2.5, trend: 'down', status: 'good' },
        { name: 'FID', value: 45, target: 100, trend: 'stable', status: 'good' },
        { name: 'CLS', value: 0.08, target: 0.1, trend: 'up', status: 'warning' },
        { name: 'TTFB', value: 280, target: 600, trend: 'down', status: 'good' },
        { name: 'Bundle Size', value: 1.8, target: 2.0, trend: 'down', status: 'good' },
        { name: 'Memory Usage', value: 45, target: 70, trend: 'stable', status: 'good' }
      ];

      const mockTimeSeriesData: TimeSeriesData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${i}:00`,
        lcp: 1.0 + Math.random() * 0.5,
        fid: 30 + Math.random() * 30,
        cls: 0.05 + Math.random() * 0.05,
        ttfb: 200 + Math.random() * 200
      }));

      setMetrics(mockMetrics);
      setTimeSeriesData(mockTimeSeriesData);
      
      // Calculer le score de performance
      const score = mockMetrics.reduce((acc, metric) => {
        const ratio = Math.min(metric.value / metric.target, 1);
        return acc + (1 - ratio) * 100;
      }, 0) / mockMetrics.length;
      
      setPerformanceScore(Math.round(score));
      setIsLoading(false);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 30000); // Mise à jour toutes les 30s

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'hsl(var(--success))';
      case 'warning': return 'hsl(var(--warning))';
      case 'critical': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-success rotate-180" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const generateReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      score: performanceScore,
      metrics: metrics,
      recommendations: [
        'Optimiser les images avec WebP',
        'Implémenter le code splitting',
        'Réduire la taille du bundle JavaScript',
        'Utiliser un CDN pour les assets statiques'
      ]
    };

    toast({
      title: "Rapport généré",
      description: `Score de performance: ${performanceScore}/100`,
    });

    // Simuler le téléchargement du rapport
    console.log('Performance Report:', report);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Score de Performance Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">{performanceScore}/100</div>
              <div className="flex items-center gap-2">
                <Badge variant={performanceScore >= 90 ? "default" : performanceScore >= 70 ? "secondary" : "destructive"}>
                  {performanceScore >= 90 ? 'Excellent' : performanceScore >= 70 ? 'Bon' : 'À améliorer'}
                </Badge>
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            </div>
            <Button onClick={generateReport} variant="outline">
              Générer Rapport
            </Button>
          </div>
          <Progress value={performanceScore} className="mt-4" />
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: getStatusColor(metric.status) }}>
                    {metric.value}
                    {metric.name === 'CLS' ? '' : metric.name.includes('Time') || metric.name === 'TTFB' ? 'ms' : metric.name === 'Bundle Size' ? 'MB' : metric.name === 'Memory Usage' ? '%' : ''}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cible: {metric.target}
                    {metric.name === 'CLS' ? '' : metric.name.includes('Time') || metric.name === 'TTFB' ? 'ms' : metric.name === 'Bundle Size' ? 'MB' : metric.name === 'Memory Usage' ? '%' : ''}
                  </p>
                  <Progress 
                    value={Math.min((metric.value / metric.target) * 100, 100)} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Core Web Vitals (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="lcp" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="fid" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="cls" stroke="hsl(var(--accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Performances</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Excellent', value: 60, fill: 'hsl(var(--success))' },
                        { name: 'Bon', value: 30, fill: 'hsl(var(--warning))' },
                        { name: 'À améliorer', value: 10, fill: 'hsl(var(--destructive))' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertes Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm">CLS légèrement élevé</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">LCP optimisé</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Bundle size réduit</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Priorité Haute
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                  <h4 className="font-medium text-sm">Optimiser le Cumulative Layout Shift</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ajouter des dimensions fixes aux images et réserver l'espace pour le contenu dynamique
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-warning/20 bg-warning/5">
                  <h4 className="font-medium text-sm">Réduire le Time to First Byte</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Optimiser les requêtes serveur et utiliser un CDN
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Améliorations Futures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <h4 className="font-medium text-sm">Implémenter le Service Worker</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cache avancé et fonctionnalités offline
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-secondary/20 bg-secondary/5">
                  <h4 className="font-medium text-sm">Optimiser les images</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Conversion automatique en WebP et lazy loading
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