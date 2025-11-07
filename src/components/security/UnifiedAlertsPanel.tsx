import { useState } from 'react';
import { useUnifiedAlerts } from '@/hooks/useUnifiedAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const UnifiedAlertsPanel = () => {
  const [mode, setMode] = useState<'combined' | 'pagerduty' | 'nvd'>('combined');
  const { data, alerts, realtimeAlerts, isLoading, refresh, isRefreshing, stats } = useUnifiedAlerts(mode);

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
                <p className="text-xs text-muted-foreground">Critiques</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
                <p className="text-xs text-muted-foreground">Élevées</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-500">{stats.medium}</div>
                <p className="text-xs text-muted-foreground">Moyennes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-500">{stats.low}</div>
                <p className="text-xs text-muted-foreground">Faibles</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="combined">Toutes</TabsTrigger>
              <TabsTrigger value="pagerduty">PagerDuty</TabsTrigger>
              <TabsTrigger value="nvd">NVD/CVE</TabsTrigger>
            </TabsList>

            <TabsContent value={mode} className="space-y-4 mt-4">
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
                            <div className="flex items-center gap-2 mb-2">
                              {getSeverityIcon(alert.severity)}
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{alert.source.toUpperCase()}</Badge>
                              {alert.cvss_score && (
                                <Badge variant="secondary">
                                  CVSS: {alert.cvss_score.toFixed(1)}
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
