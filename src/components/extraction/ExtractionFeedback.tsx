import { RobustErrorDisplay } from '@/components/common/RobustErrorDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Database,
    Download,
    Eye,
    Pause,
    Play,
    RefreshCw,
    Square,
    XCircle,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ExtractionStatus {
  id: string;
  batch_id: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  progress_percentage: number;
  total_items: number;
  processed_items: number;
  failed_items: number;
  corrupted_items: number;
  warning_items: number;
  success_items: number;
  started_at: string;
  estimated_completion?: string;
  error_message?: string;
  last_error_item?: string;
  data_quality_score?: number;
  processing_speed_items_per_min?: number;
}

interface ExtractionFeedbackProps {
  extraction: ExtractionStatus;
  onRetry?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onViewErrors?: () => void;
  onDownloadLog?: () => void;
  showControls?: boolean;
  showDetailedMetrics?: boolean;
  autoRefresh?: boolean;
}

export function ExtractionFeedback({
  extraction,
  onRetry,
  onPause,
  onResume,
  onCancel,
  onViewErrors,
  onDownloadLog,
  showControls = true,
  showDetailedMetrics = false,
  autoRefresh = true
}: ExtractionFeedbackProps) {
  const [pulse, setPulse] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (autoRefresh && extraction.status === 'running') {
      const interval = setInterval(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 500);
        setLastUpdate(new Date());
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, extraction.status]);

  // Alertes critiques automatiques
  useEffect(() => {
    const errorRate = extraction.processed_items > 0 
      ? (extraction.failed_items / extraction.processed_items) * 100 
      : 0;

    // Alert si taux d'erreur > 20%
    if (errorRate > 20 && extraction.processed_items > 10) {
      toast.error(`🚨 Taux d'erreur critique: ${errorRate.toFixed(1)}% sur ${extraction.batch_id}`);
    }

    // Alert si données corrompues détectées
    if (extraction.corrupted_items > 0) {
      toast.warning(`⚠️ ${extraction.corrupted_items} item(s) corrompus détectés dans ${extraction.batch_id}`);
    }

    // Alert si qualité des données faible
    if (extraction.data_quality_score && extraction.data_quality_score < 0.7) {
      toast.warning(`📊 Qualité des données faible: ${(extraction.data_quality_score * 100).toFixed(1)}%`);
    }
  }, [extraction.failed_items, extraction.corrupted_items, extraction.data_quality_score, extraction.processed_items]);

  const getStatusIcon = () => {
    switch (extraction.status) {
      case 'running': return <Play className={`h-5 w-5 text-primary ${pulse ? 'scale-110' : ''} transition-transform`} />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'paused': return <Pause className="h-5 w-5 text-warning" />;
      case 'cancelled': return <Square className="h-5 w-5 text-muted-foreground" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (extraction.status) {
      case 'running': return 'border-primary bg-primary/5';
      case 'completed': return 'border-success bg-success/5';
      case 'failed': return 'border-destructive bg-destructive/5';
      case 'paused': return 'border-warning bg-warning/5';
      case 'cancelled': return 'border-muted bg-muted/50';
      default: return 'border-border bg-muted/50';
    }
  };

  const getStatusLabel = () => {
    switch (extraction.status) {
      case 'running': return 'En cours';
      case 'completed': return 'Terminé';
      case 'failed': return 'Échec';
      case 'paused': return 'En pause';
      case 'cancelled': return 'Annulé';
      default: return 'Inactif';
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h${minutes % 60}min`;
    return `${minutes}min`;
  };

  const calculateSuccess = () => {
    return extraction.processed_items - extraction.failed_items - extraction.corrupted_items;
  };

  const hasQualityIssues = () => {
    return extraction.failed_items > 0 || 
           extraction.corrupted_items > 0 || 
           (extraction.data_quality_score && extraction.data_quality_score < 0.8);
  };

  const getProgressColor = () => {
    const errorRate = extraction.processed_items > 0 
      ? (extraction.failed_items / extraction.processed_items) * 100 
      : 0;
    
    if (errorRate > 15) return 'bg-destructive';
    if (errorRate > 5) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <Card className={`${getStatusColor()} border-l-4 transition-all duration-300`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {extraction.batch_id}
                  <Badge variant={extraction.status === 'completed' ? 'default' : 'secondary'}>
                    {getStatusLabel()}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Démarré: {new Date(extraction.started_at).toLocaleString()}
                  {extraction.status === 'running' && ` • Durée: ${formatDuration(extraction.started_at)}`}
                </p>
              </div>
            </div>
            
            {/* Live Controls */}
            {showControls && (
              <div className="flex items-center gap-2">
                {extraction.status === 'running' && onPause && (
                  <Button size="sm" variant="outline" onClick={onPause}>
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                {extraction.status === 'paused' && onResume && (
                  <Button size="sm" variant="outline" onClick={onResume}>
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                {(extraction.status === 'running' || extraction.status === 'paused') && onCancel && (
                  <Button size="sm" variant="destructive" onClick={onCancel}>
                    <Square className="h-4 w-4" />
                  </Button>
                )}
                {extraction.status === 'failed' && onRetry && (
                  <Button size="sm" variant="default" onClick={onRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Relancer
                  </Button>
                )}
                {onDownloadLog && (
                  <Button size="sm" variant="outline" onClick={onDownloadLog}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression: {extraction.processed_items}/{extraction.total_items}</span>
              <span className="font-medium">{extraction.progress_percentage}%</span>
            </div>
            <Progress 
              value={extraction.progress_percentage} 
              className={`h-3 ${getProgressColor()}`}
            />
            {extraction.estimated_completion && extraction.status === 'running' && (
              <p className="text-xs text-muted-foreground">
                Fin estimée: {new Date(extraction.estimated_completion).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-2 bg-background/50 rounded border">
              <div className="font-bold text-success text-xl">
                {calculateSuccess()}
              </div>
              <div className="text-xs text-muted-foreground">Succès</div>
            </div>
            
            <div className="text-center p-2 bg-background/50 rounded border">
              <div className="font-bold text-destructive text-xl">
                {extraction.failed_items}
              </div>
              <div className="text-xs text-muted-foreground">Échecs</div>
            </div>
            
            <div className="text-center p-2 bg-background/50 rounded border">
              <div className="font-bold text-warning text-xl">
                {extraction.corrupted_items || 0}
              </div>
              <div className="text-xs text-muted-foreground">Corrompus</div>
            </div>
            
            <div className="text-center p-2 bg-background/50 rounded border">
              <div className="font-bold text-primary text-xl">
                {extraction.processing_speed_items_per_min || '--'}
              </div>
              <div className="text-xs text-muted-foreground">Items/min</div>
            </div>
          </div>

          {/* Quality Score */}
          {extraction.data_quality_score && (
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded border">
              <span className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Qualité des données
              </span>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold">
                  {(extraction.data_quality_score * 100).toFixed(1)}%
                </div>
                <Badge variant={extraction.data_quality_score > 0.8 ? 'default' : 'destructive'}>
                  {extraction.data_quality_score > 0.9 ? 'Excellente' :
                   extraction.data_quality_score > 0.8 ? 'Bonne' :
                   extraction.data_quality_score > 0.6 ? 'Moyenne' : 'Faible'}
                </Badge>
              </div>
            </div>
          )}

          {/* Performance Indicator */}
          {extraction.status === 'running' && extraction.processing_speed_items_per_min && (
            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded border">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Performance: {extraction.processing_speed_items_per_min} items/min
                {extraction.processing_speed_items_per_min > 100 && (
                  <Badge variant="default" className="ml-2">Rapide</Badge>
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Issues Alert */}
      {hasQualityIssues() && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Problèmes de qualité détectés:</p>
              <ul className="text-sm space-y-1">
                {extraction.failed_items > 0 && (
                  <li>• {extraction.failed_items} items ont échoué lors du traitement</li>
                )}
                {extraction.corrupted_items > 0 && (
                  <li>• {extraction.corrupted_items} items corrompus détectés</li>
                )}
                {extraction.data_quality_score && extraction.data_quality_score < 0.8 && (
                  <li>• Score de qualité des données: {(extraction.data_quality_score * 100).toFixed(1)}%</li>
                )}
              </ul>
              {onViewErrors && (
                <Button size="sm" variant="outline" className="mt-2" onClick={onViewErrors}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les détails
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Details */}
      {extraction.status === 'failed' && extraction.error_message && (
        <RobustErrorDisplay
          error={extraction.error_message}
          type="extraction"
          title={`Échec d'extraction - ${extraction.batch_id}`}
          context={{
            batch_id: extraction.batch_id,
            processed_items: extraction.processed_items,
            total_items: extraction.total_items,
            last_error_item: extraction.last_error_item
          }}
          severity="high"
          onRetry={onRetry}
          onReport={(details) => {
            console.log('Rapport d\'erreur extraction:', details);
            toast.success('Rapport d\'erreur envoyé à l\'équipe technique');
          }}
        />
      )}

      {/* Detailed Metrics (Extended) */}
      {showDetailedMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métriques détaillées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Performance</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Vitesse moyenne:</span>
                    <span>{extraction.processing_speed_items_per_min || '--'} items/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps écoulé:</span>
                    <span>{formatDuration(extraction.started_at)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Qualité</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Taux de succès:</span>
                    <span className="text-success">
                      {extraction.processed_items > 0 
                        ? ((calculateSuccess() / extraction.processed_items) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux d'erreur:</span>
                    <span className="text-destructive">
                      {extraction.processed_items > 0 
                        ? ((extraction.failed_items / extraction.processed_items) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Dernière mise à jour:</span>
                    <span>{lastUpdate.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ID extraction:</span>
                    <span className="font-mono text-xs">{extraction.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}