import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, Play, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useItemsCompleteness } from '@/hooks/useItemsCompleteness';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ItemsCompletenessOverview: React.FC = () => {
  const {
    isLoading,
    reports,
    alerts,
    currentReport,
    runAutomatedAudit,
    loadReports,
    loadAlerts,
    resolveAlert,
  } = useItemsCompleteness();

  const [selectedSeverity, setSelectedSeverity] = useState<string>('');

  useEffect(() => {
    loadReports();
    loadAlerts(false); // Charger les alertes non résolues
  }, [loadReports, loadAlerts]);

  const handleRunAudit = async () => {
    await runAutomatedAudit();
  };

  const handleResolveAlert = async (alertId: string) => {
    await resolveAlert(alertId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'incomplete': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Complétude des Items</h2>
          <p className="text-muted-foreground">
            Monitoring automatisé de la complétude des items EDN
          </p>
        </div>
        <Button 
          onClick={handleRunAudit} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          {isLoading ? 'Audit en cours...' : 'Lancer un audit'}
        </Button>
      </div>

      {/* Métriques principales */}
      {currentReport && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentReport.summary.total_items}</div>
              <p className="text-xs text-muted-foreground">
                Items dans la plateforme
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Complétude</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentReport.summary.completion_rate.toFixed(1)}%
              </div>
              <Progress 
                value={currentReport.summary.completion_rate} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problèmes Critiques</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {currentReport.summary.critical_issues}
              </div>
              <p className="text-xs text-muted-foreground">
                Items avec score &lt; 50%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentReport.summary.average_completeness.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Sur 100 points max
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Alertes actives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alertes Actives ({unresolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unresolvedAlerts.slice(0, 8).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {alert.item_code}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatDistanceToNow(new Date(alert.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveAlert(alert.id)}
                  >
                    Résoudre
                  </Button>
                </div>
              ))}
              
              {unresolvedAlerts.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  Aucune alerte active
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Derniers rapports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Historique des Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.slice(0, 6).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {report.audit_type}
                      </Badge>
                      <span className="text-sm font-medium">
                        {report.summary.completion_rate.toFixed(1)}% complétude
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {report.summary.total_items} items • {report.summary.critical_issues} critiques
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatDistanceToNow(new Date(report.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.summary.critical_issues > 0 && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div className={`w-3 h-3 rounded-full ${
                      report.summary.completion_rate >= 80 
                        ? 'bg-green-500' 
                        : report.summary.completion_rate >= 60 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  Aucun audit effectué
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items avec problèmes (si rapport disponible) */}
      {currentReport && currentReport.results && (
        <Card>
          <CardHeader>
            <CardTitle>Items avec Problèmes de Complétude</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {currentReport.results
                .filter(item => item.status !== 'complete')
                .slice(0, 10)
                .map((item) => (
                  <div key={item.item_code} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                      <code className="text-sm font-mono">{item.item_code}</code>
                      <span className="text-sm">{item.completeness_score}%</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!item.tableau_a_present && (
                        <Badge variant="outline" className="text-xs">Tableau A</Badge>
                      )}
                      {!item.tableau_b_present && (
                        <Badge variant="outline" className="text-xs">Tableau B</Badge>
                      )}
                      {!item.quiz_present && (
                        <Badge variant="outline" className="text-xs">Quiz</Badge>
                      )}
                      
                      <Badge variant={item.status === 'critical' ? 'destructive' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};