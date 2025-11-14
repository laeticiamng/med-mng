import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Eye, 
  Clock,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetric {
  timestamp: string;
  fcp: number;
  lcp: number;
  tbt: number;
  cls: number;
  score: number;
  lazyLoading: boolean;
}

interface MetricComparison {
  metric: string;
  before: number;
  after: number;
  improvement: number;
  unit: string;
  threshold: number;
}

const PerformanceDashboard = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Simuler le chargement des données de performance
      // En production, ceci viendrait d'une API ou de fichiers JSON stockés
      const mockData: PerformanceMetric[] = generateMockData(selectedPeriod);
      setMetrics(mockData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de performance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (period: string): PerformanceMetric[] => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data: PerformanceMetric[] = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Avant lazy loading (première moitié)
      if (i > days / 2) {
        data.push({
          timestamp: date.toISOString(),
          fcp: 2.1 + Math.random() * 0.3,
          lcp: 3.2 + Math.random() * 0.4,
          tbt: 450 + Math.random() * 100,
          cls: 0.15 + Math.random() * 0.05,
          score: 65 + Math.random() * 10,
          lazyLoading: false
        });
      } else {
        // Après lazy loading (deuxième moitié)
        data.push({
          timestamp: date.toISOString(),
          fcp: 1.5 + Math.random() * 0.2,
          lcp: 2.2 + Math.random() * 0.3,
          tbt: 200 + Math.random() * 50,
          cls: 0.08 + Math.random() * 0.02,
          score: 88 + Math.random() * 8,
          lazyLoading: true
        });
      }
    }

    return data;
  };

  const getLatestMetrics = (): PerformanceMetric | null => {
    if (metrics.length === 0) return null;
    return metrics[metrics.length - 1];
  };

  const getAverageMetrics = (withLazyLoading: boolean) => {
    const filtered = metrics.filter(m => m.lazyLoading === withLazyLoading);
    if (filtered.length === 0) return null;

    return {
      fcp: filtered.reduce((sum, m) => sum + m.fcp, 0) / filtered.length,
      lcp: filtered.reduce((sum, m) => sum + m.lcp, 0) / filtered.length,
      tbt: filtered.reduce((sum, m) => sum + m.tbt, 0) / filtered.length,
      cls: filtered.reduce((sum, m) => sum + m.cls, 0) / filtered.length,
      score: filtered.reduce((sum, m) => sum + m.score, 0) / filtered.length
    };
  };

  const getComparisons = (): MetricComparison[] => {
    const before = getAverageMetrics(false);
    const after = getAverageMetrics(true);

    if (!before || !after) return [];

    return [
      {
        metric: 'First Contentful Paint',
        before: before.fcp,
        after: after.fcp,
        improvement: ((before.fcp - after.fcp) / before.fcp) * 100,
        unit: 's',
        threshold: 1.8
      },
      {
        metric: 'Largest Contentful Paint',
        before: before.lcp,
        after: after.lcp,
        improvement: ((before.lcp - after.lcp) / before.lcp) * 100,
        unit: 's',
        threshold: 2.5
      },
      {
        metric: 'Total Blocking Time',
        before: before.tbt,
        after: after.tbt,
        improvement: ((before.tbt - after.tbt) / before.tbt) * 100,
        unit: 'ms',
        threshold: 300
      },
      {
        metric: 'Cumulative Layout Shift',
        before: before.cls,
        after: after.cls,
        improvement: ((before.cls - after.cls) / before.cls) * 100,
        unit: '',
        threshold: 0.1
      }
    ];
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-metrics-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "Les données de performance ont été exportées"
    });
  };

  const latest = getLatestMetrics();
  const comparisons = getComparisons();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des métriques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            Dashboard Performance
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyse des Core Web Vitals et impact du lazy loading
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPerformanceData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <Button
          variant={selectedPeriod === '7d' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('7d')}
        >
          7 jours
        </Button>
        <Button
          variant={selectedPeriod === '30d' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('30d')}
        >
          30 jours
        </Button>
        <Button
          variant={selectedPeriod === '90d' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('90d')}
        >
          90 jours
        </Button>
      </div>

      {/* Current Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>FCP</span>
              <Zap className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latest?.fcp.toFixed(2)}s</div>
            <p className="text-xs text-muted-foreground mt-1">
              {latest && latest.fcp < 1.8 ? (
                <span className="text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Excellent
                </span>
              ) : (
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> À améliorer
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>LCP</span>
              <Eye className="w-4 h-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latest?.lcp.toFixed(2)}s</div>
            <p className="text-xs text-muted-foreground mt-1">
              {latest && latest.lcp < 2.5 ? (
                <span className="text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Excellent
                </span>
              ) : (
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> À améliorer
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>TBT</span>
              <Clock className="w-4 h-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latest?.tbt.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              {latest && latest.tbt < 300 ? (
                <span className="text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Excellent
                </span>
              ) : (
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> À améliorer
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Score</span>
              <Activity className="w-4 h-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latest?.score.toFixed(0)}/100</div>
            <Badge variant={latest && latest.score >= 90 ? 'default' : 'secondary'} className="mt-1">
              {latest && latest.lazyLoading ? 'Avec Lazy Loading' : 'Sans Lazy Loading'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Impact du Lazy Loading</CardTitle>
          <CardDescription>
            Comparaison des métriques avant et après l'implémentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisons.map((comp) => (
              <div key={comp.metric} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex-1">
                  <p className="font-medium">{comp.metric}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Avant: {comp.before.toFixed(2)}{comp.unit}</span>
                    <span>→</span>
                    <span className="text-primary font-medium">
                      Après: {comp.after.toFixed(2)}{comp.unit}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 font-bold ${comp.improvement > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {comp.improvement > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(comp.improvement).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Seuil: {comp.threshold}{comp.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Évolution dans le temps</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals - Évolution</CardTitle>
              <CardDescription>
                Métriques de performance au fil du temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value: number) => value.toFixed(2)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="fcp" 
                    stroke="#3b82f6" 
                    name="FCP (s)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lcp" 
                    stroke="#a855f7" 
                    name="LCP (s)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatDate}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value: number) => value.toFixed(0)}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    name="Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Avant / Après Lazy Loading</CardTitle>
              <CardDescription>
                Comparaison visuelle des moyennes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={comparisons.map(c => ({
                    name: c.metric,
                    'Sans Lazy Loading': c.before,
                    'Avec Lazy Loading': c.after
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Sans Lazy Loading" fill="#ef4444" />
                  <Bar dataKey="Avec Lazy Loading" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Distribution TBT</CardTitle>
              <CardDescription>
                Répartition du Total Blocking Time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value: number) => `${value.toFixed(0)}ms`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="tbt" 
                    fill="#f59e0b" 
                    name="TBT (ms)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
