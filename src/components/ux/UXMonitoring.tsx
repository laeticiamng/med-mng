import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart,
  Shield,
  Gauge,
  Bell,
  Settings,
  RefreshCw
} from 'lucide-react';

interface UXAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export const UXMonitoring = () => {
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState<UXAlert[]>([]);
  
  const [liveMetrics, setLiveMetrics] = useState({
    activeUsers: 23,
    responseTime: 0.45,
    errorRate: 0.1,
    satisfactionScore: 98.2,
    conversionRate: 85.4,
    bounceRate: 12.3,
    pageLoadTime: 0.82,
    coreWebVitals: {
      lcp: 0.65,
      fid: 8,
      cls: 0.02
    }
  });

  const [performanceThresholds] = useState({
    responseTime: 1.0,    // secondes
    errorRate: 2.0,       // pourcentage
    satisfaction: 90.0,   // pourcentage
    bounceRate: 25.0,     // pourcentage
    pageLoad: 2.0         // secondes
  });

  useEffect(() => {
    if (!isMonitoring) return;

    // Simulation de métriques en temps réel
    const metricsInterval = setInterval(() => {
      setLiveMetrics(prev => ({
        ...prev,
        activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 6) - 3),
        responseTime: Math.max(0.1, prev.responseTime + (Math.random() - 0.5) * 0.1),
        errorRate: Math.max(0, prev.errorRate + (Math.random() - 0.5) * 0.2),
        satisfactionScore: Math.min(100, Math.max(80, prev.satisfactionScore + (Math.random() - 0.5) * 2)),
        conversionRate: Math.min(100, Math.max(60, prev.conversionRate + (Math.random() - 0.5) * 1.5)),
        bounceRate: Math.min(40, Math.max(5, prev.bounceRate + (Math.random() - 0.5) * 2)),
        pageLoadTime: Math.max(0.3, prev.pageLoadTime + (Math.random() - 0.5) * 0.15),
        coreWebVitals: {
          lcp: Math.max(0.3, prev.coreWebVitals.lcp + (Math.random() - 0.5) * 0.1),
          fid: Math.max(1, prev.coreWebVitals.fid + Math.floor((Math.random() - 0.5) * 10)),
          cls: Math.max(0.001, prev.coreWebVitals.cls + (Math.random() - 0.5) * 0.01)
        }
      }));
    }, 2000);

    // Vérification des seuils et génération d'alertes
    const alertInterval = setInterval(() => {
      const newAlerts: UXAlert[] = [];

      if (liveMetrics.responseTime > performanceThresholds.responseTime) {
        newAlerts.push({
          id: `response-${Date.now()}`,
          type: 'warning',
          title: 'Temps de réponse élevé',
          message: `${liveMetrics.responseTime.toFixed(2)}s > ${performanceThresholds.responseTime}s`,
          timestamp: new Date(),
          resolved: false
        });
      }

      if (liveMetrics.errorRate > performanceThresholds.errorRate) {
        newAlerts.push({
          id: `error-${Date.now()}`,
          type: 'error',
          title: 'Taux d\'erreur élevé',
          message: `${liveMetrics.errorRate.toFixed(1)}% > ${performanceThresholds.errorRate}%`,
          timestamp: new Date(),
          resolved: false
        });
      }

      if (liveMetrics.satisfactionScore < performanceThresholds.satisfaction) {
        newAlerts.push({
          id: `satisfaction-${Date.now()}`,
          type: 'warning',
          title: 'Satisfaction en baisse',
          message: `${liveMetrics.satisfactionScore.toFixed(1)}% < ${performanceThresholds.satisfaction}%`,
          timestamp: new Date(),
          resolved: false
        });
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]);
        
        // Toast pour les alertes critiques
        newAlerts.forEach(alert => {
          if (alert.type === 'error') {
            toast({
              title: alert.title,
              description: alert.message,
              variant: "destructive",
            });
          }
        });
      }
    }, 5000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(alertInterval);
    };
  }, [isMonitoring, liveMetrics, performanceThresholds, toast]);

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info': return <Eye className="h-4 w-4 text-info" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getMetricTrend = (current: number, threshold: number, inverse = false) => {
    const isGood = inverse ? current < threshold : current > threshold;
    return isGood ? 
      <TrendingUp className="h-4 w-4 text-success" /> : 
      <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getMetricColor = (current: number, threshold: number, inverse = false) => {
    const isGood = inverse ? current < threshold : current > threshold;
    return isGood ? 'text-success' : 'text-destructive';
  };

  const unreadAlerts = alerts.filter(alert => !alert.resolved).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header de monitoring */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Monitoring UX Temps Réel
              {isMonitoring && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">Live</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadAlerts > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  <Bell className="h-3 w-3 mr-1" />
                  {unreadAlerts}
                </Badge>
              )}
              <Button 
                variant={isMonitoring ? "default" : "outline"}
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="flex items-center gap-1"
              >
                {isMonitoring ? 
                  <>
                    <Activity className="h-3 w-3" />
                    Actif
                  </> : 
                  <>
                    <RefreshCw className="h-3 w-3" />
                    Démarrer
                  </>
                }
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Métriques en temps réel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{liveMetrics.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
              </div>
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getMetricColor(liveMetrics.responseTime, performanceThresholds.responseTime, true)}`}>
                  {liveMetrics.responseTime.toFixed(2)}s
                </div>
                <div className="text-sm text-muted-foreground">Temps de réponse</div>
              </div>
              <div className="flex items-center gap-1">
                {getMetricTrend(liveMetrics.responseTime, performanceThresholds.responseTime, true)}
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getMetricColor(liveMetrics.satisfactionScore, performanceThresholds.satisfaction)}`}>
                  {liveMetrics.satisfactionScore.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
              <div className="flex items-center gap-1">
                {getMetricTrend(liveMetrics.satisfactionScore, performanceThresholds.satisfaction)}
                <Heart className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getMetricColor(liveMetrics.errorRate, performanceThresholds.errorRate, true)}`}>
                  {liveMetrics.errorRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Taux d'erreur</div>
              </div>
              <div className="flex items-center gap-1">
                {getMetricTrend(liveMetrics.errorRate, performanceThresholds.errorRate, true)}
                <Shield className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Core Web Vitals - Temps Réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-semibold">LCP</div>
                <div className="text-sm text-muted-foreground">Largest Contentful Paint</div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${liveMetrics.coreWebVitals.lcp <= 1.2 ? 'text-success' : 'text-warning'}`}>
                  {liveMetrics.coreWebVitals.lcp.toFixed(2)}s
                </div>
                <div className="text-xs text-muted-foreground">Cible: &lt;1.2s</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-semibold">FID</div>
                <div className="text-sm text-muted-foreground">First Input Delay</div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${liveMetrics.coreWebVitals.fid <= 100 ? 'text-success' : 'text-warning'}`}>
                  {liveMetrics.coreWebVitals.fid}ms
                </div>
                <div className="text-xs text-muted-foreground">Cible: &lt;100ms</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-semibold">CLS</div>
                <div className="text-sm text-muted-foreground">Cumulative Layout Shift</div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${liveMetrics.coreWebVitals.cls <= 0.1 ? 'text-success' : 'text-warning'}`}>
                  {liveMetrics.coreWebVitals.cls.toFixed(3)}
                </div>
                <div className="text-xs text-muted-foreground">Cible: &lt;0.1</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes UX */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertes UX ({unreadAlerts} non résolues)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => (
                <Alert key={alert.id} className={alert.resolved ? 'opacity-50' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.type)}
                      <div>
                        <div className="font-medium">{alert.title}</div>
                        <AlertDescription className="mt-1">
                          {alert.message}
                        </AlertDescription>
                        <div className="text-xs text-muted-foreground mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Résoudre
                      </Button>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="justify-start">
              <Zap className="h-4 w-4 mr-2" />
              Optimiser Cache
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Vider Cache
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Activity className="h-4 w-4 mr-2" />
              Test Performance
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Eye className="h-4 w-4 mr-2" />
              Audit UX
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};