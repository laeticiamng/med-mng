import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, Play, Wrench, Download, RefreshCw } from 'lucide-react';
import { ComprehensiveSystemAuditor, ComprehensiveAuditResult } from '@/scripts/audit/comprehensiveAuditor';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const ComprehensiveAuditDashboard = () => {
  const [auditResult, setAuditResult] = useState<ComprehensiveAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);

  const runComprehensiveAudit = async () => {
    setLoading(true);
    try {
      const result = await ComprehensiveSystemAuditor.runFullAudit();
      setAuditResult(result);
    } catch (error) {
      console.error('Erreur audit complet:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyAutomaticFixes = async () => {
    if (!auditResult) return;
    
    setFixing(true);
    try {
      const fixedCount = await ComprehensiveSystemAuditor.applyAutomaticFixes(auditResult);
      
      // Relancer l'audit après les corrections
      if (fixedCount > 0) {
        await runComprehensiveAudit();
      }
    } catch (error) {
      console.error('Erreur corrections automatiques:', error);
    } finally {
      setFixing(false);
    }
  };

  const exportAuditReport = () => {
    if (!auditResult) return;
    
    const report = {
      ...auditResult,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-complet-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getCategoryIcon = (category: 'critical' | 'warning' | 'info') => {
    switch (category) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-6 w-6" />
                Audit Complet du Système
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Analyse complète de la santé de la plateforme avec corrections automatiques
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runComprehensiveAudit} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {loading ? 'Audit en cours...' : 'Lancer l\'audit'}
              </Button>
              
              {auditResult && (
                <>
                  <Button 
                    onClick={applyAutomaticFixes}
                    disabled={fixing || !auditResult.issues.some(i => i.fixable)}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Wrench className="h-4 w-4" />
                    {fixing ? 'Correction...' : 'Corriger automatiquement'}
                  </Button>
                  
                  <Button 
                    onClick={exportAuditReport}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exporter
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-8">
            <LoadingSpinner size="lg" text="Audit complet en cours..." />
          </CardContent>
        </Card>
      )}

      {auditResult && (
        <>
          {/* Vue d'ensemble de la santé système */}
          <Card>
            <CardHeader>
              <CardTitle>État de Santé du Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(auditResult.systemHealth).map(([component, status]) => (
                  <div key={component} className={`p-3 rounded-lg border ${getStatusColor(status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      {getStatusIcon(status)}
                      <span className="text-xs font-medium uppercase">
                        {component === 'database' ? 'BDD' : 
                         component === 'api' ? 'API' :
                         component === 'auth' ? 'Auth' :
                         component === 'subscriptions' ? 'Abonnements' :
                         'Frontend'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold">
                      {status === 'good' ? 'Optimal' : 
                       status === 'warning' ? 'Attention' : 'Erreur'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métriques et statistiques */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Items EDN</p>
                    <p className="text-2xl font-bold">{auditResult.metrics.totalItems}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Items Valides</p>
                    <p className="text-2xl font-bold text-green-600">{auditResult.metrics.validItems}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux d'erreur</p>
                    <p className="text-2xl font-bold text-red-600">{auditResult.metrics.errorRate}%</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Qualité Code</p>
                    <p className="text-2xl font-bold text-blue-600">{auditResult.metrics.codeQuality}%</p>
                  </div>
                  <div className="w-8 h-8">
                    <Progress value={auditResult.metrics.codeQuality} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Problèmes identifiés */}
          {auditResult.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Problèmes Identifiés ({auditResult.issues.length})
                  <div className="flex gap-2">
                    <Badge variant="destructive">
                      {auditResult.issues.filter(i => i.category === 'critical').length} Critiques
                    </Badge>
                    <Badge variant="secondary">
                      {auditResult.issues.filter(i => i.category === 'warning').length} Avertissements
                    </Badge>
                    <Badge variant="outline">
                      {auditResult.issues.filter(i => i.category === 'info').length} Info
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditResult.issues
                    .sort((a, b) => {
                      const priority = { critical: 3, warning: 2, info: 1 };
                      return priority[b.category] - priority[a.category];
                    })
                    .map((issue, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {getCategoryIcon(issue.category)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{issue.component}</span>
                          {issue.fixable && (
                            <Badge variant="outline" className="text-xs">
                              {issue.fixed ? '✅ Corrigé' : '🔧 Corrigeable'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{issue.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommandations */}
          {auditResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};