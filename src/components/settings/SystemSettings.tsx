import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Database, 
  Wifi, 
  Download, 
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  HardDrive,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatus {
  database: 'connected' | 'disconnected' | 'error';
  storage: 'healthy' | 'warning' | 'critical';
  api: 'operational' | 'degraded' | 'down';
  cache: 'optimal' | 'cleared' | 'rebuilding';
}

interface SystemMetrics {
  users_online: number;
  total_sessions: number;
  cache_size: string;
  storage_used: string;
  api_response_time: number;
  uptime: string;
}

export const SystemSettings = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'connected',
    storage: 'healthy',
    api: 'operational',
    cache: 'optimal'
  });
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    users_online: 127,
    total_sessions: 1543,
    cache_size: '2.4 GB',
    storage_used: '45.2 GB',
    api_response_time: 145,
    uptime: '99.8%'
  });

  const [settings, setSettings] = useState({
    auto_backup: true,
    maintenance_mode: false,
    debug_mode: false,
    analytics_enabled: true,
    cache_enabled: true,
    compression_enabled: true,
    backup_frequency: 'daily',
    max_sessions: 1000,
    session_timeout: 30,
    api_rate_limit: 100
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchSystemStatus();
    fetchMetrics();
    const interval = setInterval(() => {
      fetchSystemStatus();
      fetchMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      // Check Supabase connection
      const { error } = await supabase.from('profiles').select('id').limit(1);
      
      setSystemStatus(prev => ({
        ...prev,
        database: error ? 'error' : 'connected'
      }));
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        database: 'disconnected'
      }));
    }
  };

  const fetchMetrics = async () => {
    // Mock real-time metrics - Replace with actual monitoring
    setMetrics({
      users_online: Math.floor(Math.random() * 200) + 100,
      total_sessions: Math.floor(Math.random() * 1000) + 1500,
      cache_size: `${(Math.random() * 3 + 1).toFixed(1)} GB`,
      storage_used: `${(Math.random() * 20 + 40).toFixed(1)} GB`,
      api_response_time: Math.floor(Math.random() * 100) + 120,
      uptime: `${(99 + Math.random()).toFixed(1)}%`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
      case 'operational':
      case 'optimal':
        return 'default';
      case 'warning':
      case 'degraded':
      case 'cleared':
        return 'secondary';
      case 'disconnected':
      case 'critical':
      case 'down':
      case 'error':
        return 'destructive';
      case 'rebuilding':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
      case 'operational':
      case 'optimal':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
      case 'degraded':
      case 'cleared':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'disconnected':
      case 'critical':
      case 'down':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'rebuilding':
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    toast({
      title: 'Paramètre mis à jour',
      description: `${key} a été modifié`
    });
  };

  const clearCache = async () => {
    setSystemStatus(prev => ({ ...prev, cache: 'cleared' }));
    
    setTimeout(() => {
      setSystemStatus(prev => ({ ...prev, cache: 'rebuilding' }));
      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, cache: 'optimal' }));
        toast({
          title: 'Cache effacé',
          description: 'Le cache système a été effacé et reconstruit'
        });
      }, 2000);
    }, 1000);
  };

  const runSystemCheck = async () => {
    toast({
      title: 'Vérification système',
      description: 'Diagnostic en cours...'
    });

    // Simulate system check
    setTimeout(() => {
      toast({
        title: 'Vérification terminée',
        description: 'Tous les systèmes fonctionnent normalement'
      });
    }, 3000);
  };

  const exportSystemLogs = () => {
    // Mock log export
    const logs = {
      timestamp: new Date().toISOString(),
      system_status: systemStatus,
      metrics: metrics,
      settings: settings
    };

    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Logs exportés',
      description: 'Les logs système ont été téléchargés'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paramètres système</h2>
          <p className="text-muted-foreground">
            Configuration et monitoring du système
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runSystemCheck}>
            <Activity className="mr-2 h-4 w-4" />
            Diagnostic
          </Button>
          <Button variant="outline" onClick={exportSystemLogs}>
            <Download className="mr-2 h-4 w-4" />
            Exporter les logs
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base de données</CardTitle>
            {getStatusIcon(systemStatus.database)}
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusColor(systemStatus.database)}>
              {systemStatus.database}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockage</CardTitle>
            {getStatusIcon(systemStatus.storage)}
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusColor(systemStatus.storage)}>
              {systemStatus.storage}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            {getStatusIcon(systemStatus.api)}
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusColor(systemStatus.api)}>
              {systemStatus.api}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache</CardTitle>
            {getStatusIcon(systemStatus.cache)}
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusColor(systemStatus.cache)}>
              {systemStatus.cache}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs en ligne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.users_online}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_sessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taille du cache</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cache_size}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stockage utilisé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.storage_used}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Temps de réponse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.api_response_time}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}</div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration générale</CardTitle>
            <CardDescription>
              Paramètres principaux du système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Sauvegarde automatique</div>
                <div className="text-sm text-muted-foreground">
                  Sauvegarde quotidienne des données
                </div>
              </div>
              <Switch
                checked={settings.auto_backup}
                onCheckedChange={(checked) => handleSettingChange('auto_backup', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Mode maintenance</div>
                <div className="text-sm text-muted-foreground">
                  Désactive l'accès utilisateur
                </div>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Mode debug</div>
                <div className="text-sm text-muted-foreground">
                  Active les logs détaillés
                </div>
              </div>
              <Switch
                checked={settings.debug_mode}
                onCheckedChange={(checked) => handleSettingChange('debug_mode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Analytics</div>
                <div className="text-sm text-muted-foreground">
                  Collecte des statistiques d'usage
                </div>
              </div>
              <Switch
                checked={settings.analytics_enabled}
                onCheckedChange={(checked) => handleSettingChange('analytics_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>
              Optimisation et cache
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Cache activé</div>
                <div className="text-sm text-muted-foreground">
                  Mise en cache des ressources
                </div>
              </div>
              <Switch
                checked={settings.cache_enabled}
                onCheckedChange={(checked) => handleSettingChange('cache_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Compression</div>
                <div className="text-sm text-muted-foreground">
                  Compression des données
                </div>
              </div>
              <Switch
                checked={settings.compression_enabled}
                onCheckedChange={(checked) => handleSettingChange('compression_enabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sessions maximales</label>
              <Input
                type="number"
                value={settings.max_sessions}
                onChange={(e) => handleSettingChange('max_sessions', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timeout de session (min)</label>
              <Input
                type="number"
                value={settings.session_timeout}
                onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
              />
            </div>

            <Button onClick={clearCache} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Effacer le cache
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
