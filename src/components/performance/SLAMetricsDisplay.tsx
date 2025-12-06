import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { SLAMetric } from '@/services/performanceAnalyticsService';

interface SLAMetricsDisplayProps {
  slas: SLAMetric[];
}

export const SLAMetricsDisplay: React.FC<SLAMetricsDisplayProps> = ({ slas }) => {
  const getStatusColor = (status: SLAMetric['status']) => {
    switch (status) {
      case 'met':
        return 'bg-success/10 text-success dark:bg-success/20 dark:text-success';
      case 'warning':
        return 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning';
      case 'breach':
        return 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive';
      default:
        return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary';
    }
  };

  const getStatusLabel = (status: SLAMetric['status']) => {
    switch (status) {
      case 'met':
        return 'Respecté';
      case 'warning':
        return 'Attention';
      case 'breach':
        return 'Violation';
      default:
        return 'En cours';
    }
  };

  const getProgressValue = (sla: SLAMetric) => {
    if (!sla.current_value) return 0;
    return Math.min((sla.current_value / sla.target_value) * 100, 100);
  };

  const formatValue = (metricName: string, value: number) => {
    switch (metricName) {
      case 'availability':
        return `${value.toFixed(2)}%`;
      case 'response_time':
        return `${Math.round(value)}ms`;
      case 'error_rate':
        return `${value.toFixed(2)}%`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {slas.map((sla) => (
        <Card key={sla.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{sla.service_name}</CardTitle>
              <Badge className={getStatusColor(sla.status)}>
                {getStatusLabel(sla.status)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground capitalize">
              {sla.metric_name.replace('_', ' ')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {sla.current_value ? formatValue(sla.metric_name, sla.current_value) : '--'}
              </span>
              <span className="text-sm text-muted-foreground">
                Cible: {formatValue(sla.metric_name, sla.target_value)}
              </span>
            </div>
            
            <Progress 
              value={getProgressValue(sla)}
              className="h-2"
            />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{sla.breach_count} violations</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>{sla.status === 'met' ? 'Stable' : 'Attention'}</span>
              </div>
            </div>
            
            {sla.last_calculated && (
              <div className="text-xs text-muted-foreground">
                Dernière mise à jour: {new Date(sla.last_calculated).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {slas.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun SLA configuré</h3>
            <p className="text-muted-foreground">
              Configurez des SLA pour surveiller la disponibilité et les performances de vos services.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};