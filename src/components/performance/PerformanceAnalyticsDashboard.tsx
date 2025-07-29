import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, TrendingUp, AlertTriangle, Target, Clock, BarChart3 } from 'lucide-react';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';
import { WebVitalsChart } from './WebVitalsChart';
import { PerformanceBudgetsManager } from './PerformanceBudgetsManager';
import { SLAMetricsDisplay } from './SLAMetricsDisplay';
import { PerformanceAlertsPanel } from './PerformanceAlertsPanel';
import { PerformanceTrendsChart } from './PerformanceTrendsChart';

export const PerformanceAnalyticsDashboard = () => {
  const [period, setPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const {
    analytics,
    statistics,
    loading,
    error,
    refresh,
    createBudget,
    updateBudget,
    acknowledgeAlert,
    resolveAlert,
    calculateSLAMetrics,
  } = usePerformanceAnalytics(period, autoRefresh);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod as '1h' | '24h' | '7d' | '30d');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (grade === 'B') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Erreur</span>
            </div>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button onClick={refresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">
            Monitoring en temps réel des performances et SLA
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 heure</SelectItem>
              <SelectItem value="24h">24 heures</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${getScoreColor(statistics.performanceScore)}`}>
                  {statistics.performanceScore}%
                </div>
                <Badge className={getGradeColor(statistics.performanceGrade)}>
                  {statistics.performanceGrade}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.unresolvedAlerts}</div>
              <div className="text-sm text-muted-foreground">
                {statistics.criticalAlerts} critiques
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budgets Actifs</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.activeBudgets}</div>
              <div className="text-sm text-muted-foreground">
                Budgets surveillés
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Violations SLA</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.slaBreaches}</div>
              <div className="text-sm text-muted-foreground">
                En cours ce mois
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contenu principal */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Web Vitals Summary */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Web Vitals Actuelles</CardTitle>
                  <CardDescription>
                    Métriques de performance utilisateur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WebVitalsChart data={analytics.metrics.webVitals} />
                </CardContent>
              </Card>
            )}

            {/* Performance API */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance API</CardTitle>
                  <CardDescription>
                    Métriques backend et base de données
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.round(analytics.metrics.apiPerformance.avgResponseTime)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Temps réponse moyen</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {analytics.metrics.apiPerformance.errorRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Taux d'erreur</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.round(analytics.metrics.databasePerformance.avgQueryTime)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Requête DB moyenne</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {analytics.metrics.databasePerformance.slowQueries}
                      </div>
                      <div className="text-sm text-muted-foreground">Requêtes lentes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="web-vitals">
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Détails Web Vitals</CardTitle>
                <CardDescription>
                  Analyse détaillée des Core Web Vitals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebVitalsChart data={analytics.metrics.webVitals} detailed />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="budgets">
          <PerformanceBudgetsManager 
            budgets={analytics?.budgets || []}
            onCreateBudget={createBudget}
            onUpdateBudget={updateBudget}
          />
        </TabsContent>

        <TabsContent value="sla">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Métriques SLA</h3>
                <p className="text-sm text-muted-foreground">
                  Surveillance des accords de niveau de service
                </p>
              </div>
              <Button onClick={calculateSLAMetrics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalculer SLA
              </Button>
            </div>
            <SLAMetricsDisplay slas={analytics?.slas || []} />
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <PerformanceAlertsPanel 
            alerts={analytics?.alerts || []}
            onAcknowledgeAlert={acknowledgeAlert}
            onResolveAlert={resolveAlert}
          />
        </TabsContent>

        <TabsContent value="trends">
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Tendances Performance</CardTitle>
                <CardDescription>
                  Évolution des métriques sur la période sélectionnée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceTrendsChart data={analytics.trends.data} period={period} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};