import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePerformanceDegradationAlerts } from '@/hooks/usePerformanceDegradationAlerts';
import { AlertTriangle, TrendingDown, X, Check, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CATEGORY_LABELS: Record<string, string> = {
  timing: 'Timing',
  platform: 'Plateforme',
  volume: 'Volume',
  quality: 'Qualité',
};

export const PerformanceDegradationAlerts: React.FC = () => {
  const {
    alerts,
    unacknowledgedAlerts,
    criticalAlerts,
    loading,
    acknowledgeAlert,
    dismissAlert,
    refresh,
  } = usePerformanceDegradationAlerts();

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, 'dd MMM', { locale: fr })} - ${format(endDate, 'dd MMM yyyy', { locale: fr })}`;
  };

  if (alerts.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-success" />
            Alertes de Dégradation
          </CardTitle>
          <CardDescription>
            Aucune dégradation de performance détectée récemment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <Check className="h-12 w-12 mx-auto mb-3 text-success" />
              <p className="font-medium">Tout va bien !</p>
              <p className="text-sm mt-1">Aucune dégradation significative n'a été détectée.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Alertes de Dégradation
              {unacknowledgedAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unacknowledgedAlerts.length} non lue{unacknowledgedAlerts.length > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Surveillance automatique des baisses de performance supérieures à 10%
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiques rapides */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-sm font-medium text-muted-foreground">Total d'alertes</div>
            <div className="text-2xl font-bold text-foreground mt-1">{alerts.length}</div>
          </div>
          <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5">
            <div className="text-sm font-medium text-muted-foreground">Critiques</div>
            <div className="text-2xl font-bold text-destructive mt-1">{criticalAlerts.length}</div>
          </div>
          <div className="p-4 rounded-lg border border-warning/50 bg-warning/5">
            <div className="text-sm font-medium text-muted-foreground">Non lues</div>
            <div className="text-2xl font-bold text-warning mt-1">{unacknowledgedAlerts.length}</div>
          </div>
        </div>

        {/* Liste des alertes */}
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.severity === 'critical' ? 'destructive' : 'default'}
              className={`relative ${!alert.acknowledged ? 'border-l-4' : ''} ${
                alert.severity === 'critical' ? 'border-l-destructive' : 'border-l-warning'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <AlertTitle className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    {CATEGORY_LABELS[alert.category] || alert.category} : Baisse de{' '}
                    {alert.degradation_percentage.toFixed(1)}%
                    <Badge
                      variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {alert.severity === 'critical' ? 'Critique' : 'Avertissement'}
                    </Badge>
                    {!alert.acknowledged && (
                      <Badge variant="outline" className="ml-2">
                        Nouveau
                      </Badge>
                    )}
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-1">
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        Score : {alert.previous_score} → {alert.current_score}
                      </span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-muted-foreground">
                        Détecté le {format(new Date(alert.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      <div>Période précédente : {formatPeriod(alert.previous_period_start, alert.previous_period_end)}</div>
                      <div>Période actuelle : {formatPeriod(alert.current_period_start, alert.current_period_end)}</div>
                    </div>
                  </AlertDescription>
                </div>
                <div className="flex gap-2">
                  {!alert.acknowledged && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Marquer comme lu
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
