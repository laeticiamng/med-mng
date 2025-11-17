import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { PerformanceAlert } from '@shared/services/performanceAnalyticsService';

interface PerformanceAlertsPanelProps {
  alerts: PerformanceAlert[];
  onAcknowledgeAlert: (alertId: string) => Promise<void>;
  onResolveAlert: (alertId: string) => Promise<void>;
}

export const PerformanceAlertsPanel: React.FC<PerformanceAlertsPanelProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
}) => {
  const getSeverityColor = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getSeverityIcon = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatAlertType = (type: PerformanceAlert['alert_type']) => {
    switch (type) {
      case 'budget_exceeded':
        return 'Budget dépassé';
      case 'sla_breach':
        return 'Violation SLA';
      case 'performance_degradation':
        return 'Dégradation performance';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {getSeverityIcon(alert.severity)}
                <CardTitle className="text-lg">{alert.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {formatAlertType(alert.alert_type)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{alert.description}</p>
            
            {alert.metric_data && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Données de la métrique</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(alert.metric_data).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-mono">{value?.toString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {alert.created_at && (
                  <span>Créé le {new Date(alert.created_at).toLocaleString()}</span>
                )}
              </div>
              
              <div className="flex gap-2">
                {!alert.acknowledged && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert.id && onAcknowledgeAlert(alert.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Acquitter
                  </Button>
                )}
                
                {!alert.resolved && (
                  <Button
                    size="sm"
                    onClick={() => alert.id && onResolveAlert(alert.id)}
                  >
                    Résoudre
                  </Button>
                )}
                
                {alert.acknowledged && (
                  <Badge variant="secondary">Acquittée</Badge>
                )}
                
                {alert.resolved && (
                  <Badge className="bg-green-100 text-green-800">Résolue</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {alerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune alerte active</h3>
            <p className="text-muted-foreground">
              Toutes les métriques sont dans les limites acceptables.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};