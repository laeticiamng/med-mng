import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, BellOff, AlertTriangle, CheckCircle, X, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MetricAlert {
  id: string;
  alert_type: string;
  metric_name: string;
  threshold_value: number;
  current_value: number;
  triggered_at: string;
  acknowledged: boolean;
  metadata: any;
}

interface MetricsAlertsProps {
  visitStats: Record<string, { count: number; timestamps: number[]; sessions: any[] }>;
  routeLabels: Record<string, { label: string; category: string }>;
  alertThresholds: { bounceRate: number; avgTimeSeconds: number };
  onThresholdsChange: (thresholds: { bounceRate: number; avgTimeSeconds: number }) => void;
}

export function MetricsAlerts({
  visitStats,
  routeLabels,
  alertThresholds,
  onThresholdsChange,
}: MetricsAlertsProps) {
  const [alerts, setAlerts] = useState<MetricAlert[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const { toast } = useToast();

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Charger les préférences
  useEffect(() => {
    const saved = localStorage.getItem('sitemap-alerts-enabled');
    if (saved !== null) {
      setAlertsEnabled(saved === 'true');
    }
  }, []);

  // Charger les alertes existantes
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAlerts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_metric_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('acknowledged', false)
        .order('triggered_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setAlerts(data);
      }
    };

    loadAlerts();
  }, [isAuthenticated]);

  // Écouter les nouvelles alertes en temps réel
  useEffect(() => {
    if (!isAuthenticated || !alertsEnabled) return;

    const channel = supabase
      .channel('metric-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_metric_alerts',
        },
        (payload) => {
          const newAlert = payload.new as MetricAlert;
          setAlerts((prev) => [newAlert, ...prev]);
          
          toast({
            title: '🔔 Nouvelle alerte métrique',
            description: `${newAlert.metric_name}: ${newAlert.current_value.toFixed(1)} (seuil: ${newAlert.threshold_value})`,
            variant: 'destructive',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, alertsEnabled, toast]);

  // Analyser les métriques et créer des alertes si nécessaire
  const checkMetrics = useMemo(() => {
    if (!isAuthenticated || !alertsEnabled) return;

    Object.entries(visitStats).forEach(async ([path, data]) => {
      const label = routeLabels[path]?.label || path;

      // Vérifier le taux de rebond
      const bounces = data.sessions.filter((s) => !s.duration || s.duration < 5000).length;
      const bounceRate = data.count > 0 ? (bounces / data.count) * 100 : 0;

      if (data.count >= 3 && bounceRate > alertThresholds.bounceRate) {
        await createAlert('bounce_rate', label, alertThresholds.bounceRate, bounceRate, {
          path,
          visits: data.count,
        });
      }

      // Vérifier le temps moyen
      const avgDuration = data.sessions.length > 0
        ? data.sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / data.sessions.length / 1000
        : 0;

      if (data.count >= 3 && avgDuration > alertThresholds.avgTimeSeconds) {
        await createAlert('avg_time', label, alertThresholds.avgTimeSeconds, avgDuration, {
          path,
          visits: data.count,
        });
      }
    });
  }, [visitStats, routeLabels, alertThresholds, isAuthenticated, alertsEnabled]);

  const createAlert = async (
    type: string,
    metricName: string,
    threshold: number,
    currentValue: number,
    metadata: any
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Vérifier si une alerte similaire existe déjà récemment
    const { data: existing } = await supabase
      .from('user_metric_alerts')
      .select('id')
      .eq('user_id', user.id)
      .eq('alert_type', type)
      .eq('metric_name', metricName)
      .gte('triggered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existing) return; // Ne pas créer de doublon

    await supabase.from('user_metric_alerts').insert({
      user_id: user.id,
      alert_type: type,
      metric_name: metricName,
      threshold_value: threshold,
      current_value: currentValue,
      metadata,
    });
  };

  const acknowledgeAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('user_metric_alerts')
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq('id', alertId);

    if (!error) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast({
        title: '✓ Alerte acquittée',
        description: 'L\'alerte a été marquée comme lue',
      });
    }
  };

  const toggleAlerts = () => {
    const newValue = !alertsEnabled;
    setAlertsEnabled(newValue);
    localStorage.setItem('sitemap-alerts-enabled', newValue.toString());
    
    toast({
      title: newValue ? '🔔 Alertes activées' : '🔕 Alertes désactivées',
      description: newValue 
        ? 'Vous serez notifié des anomalies métriques' 
        : 'Aucune notification ne sera envoyée',
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'bounce_rate':
        return '📉';
      case 'avg_time':
        return '⏱️';
      default:
        return '⚠️';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="border-destructive/30 bg-gradient-to-br from-destructive/5 to-orange-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              {alertsEnabled ? (
                <Bell className="h-6 w-6 text-destructive" />
              ) : (
                <BellOff className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">Alertes Métriques</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {alerts.length} {alerts.length === 1 ? 'alerte active' : 'alertes actives'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={alertsEnabled ? 'default' : 'outline'}
              onClick={toggleAlerts}
              className="gap-2"
            >
              {alertsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSettings && (
          <div className="p-4 rounded-lg border border-border bg-background space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Seuils d'alerte
            </h4>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bounce-threshold" className="text-sm">
                  Taux de rebond max (%)
                </Label>
                <Input
                  id="bounce-threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={alertThresholds.bounceRate}
                  onChange={(e) =>
                    onThresholdsChange({
                      ...alertThresholds,
                      bounceRate: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-threshold" className="text-sm">
                  Temps moyen max (secondes)
                </Label>
                <Input
                  id="time-threshold"
                  type="number"
                  min="0"
                  value={alertThresholds.avgTimeSeconds}
                  onChange={(e) =>
                    onThresholdsChange({
                      ...alertThresholds,
                      avgTimeSeconds: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {alerts.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Aucune alerte</AlertTitle>
            <AlertDescription>
              Toutes vos métriques sont dans les limites normales.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>{getAlertIcon(alert.alert_type)}</span>
                    {alert.metric_name}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertTitle>
                <AlertDescription>
                  <div className="flex items-center justify-between mt-1">
                    <span>
                      Valeur actuelle: <strong>{alert.current_value.toFixed(1)}</strong>
                    </span>
                    <Badge variant="outline">
                      Seuil: {alert.threshold_value}
                    </Badge>
                  </div>
                  {alert.metadata?.visits && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Basé sur {alert.metadata.visits} visites
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {alertsEnabled && (
          <p className="text-xs text-muted-foreground text-center">
            🔔 Les notifications en temps réel sont activées
          </p>
        )}
      </CardContent>
    </Card>
  );
}
