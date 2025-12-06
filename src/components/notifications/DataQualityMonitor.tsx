import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingDown,
  TrendingUp,
  Eye,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { RobustErrorDisplay } from '@/components/common/RobustErrorDisplay';
import { useSystemAlerts } from '@/hooks/useSystemAlerts';
import { toast } from 'sonner';

interface DataQualityIssue {
  id: string;
  type: 'missing_field' | 'invalid_format' | 'corrupted_data' | 'duplicate' | 'constraint_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  table: string;
  field?: string;
  record_id?: string;
  description: string;
  count: number;
  sample_values?: string[];
  suggested_fix?: string;
  detected_at: string;
  status: 'new' | 'investigating' | 'fixing' | 'resolved' | 'ignored';
}

interface DataQualityMetrics {
  overall_score: number;
  completeness: number;
  validity: number;
  consistency: number;
  accuracy: number;
  total_records: number;
  issues_count: number;
  critical_issues: number;
  trend_7d: number;
}

interface TableHealth {
  table_name: string;
  quality_score: number;
  record_count: number;
  issues_count: number;
  last_check: string;
  status: 'healthy' | 'warning' | 'critical';
}

export function DataQualityMonitor() {
  const [metrics, setMetrics] = useState<DataQualityMetrics | null>(null);
  const [issues, setIssues] = useState<DataQualityIssue[]>([]);
  const [tableHealth, setTableHealth] = useState<TableHealth[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { alertDataCorruption, alertPerformanceDegradation } = useSystemAlerts();

  useEffect(() => {
    fetchDataQuality();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchDataQuality, 60000); // 1 minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchDataQuality = async () => {
    try {
      setLoading(true);

      // Simuler des données de qualité
      const mockMetrics: DataQualityMetrics = {
        overall_score: 87.5,
        completeness: 92.3,
        validity: 89.1,
        consistency: 85.7,
        accuracy: 83.2,
        total_records: 15420,
        issues_count: 47,
        critical_issues: 3,
        trend_7d: -2.1 // Amélioration
      };

      const mockIssues: DataQualityIssue[] = [
        {
          id: 'issue-1',
          type: 'corrupted_data',
          severity: 'critical',
          table: 'edn_items_immersive',
          field: 'tableau_rang_a',
          description: 'Données JSON corrompues détectées',
          count: 12,
          sample_values: ['"{broken": json}', 'null', 'undefined'],
          suggested_fix: 'Régénérer les données depuis la source OIC',
          detected_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'new'
        },
        {
          id: 'issue-2',
          type: 'missing_field',
          severity: 'high',
          table: 'med_mng_subscriptions',
          field: 'credits_left',
          description: 'Crédits manquants pour certains utilisateurs',
          count: 8,
          suggested_fix: 'Initialiser les crédits selon le plan',
          detected_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'investigating'
        },
        {
          id: 'issue-3',
          type: 'duplicate',
          severity: 'medium',
          table: 'oic_competences',
          field: 'objectif_id',
          description: 'Doublons d\'objectifs détectés',
          count: 15,
          suggested_fix: 'Fusionner les doublons en gardant la version la plus récente',
          detected_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'fixing'
        },
        {
          id: 'issue-4',
          type: 'invalid_format',
          severity: 'low',
          table: 'extraction_logs',
          field: 'started_at',
          description: 'Format de date invalide',
          count: 3,
          suggested_fix: 'Convertir au format ISO 8601',
          detected_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'resolved'
        }
      ];

      const mockTableHealth: TableHealth[] = [
        {
          table_name: 'edn_items_immersive',
          quality_score: 78.5,
          record_count: 4200,
          issues_count: 15,
          last_check: new Date().toISOString(),
          status: 'warning'
        },
        {
          table_name: 'oic_competences',
          quality_score: 92.1,
          record_count: 8500,
          issues_count: 3,
          last_check: new Date().toISOString(),
          status: 'healthy'
        },
        {
          table_name: 'med_mng_subscriptions',
          quality_score: 95.7,
          record_count: 145,
          issues_count: 1,
          last_check: new Date().toISOString(),
          status: 'healthy'
        },
        {
          table_name: 'extraction_logs',
          quality_score: 65.3,
          record_count: 1200,
          issues_count: 28,
          last_check: new Date().toISOString(),
          status: 'critical'
        }
      ];

      setMetrics(mockMetrics);
      setIssues(mockIssues);
      setTableHealth(mockTableHealth);

      // Alertes automatiques
      const criticalIssues = mockIssues.filter(issue => 
        issue.severity === 'critical' && issue.status === 'new'
      );

      criticalIssues.forEach(issue => {
        alertDataCorruption(issue.table, issue.count, {
          type: issue.type,
          field: issue.field,
          description: issue.description
        });
      });

      // Alerte dégradation globale
      if (mockMetrics.overall_score < 80) {
        alertPerformanceDegradation(
          'Data Quality Score',
          mockMetrics.overall_score,
          80
        );
      }

    } catch (error) {
      console.error('Erreur fetch data quality:', error);
      toast.error('Erreur lors du chargement des métriques de qualité');
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId: string, status: DataQualityIssue['status']) => {
    try {
      setIssues(prev => prev.map(issue =>
        issue.id === issueId ? { ...issue, status } : issue
      ));
      toast.success(`Statut mis à jour: ${status}`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const generateReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      issues: issues.filter(issue => issue.status !== 'resolved'),
      table_health: tableHealth,
      summary: {
        total_issues: issues.length,
        critical_issues: issues.filter(i => i.severity === 'critical').length,
        tables_affected: [...new Set(issues.map(i => i.table))].length
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-quality-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Rapport de qualité généré');
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'corrupted_data': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'missing_field': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'invalid_format': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'duplicate': return <AlertTriangle className="h-4 w-4 text-primary" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-destructive bg-destructive/5';
      case 'high': return 'border-warning bg-warning/5';
      case 'medium': return 'border-warning bg-warning/5';
      case 'low': return 'border-primary bg-primary/5';
      default: return 'border-border bg-muted';
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
    if (selectedTable !== 'all' && issue.table !== selectedTable) return false;
    return true;
  });

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement de la qualité des données...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Qualité des Données</h1>
          <p className="text-muted-foreground">
            Surveillance temps réel de l'intégrité et de la qualité des données
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDataQuality} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Rapport
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className={`text-center ${metrics.overall_score < 80 ? 'border-red-500' : ''}`}>
            <CardContent className="p-4">
              <div className="text-3xl font-bold">
                {metrics.overall_score.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Score Global</div>
              <div className="flex items-center justify-center mt-2">
                {metrics.trend_7d < 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs ml-1">
                  {Math.abs(metrics.trend_7d)}% (7j)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {metrics.completeness.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Complétude</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.validity.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Validité</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {metrics.consistency.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Cohérence</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {metrics.accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Précision</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertes critiques */}
      {metrics && metrics.critical_issues > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium text-red-800">
              {metrics.critical_issues} problème(s) critique(s) de qualité détecté(s)
            </span>
            <span className="text-red-700 ml-2">
              - Action immédiate requise pour éviter la corruption de données
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Santé des tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Santé des Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tableHealth.map(table => (
              <div key={table.table_name} className="p-3 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{table.table_name}</span>
                  <Badge variant={table.status === 'healthy' ? 'default' : 'destructive'}>
                    {table.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className={`font-medium ${getTableStatusColor(table.status)}`}>
                      {table.quality_score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enregistrements:</span>
                    <span>{table.record_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Problèmes:</span>
                    <span className={table.issues_count > 0 ? 'text-destructive' : 'text-success'}>
                      {table.issues_count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Problèmes de Qualité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Toutes les sévérités</option>
              <option value="critical">Critique</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>

            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Toutes les tables</option>
              {[...new Set(issues.map(i => i.table))].map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </div>

          {/* Liste des problèmes */}
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                <p>Aucun problème de qualité détecté</p>
              </div>
            ) : (
              filteredIssues.map(issue => (
                <Card key={issue.id} className={`border-l-4 ${getSeverityColor(issue.severity)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getIssueIcon(issue.type)}
                        <div>
                          <CardTitle className="text-lg">{issue.description}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{issue.table}</Badge>
                            {issue.field && <Badge variant="secondary">{issue.field}</Badge>}
                            <Badge variant={
                              issue.severity === 'critical' ? 'destructive' : 'default'
                            }>
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline">{issue.count} occurences</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          issue.status === 'resolved' ? 'default' : 'secondary'
                        }>
                          {issue.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {issue.suggested_fix && (
                      <div className="mb-3 p-2 bg-blue-50 rounded border">
                        <span className="text-sm font-medium">Correction suggérée: </span>
                        <span className="text-sm">{issue.suggested_fix}</span>
                      </div>
                    )}

                    {issue.sample_values && (
                      <div className="mb-3">
                        <span className="text-sm font-medium">Exemples de valeurs: </span>
                        <div className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">
                          {issue.sample_values.join(', ')}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Détecté: {new Date(issue.detected_at).toLocaleString()}
                      </span>
                      
                      {issue.status !== 'resolved' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateIssueStatus(issue.id, 'investigating')}
                          >
                            Investiguer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateIssueStatus(issue.id, 'fixing')}
                          >
                            Corriger
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => updateIssueStatus(issue.id, 'resolved')}
                          >
                            Résolu
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}