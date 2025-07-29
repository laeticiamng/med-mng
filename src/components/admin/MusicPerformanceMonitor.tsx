import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Music, TrendingUp, TrendingDown } from 'lucide-react';

interface MusicPerformanceMonitorProps {
  className?: string;
}

interface PerformanceStats {
  overview: {
    totalTracks: number;
    recent24h: number;
    successRate: number;
    failureRate: number;
    avgGenerationTime: number;
  };
  performance: {
    completed: number;
    failed: number;
    pending: number;
    slowGenerations: number;
    generationTimes: {
      min: number;
      max: number;
      avg: number;
      p95: number;
    };
  };
  alerts: Array<{
    type: string;
    severity: 'warning' | 'critical';
    message: string;
    value: number;
    threshold: number;
  }>;
  health: {
    status: 'healthy' | 'warning' | 'critical';
    timestamp: string;
  };
}

export const MusicPerformanceMonitor: React.FC<MusicPerformanceMonitorProps> = ({ className }) => {
  const [stats, setStats] = React.useState<PerformanceStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchPerformanceStats();
    // Actualiser toutes les minutes
    const interval = setInterval(fetchPerformanceStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/music-performance-monitor');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    return severity === 'critical' ? 'destructive' : 'secondary';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Chargement des statistiques...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Statut général */}
      <Card className={`border-2 ${getHealthColor(stats.health.status)}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {stats.health.status === 'healthy' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            Statut Système Musical
            <Badge variant={stats.health.status === 'healthy' ? 'default' : 'destructive'}>
              {stats.health.status === 'healthy' ? 'Opérationnel' : 
               stats.health.status === 'warning' ? 'Attention' : 'Critique'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.overview.recent24h}</div>
              <div className="text-sm text-muted-foreground">Générations 24h</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-bold">{stats.overview.successRate}%</span>
                {stats.overview.successRate >= 95 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">Taux de succès</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(stats.overview.avgGenerationTime)}</div>
              <div className="text-sm text-muted-foreground">Temps moyen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.performance.pending}</div>
              <div className="text-sm text-muted-foreground">En attente</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes */}
      {stats.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertes Actives ({stats.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                  alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{alert.message}</span>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity === 'critical' ? 'Critique' : 'Attention'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Valeur: {alert.value} | Seuil: {alert.threshold}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Métriques détaillées */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Performance 24h
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Générations complétées</span>
                <span className="font-medium">{stats.performance.completed}</span>
              </div>
              <Progress value={(stats.performance.completed / (stats.performance.completed + stats.performance.failed + stats.performance.pending)) * 100} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taux de succès</span>
                <span className="font-medium">{stats.overview.successRate}%</span>
              </div>
              <Progress value={stats.overview.successRate} />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{stats.performance.completed}</div>
                <div className="text-xs text-muted-foreground">Réussies</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{stats.performance.failed}</div>
                <div className="text-xs text-muted-foreground">Échouées</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{stats.performance.pending}</div>
                <div className="text-xs text-muted-foreground">En cours</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Temps de Génération
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Minimum</div>
                <div className="text-lg font-bold">{formatTime(stats.performance.generationTimes.min)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Maximum</div>
                <div className="text-lg font-bold">{formatTime(stats.performance.generationTimes.max)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Moyenne</div>
                <div className="text-lg font-bold">{formatTime(stats.performance.generationTimes.avg)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">95e percentile</div>
                <div className="text-lg font-bold">{formatTime(stats.performance.generationTimes.p95)}</div>
              </div>
            </div>

            {stats.performance.slowGenerations > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm font-medium text-yellow-800">
                  ⚠️ {stats.performance.slowGenerations} générations lentes détectées
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  Générations dépassant 2 minutes
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Dernière mise à jour: {new Date(stats.health.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};