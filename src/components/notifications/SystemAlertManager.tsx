import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Bell, 
  BellOff,
  Volume2,
  VolumeX,
  Clock,
  Database,
  Users,
  Activity,
  Zap,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'extraction' | 'quota' | 'data' | 'auth' | 'performance' | 'security';
  title: string;
  message: string;
  source: string;
  context?: Record<string, any>;
  timestamp: string;
  acknowledged: boolean;
  auto_resolve: boolean;
  escalation_level: number;
}

interface AlertRule {
  id: string;
  name: string;
  category: string;
  condition: string;
  enabled: boolean;
  threshold: number;
  notification_channels: string[];
}

interface SystemHealth {
  extraction_failure_rate: number;
  data_corruption_incidents: number;
  quota_violations: number;
  auth_failures: number;
  performance_degradation: boolean;
  security_alerts: number;
}

export function SystemAlertManager() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'system_alert_manager', action: 'view' }
    });
  }, []);

  // Fetch alerts and system health
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simuler des données temps réel
      const mockAlerts: SystemAlert[] = [
        {
          id: 'alert-1',
          type: 'critical',
          category: 'extraction',
          title: 'Taux d\'échec d\'extraction élevé',
          message: 'Le batch EDN-20250126-003 présente un taux d\'échec de 25%',
          source: 'extraction-monitor',
          context: { batch_id: 'EDN-20250126-003', failure_rate: 0.25 },
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          acknowledged: false,
          auto_resolve: false,
          escalation_level: 2
        },
        {
          id: 'alert-2',
          type: 'warning',
          category: 'quota',
          title: 'Quota utilisateur critique',
          message: '3 utilisateurs ont dépassé 90% de leur quota mensuel',
          source: 'quota-monitor',
          context: { critical_users: 3, threshold: 0.9 },
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          acknowledged: false,
          auto_resolve: true,
          escalation_level: 1
        },
        {
          id: 'alert-3',
          type: 'warning',
          category: 'data',
          title: 'Données corrompues détectées',
          message: '12 items corrompus détectés lors de l\'import OIC',
          source: 'data-integrity',
          context: { corrupted_items: 12, source_table: 'oic_competences' },
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          acknowledged: true,
          auto_resolve: false,
          escalation_level: 1
        },
        {
          id: 'alert-4',
          type: 'info',
          category: 'performance',
          title: 'Performance optimale',
          message: 'Tous les systèmes fonctionnent à vitesse nominale',
          source: 'performance-monitor',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          acknowledged: true,
          auto_resolve: true,
          escalation_level: 0
        }
      ];

      const mockHealth: SystemHealth = {
        extraction_failure_rate: 8.5,
        data_corruption_incidents: 2,
        quota_violations: 3,
        auth_failures: 0,
        performance_degradation: false,
        security_alerts: 0
      };

      const mockRules: AlertRule[] = [
        {
          id: 'rule-1',
          name: 'Extraction Failure Rate',
          category: 'extraction',
          condition: 'failure_rate > 15%',
          enabled: true,
          threshold: 15,
          notification_channels: ['toast', 'email', 'slack']
        },
        {
          id: 'rule-2',
          name: 'Data Corruption',
          category: 'data',
          condition: 'corrupted_items > 5',
          enabled: true,
          threshold: 5,
          notification_channels: ['toast', 'email']
        }
      ];

      setAlerts(mockAlerts);
      setHealth(mockHealth);
      setRules(mockRules);

      // Déclencher des notifications pour les nouvelles alertes critiques
      const newCriticalAlerts = mockAlerts.filter(
        alert => alert.type === 'critical' && !alert.acknowledged
      );

      newCriticalAlerts.forEach(alert => {
        showAlert(alert);
      });

    } catch (error) {
      console.error('Erreur fetch alerts:', error);
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // 30 secondes
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData]);

  // Notification système
  const showAlert = (alert: SystemAlert) => {
    const toastConfig = {
      duration: alert.type === 'critical' ? Infinity : 5000
    };

    switch (alert.type) {
      case 'critical':
        toast.error(`🚨 ${alert.title}: ${alert.message}`, toastConfig);
        break;
      case 'warning':
        toast.warning(`⚠️ ${alert.title}: ${alert.message}`, toastConfig);
        break;
      case 'info':
        toast.info(`ℹ️ ${alert.title}: ${alert.message}`, toastConfig);
        break;
      case 'success':
        toast.success(`✅ ${alert.title}: ${alert.message}`, toastConfig);
        break;
    }

    // Son notification si activé
    if (soundEnabled && (alert.type === 'critical' || alert.type === 'warning')) {
      playNotificationSound(alert.type);
    }
  };

  const playNotificationSound = (type: 'critical' | 'warning') => {
    try {
      const audio = new Audio();
      // Utiliser des fréquences différentes selon le type
      const oscillator = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = oscillator.createGain();
      
      oscillator.frequency.value = type === 'critical' ? 800 : 600;
      oscillator.connect(gainNode);
      gainNode.connect(oscillator.destination);
      
      gainNode.gain.setValueAtTime(0.1, oscillator.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, oscillator.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(oscillator.currentTime + 0.3);
    } catch (err) {
      console.log('Sound notification not available');
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      ));
      toast.success('Alerte acquittée');
    } catch (error) {
      toast.error('Erreur lors de l\'acquittement');
    }
  };

  const acknowledgeAllCritical = async () => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.type === 'critical' 
          ? { ...alert, acknowledged: true }
          : alert
      ));
      toast.success('Toutes les alertes critiques acquittées');
    } catch (error) {
      toast.error('Erreur lors de l\'acquittement global');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info': return <Clock className="h-5 w-5 text-primary" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'extraction': return <Download className="h-4 w-4" />;
      case 'quota': return <Users className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      case 'auth': return <Activity className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const filteredAlerts = criticalOnly 
    ? alerts.filter(alert => alert.type === 'critical')
    : alerts;

  const criticalCount = alerts.filter(alert => alert.type === 'critical' && !alert.acknowledged).length;
  const warningCount = alerts.filter(alert => alert.type === 'warning' && !alert.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestionnaire d'Alertes Système</h1>
          <p className="text-muted-foreground">
            Surveillance temps réel • {criticalCount} critiques • {warningCount} warnings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Sons:</label>
            <Switch 
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm">Auto-refresh:</label>
            <Switch 
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Critiques uniquement:</label>
            <Switch 
              checked={criticalOnly}
              onCheckedChange={setCriticalOnly}
            />
          </div>

          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      {health && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className={health.extraction_failure_rate > 10 ? 'border-destructive' : ''}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">
                {health.extraction_failure_rate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Échecs extraction</div>
            </CardContent>
          </Card>

          <Card className={health.data_corruption_incidents > 0 ? 'border-warning' : ''}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {health.data_corruption_incidents}
              </div>
              <div className="text-xs text-muted-foreground">Incidents corruption</div>
            </CardContent>
          </Card>

          <Card className={health.quota_violations > 0 ? 'border-warning' : ''}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {health.quota_violations}
              </div>
              <div className="text-xs text-muted-foreground">Violations quota</div>
            </CardContent>
          </Card>

          <Card className={health.auth_failures > 0 ? 'border-destructive' : ''}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {health.auth_failures}
              </div>
              <div className="text-xs text-muted-foreground">Échecs auth</div>
            </CardContent>
          </Card>

          <Card className={health.performance_degradation ? 'border-destructive' : ''}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {health.performance_degradation ? '❌' : '✅'}
              </div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </CardContent>
          </Card>

          <Card className={health.security_alerts > 0 ? 'border-destructive' : ''}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {health.security_alerts}
              </div>
              <div className="text-xs text-muted-foreground">Alertes sécurité</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions rapides */}
      {criticalCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {criticalCount} alerte(s) critique(s) nécessitent votre attention
              </span>
              <Button size="sm" onClick={acknowledgeAllCritical}>
                Acquitter toutes les critiques
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des alertes */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                <p className="text-lg font-medium">Aucune alerte active</p>
                <p className="text-sm">Tous les systèmes fonctionnent normalement</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`
              ${alert.type === 'critical' && !alert.acknowledged ? 'border-destructive bg-destructive/5' : ''}
              ${alert.type === 'warning' && !alert.acknowledged ? 'border-warning bg-warning/5' : ''}
              ${alert.acknowledged ? 'opacity-60' : ''}
              transition-all duration-200
            `}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(alert.category)}
                          <span className="ml-1">{alert.category}</span>
                        </Badge>
                        <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.type}
                        </Badge>
                        {alert.escalation_level > 0 && (
                          <Badge variant="destructive">
                            Escalade niveau {alert.escalation_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    {!alert.acknowledged && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acquitter
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm mb-3">{alert.message}</p>
                
                {alert.context && (
                  <div className="text-xs bg-muted/50 p-2 rounded border">
                    <span className="font-medium">Contexte: </span>
                    {JSON.stringify(alert.context, null, 2)}
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                  <span>Source: {alert.source}</span>
                  {alert.acknowledged && (
                    <span className="text-success">✓ Acquittée</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}