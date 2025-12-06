import { useState } from 'react';
import { useUnifiedAlerts } from '@/hooks/useUnifiedAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, Shield, ExternalLink, TrendingUp, Database } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { AlertsAnalyticsDashboard } from './AlertsAnalyticsDashboard';

export const UnifiedAlertsPanel = () => {
  const [mode, setMode] = useState<'combined' | 'pagerduty' | 'nvd' | 'analytics'>('combined');
  const { data, alerts, realtimeAlerts, isLoading, refresh, isRefreshing, stats } = useUnifiedAlerts(
    mode === 'analytics' ? 'combined' : mode
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alertes Unifiées</CardTitle>
              <CardDescription>
                Agrégation PagerDuty + NVD en temps réel
              </CardDescription>
            </div>
            <Button
              onClick={() => refresh()}
              disabled={isRefreshing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
                <p className="text-xs text-muted-foreground">Critiques</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-warning">{stats.high}</div>
                <p className="text-xs text-muted-foreground">Élevées</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-warning/80">{stats.medium}</div>
                <p className="text-xs text-muted-foreground">Moyennes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{stats.low}</div>
                <p className="text-xs text-muted-foreground">Faibles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div className="text-2xl font-bold">{data?.avg_unified_score?.toFixed(1) || '0.0'}</div>
                </div>
                <p className="text-xs text-muted-foreground">Score Moyen</p>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques de cache */}
          {data?.cache_stats && (
            <Card className="mb-6 bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {data.from_cache ? '✅ Depuis cache' : '🔄 Depuis API'} - 
                      Hit Rate: {data.cache_stats.hit_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {data.cache_stats.hit_count} hits / {data.cache_stats.miss_count} miss
                  </div>
                </div>
                <Progress value={data.cache_stats.hit_rate} className="h-2 mt-2" />
              </CardContent>
            </Card>
          )}

          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="combined">Toutes</TabsTrigger>
              <TabsTrigger value="pagerduty">PagerDuty</TabsTrigger>
              <TabsTrigger value="nvd">NVD/CVE</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="combined" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Aucune alerte</AlertTitle>
                  <AlertDescription>
                    Aucune alerte active détectée pour le moment.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Card key={alert.id || alert.external_id} className="border-l-4" style={{
                      borderLeftColor: alert.severity === 'critical' ? 'hsl(var(--destructive))' : 
                                      alert.severity === 'high' ? 'orange' :
                                      alert.severity === 'medium' ? 'yellow' : 'blue'
                    }}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getSeverityIcon(alert.severity)}
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{alert.source.toUpperCase()}</Badge>
                              {alert.unified_score && (
                                <Badge variant="default" className="bg-primary">
                                  Score: {alert.unified_score.toFixed(1)}
                                </Badge>
                              )}
                              {alert.cvss_score && (
                                <Badge variant="secondary">
                                  CVSS: {alert.cvss_score.toFixed(1)}
                                </Badge>
                              )}
                              {alert.occurrence_count && alert.occurrence_count > 1 && (
                                <Badge variant="destructive">
                                  ×{alert.occurrence_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {new Date(alert.created_at).toLocaleString('fr-FR')}
                              </span>
                              {alert.status && (
                                <span>Statut: {alert.status}</span>
                              )}
                            </div>
                          </div>
                          {alert.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={alert.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pagerduty" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Aucune alerte</AlertTitle>
                  <AlertDescription>
                    Aucune alerte active détectée pour le moment.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Card key={alert.id || alert.external_id} className="border-l-4" style={{
                      borderLeftColor: alert.severity === 'critical' ? 'hsl(var(--destructive))' : 
                                      alert.severity === 'high' ? 'orange' :
                                      alert.severity === 'medium' ? 'yellow' : 'blue'
                    }}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getSeverityIcon(alert.severity)}
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{alert.source.toUpperCase()}</Badge>
                              {alert.unified_score && (
                                <Badge variant="default" className="bg-primary">
                                  Score: {alert.unified_score.toFixed(1)}
                                </Badge>
                              )}
                              {alert.cvss_score && (
                                <Badge variant="secondary">
                                  CVSS: {alert.cvss_score.toFixed(1)}
                                </Badge>
                              )}
                              {alert.occurrence_count && alert.occurrence_count > 1 && (
                                <Badge variant="destructive">
                                  ×{alert.occurrence_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {new Date(alert.created_at).toLocaleString('fr-FR')}
                              </span>
                              {alert.status && (
                                <span>Statut: {alert.status}</span>
                              )}
                            </div>
                          </div>
                          {alert.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={alert.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="nvd" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Aucune alerte</AlertTitle>
                  <AlertDescription>
                    Aucune alerte active détectée pour le moment.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Card key={alert.id || alert.external_id} className="border-l-4" style={{
                      borderLeftColor: alert.severity === 'critical' ? 'hsl(var(--destructive))' : 
                                      alert.severity === 'high' ? 'orange' :
                                      alert.severity === 'medium' ? 'yellow' : 'blue'
                    }}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getSeverityIcon(alert.severity)}
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{alert.source.toUpperCase()}</Badge>
                              {alert.unified_score && (
                                <Badge variant="default" className="bg-primary">
                                  Score: {alert.unified_score.toFixed(1)}
                                </Badge>
                              )}
                              {alert.cvss_score && (
                                <Badge variant="secondary">
                                  CVSS: {alert.cvss_score.toFixed(1)}
                                </Badge>
                              )}
                              {alert.occurrence_count && alert.occurrence_count > 1 && (
                                <Badge variant="destructive">
                                  ×{alert.occurrence_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {new Date(alert.created_at).toLocaleString('fr-FR')}
                              </span>
                              {alert.status && (
                                <span>Statut: {alert.status}</span>
                              )}
                            </div>
                          </div>
                          {alert.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={alert.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Aucune alerte</AlertTitle>
                  <AlertDescription>
                    Aucune alerte active détectée pour le moment.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="border-l-4" style={{
                      borderLeftColor: alert.severity === 'critical' ? 'hsl(var(--destructive))' : 
                                      alert.severity === 'high' ? 'orange' :
                                      alert.severity === 'medium' ? 'yellow' : 'blue'
                    }}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getSeverityIcon(alert.severity)}
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{alert.source.toUpperCase()}</Badge>
                              {alert.unified_score && (
                                <Badge variant="default" className="bg-primary">
                                  Score: {alert.unified_score.toFixed(1)}
                                </Badge>
                              )}
                              {alert.cvss_score && (
                                <Badge variant="secondary">
                                  CVSS: {alert.cvss_score.toFixed(1)}
                                </Badge>
                              )}
                              {alert.occurrence_count && alert.occurrence_count > 1 && (
                                <Badge variant="destructive">
                                  ×{alert.occurrence_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {new Date(alert.created_at).toLocaleString('fr-FR')}
                              </span>
                              {alert.status && (
                                <span>Statut: {alert.status}</span>
                              )}
                            </div>
                          </div>
                          {alert.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={alert.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 mt-4">
              <AlertsAnalyticsDashboard />
            </TabsContent>
          </Tabs>

          {realtimeAlerts.length > 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Nouvelles alertes en temps réel</AlertTitle>
              <AlertDescription>
                {realtimeAlerts.length} nouvelle(s) alerte(s) détectée(s). Actualisez pour voir les détails.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
