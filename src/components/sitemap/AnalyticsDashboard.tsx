import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Activity,
  Clock,
  TrendingDown,
  ArrowRight,
  Network,
} from 'lucide-react';

interface PageSession {
  path: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface NavigationPath {
  from: string;
  to: string;
  count: number;
}

interface AnalyticsData {
  visitStats: Record<string, { count: number; timestamps: number[]; sessions: PageSession[] }>;
  navigationPaths: NavigationPath[];
}

interface AnalyticsDashboardProps {
  analyticsData: AnalyticsData;
  routeLabels: Record<string, { label: string; category: string }>;
}

export function AnalyticsDashboard({ analyticsData, routeLabels }: AnalyticsDashboardProps) {
  // Calculer le temps moyen par page
  const avgTimePerPage = useMemo(() => {
    const pageStats = Object.entries(analyticsData.visitStats)
      .map(([path, data]) => {
        const sessions = data.sessions.filter(s => s.duration && s.duration > 0);
        const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;
        
        return {
          path,
          label: routeLabels[path]?.label || path,
          avgDuration: avgDuration / 1000, // Convertir en secondes
          visits: data.count,
          category: routeLabels[path]?.category || 'Autre',
        };
      })
      .filter(p => p.avgDuration > 0)
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    return pageStats;
  }, [analyticsData, routeLabels]);

  // Calculer le taux de rebond (pages visitées une seule fois)
  const bounceRate = useMemo(() => {
    const pageStats = Object.entries(analyticsData.visitStats).map(([path, data]) => {
      const bounces = data.sessions.filter(s => !s.duration || s.duration < 5000).length;
      const bounceRate = data.count > 0 ? (bounces / data.count) * 100 : 0;

      return {
        path,
        label: routeLabels[path]?.label || path,
        bounceRate: Math.round(bounceRate),
        visits: data.count,
      };
    })
    .filter(p => p.visits >= 3) // Minimum 3 visites pour être pertinent
    .sort((a, b) => b.bounceRate - a.bounceRate)
    .slice(0, 8);

    return pageStats;
  }, [analyticsData, routeLabels]);

  // Chemins de navigation les plus fréquents
  const topNavigationPaths = useMemo(() => {
    return analyticsData.navigationPaths
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(path => ({
        ...path,
        fromLabel: routeLabels[path.from]?.label || path.from,
        toLabel: routeLabels[path.to]?.label || path.to,
      }));
  }, [analyticsData, routeLabels]);

  // Corrélations entre pages (pages souvent visitées ensemble)
  const pageCorrelations = useMemo(() => {
    const correlations: Record<string, Record<string, number>> = {};

    Object.entries(analyticsData.visitStats).forEach(([path1, data1]) => {
      data1.timestamps.forEach(timestamp => {
        // Trouver les autres pages visitées dans une fenêtre de 30 minutes
        Object.entries(analyticsData.visitStats).forEach(([path2, data2]) => {
          if (path1 !== path2) {
            const hasCorrelation = data2.timestamps.some(
              ts => Math.abs(ts - timestamp) < 30 * 60 * 1000 // 30 minutes
            );
            
            if (hasCorrelation) {
              if (!correlations[path1]) correlations[path1] = {};
              correlations[path1][path2] = (correlations[path1][path2] || 0) + 1;
            }
          }
        });
      });
    });

    // Trouver les corrélations les plus fortes
    const topCorrelations = Object.entries(correlations)
      .flatMap(([page1, corrs]) =>
        Object.entries(corrs).map(([page2, count]) => ({
          page1,
          page2,
          count,
          label1: routeLabels[page1]?.label || page1,
          label2: routeLabels[page2]?.label || page2,
        }))
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return topCorrelations;
  }, [analyticsData, routeLabels]);

  // Distribution du temps par catégorie
  const timeByCategory = useMemo(() => {
    const categoryTime: Record<string, number> = {};

    Object.entries(analyticsData.visitStats).forEach(([path, data]) => {
      const category = routeLabels[path]?.category || 'Autre';
      const totalTime = data.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      categoryTime[category] = (categoryTime[category] || 0) + totalTime;
    });

    return Object.entries(categoryTime)
      .map(([name, value]) => ({
        name,
        value: Math.round(value / 1000 / 60), // Convertir en minutes
      }))
      .sort((a, b) => b.value - a.value);
  }, [analyticsData, routeLabels]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Dashboard Analytique</h2>
          <p className="text-sm text-muted-foreground">
            Analyse détaillée de votre navigation et comportement
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Temps moyen par page */}
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Temps moyen par page</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {avgTimePerPage.map((page, index) => (
                <div key={page.path} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1 font-medium">{page.label}</span>
                    <span className="text-primary font-bold ml-2">{formatDuration(page.avgDuration)}</span>
                  </div>
                  <Progress value={(page.avgDuration / avgTimePerPage[0].avgDuration) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{page.category}</span>
                    <span>{page.visits} visites</span>
                  </div>
                </div>
              ))}
              {avgTimePerPage.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Pas encore de données temporelles
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Taux de rebond */}
        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg">Taux de rebond</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bounceRate.map((page) => (
                <div key={page.path} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1 font-medium">{page.label}</span>
                    <Badge
                      variant={page.bounceRate > 70 ? 'destructive' : page.bounceRate > 40 ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {page.bounceRate}%
                    </Badge>
                  </div>
                  <Progress value={page.bounceRate} className="h-2" />
                  <p className="text-xs text-muted-foreground">{page.visits} visites</p>
                </div>
              ))}
              {bounceRate.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Pas assez de données (minimum 3 visites par page)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chemins de navigation préférés */}
      {topNavigationPaths.length > 0 && (
        <Card className="border-accent/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg">Chemins de navigation préférés</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topNavigationPaths.map((path, index) => (
                <div
                  key={`${path.from}-${path.to}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="truncate font-medium">{path.fromLabel}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium">{path.toLabel}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {path.count}×
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Corrélations entre pages */}
        {pageCorrelations.length > 0 && (
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Network className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Pages visitées ensemble</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pageCorrelations.map((corr) => (
                  <div
                    key={`${corr.page1}-${corr.page2}`}
                    className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="truncate font-medium">{corr.label1}</p>
                        <p className="truncate text-muted-foreground text-xs">↔ {corr.label2}</p>
                      </div>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {corr.count}×
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Distribution du temps par catégorie */}
        {timeByCategory.length > 0 && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle className="text-lg">Temps par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={timeByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {timeByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value: number) => [`${value} min`, 'Temps total']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {avgTimePerPage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Durée de visite par page (graphique)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgTimePerPage.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Secondes', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: number) => [formatDuration(value), 'Temps moyen']}
                />
                <Bar dataKey="avgDuration" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
