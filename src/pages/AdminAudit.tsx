import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Code, 
  Palette, 
  Zap, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Trash2,
  Settings,
  BarChart3,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuditReport {
  [key: string]: any;
}

interface AuditMetrics {
  totalItems: number;
  duplicates: number;
  inconsistencies: number;
  completeness: number;
  performance: number;
}

export default function AdminAudit() {
  const [auditReports, setAuditReports] = useState<AuditReport[]>([]);
  const [isRunningAudit, setIsRunningAudit] = useState<Record<string, boolean>>({});
  const [metrics, setMetrics] = useState<AuditMetrics>({
    totalItems: 0,
    duplicates: 0,
    inconsistencies: 0,
    completeness: 0,
    performance: 0
  });
  const [autoFixEnabled, setAutoFixEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditReports();
    fetchOverallMetrics();
  }, []);

  const fetchAuditReports = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAuditReports(data || []);
    } catch (error) {
      console.error('Error fetching audit reports:', error);
    }
  };

  const fetchOverallMetrics = async () => {
    try {
      // Récupérer les métriques depuis la dernière audit de base de données
      const { data, error } = await supabase
        .from('audit_reports')
        .select('metrics')
        .eq('report_type', 'database')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        const reportMetrics = data[0].metrics as any;
        setMetrics({
          totalItems: reportMetrics?.total_edn_items || 0,
          duplicates: reportMetrics?.duplicates_found || 0,
          inconsistencies: reportMetrics?.inconsistencies_found || 0,
          completeness: calculateCompleteness(reportMetrics),
          performance: 75 // Score simulé
        });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const calculateCompleteness = (reportMetrics: any): number => {
    if (!reportMetrics.total_edn_items) return 0;
    
    const hasTableauA = reportMetrics.items_with_tableau_a || 0;
    const hasTableauB = reportMetrics.items_with_tableau_b || 0;
    const hasMusic = reportMetrics.items_with_music || 0;
    const hasQuiz = reportMetrics.items_with_quiz || 0;
    
    const total = reportMetrics.total_edn_items;
    const completeness = ((hasTableauA + hasTableauB + hasMusic + hasQuiz) / (total * 4)) * 100;
    
    return Math.round(completeness);
  };

  const runAudit = async (auditType: 'database' | 'code' | 'ui_consistency' | 'performance') => {
    setIsRunningAudit(prev => ({ ...prev, [auditType]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('audit-system', {
        body: {
          auditType,
          autoFix: autoFixEnabled
        }
      });

      if (error) throw error;

      toast({
        title: "Audit terminé",
        description: `Audit ${auditType} complété avec succès`,
      });

      // Rafraîchir les données
      fetchAuditReports();
      fetchOverallMetrics();

    } catch (error) {
      console.error(`Audit ${auditType} error:`, error);
      toast({
        title: "Erreur d'audit",
        description: `Impossible de lancer l'audit ${auditType}`,
        variant: "destructive"
      });
    } finally {
      setIsRunningAudit(prev => ({ ...prev, [auditType]: false }));
    }
  };

  const runFullAudit = async () => {
    const auditTypes: ('database' | 'code' | 'ui_consistency' | 'performance')[] = 
      ['database', 'code', 'ui_consistency', 'performance'];
    
    for (const auditType of auditTypes) {
      await runAudit(auditType);
      // Attendre un peu entre chaque audit
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const cleanupData = async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_duplicates');
      
      if (error) throw error;

      const cleanupResult = data as any;
      toast({
        title: "Nettoyage terminé",
        description: `${cleanupResult?.cleaned || 0} doublons supprimés`,
      });

      fetchOverallMetrics();
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Erreur de nettoyage",
        description: "Impossible de nettoyer les données",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running': return <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit & Nettoyage</h1>
          <p className="text-gray-600 mt-2">Analysez et optimisez votre projet automatiquement</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoFixEnabled}
              onChange={(e) => setAutoFixEnabled(e.target.checked)}
              className="rounded"
            />
            Corrections automatiques
          </label>
          <Button onClick={runFullAudit} className="bg-blue-600 hover:bg-blue-700">
            <Play className="h-4 w-4 mr-2" />
            Audit Complet
          </Button>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Total</p>
                <p className="text-2xl font-bold">{metrics.totalItems}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doublons</p>
                <p className="text-2xl font-bold text-red-600">{metrics.duplicates}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Incohérences</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.inconsistencies}</p>
              </div>
              <XCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Complétude</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completeness}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.performance}%</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audits" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="cleanup">Nettoyage</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Audit Base de données */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5 text-blue-500" />
                  Base de données
                </CardTitle>
                <CardDescription>
                  Doublons, intégrité, incohérences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runAudit('database')}
                  disabled={isRunningAudit.database}
                  className="w-full"
                  variant="outline"
                >
                  {isRunningAudit.database ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-500 border-t-transparent rounded-full" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Analyser
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Audit Code */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5 text-green-500" />
                  Structure Code
                </CardTitle>
                <CardDescription>
                  Imports, types, duplications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runAudit('code')}
                  disabled={isRunningAudit.code}
                  className="w-full"
                  variant="outline"
                >
                  {isRunningAudit.code ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-green-500 border-t-transparent rounded-full" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Code className="h-4 w-4 mr-2" />
                      Analyser
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Audit UI */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-purple-500" />
                  Cohérence UI
                </CardTitle>
                <CardDescription>
                  Design system, styles, tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runAudit('ui_consistency')}
                  disabled={isRunningAudit.ui_consistency}
                  className="w-full"
                  variant="outline"
                >
                  {isRunningAudit.ui_consistency ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-purple-500 border-t-transparent rounded-full" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Palette className="h-4 w-4 mr-2" />
                      Analyser
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Audit Performance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Performance
                </CardTitle>
                <CardDescription>
                  Bundle, requêtes, optimisations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runAudit('performance')}
                  disabled={isRunningAudit.performance}
                  className="w-full"
                  variant="outline"
                >
                  {isRunningAudit.performance ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-orange-500 border-t-transparent rounded-full" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyser
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Nettoyage Automatique
              </CardTitle>
              <CardDescription>
                Supprimez automatiquement les doublons et corrigez les incohérences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Le nettoyage automatique va supprimer définitivement les doublons. 
                  Assurez-vous d'avoir une sauvegarde avant de continuer.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Supprimer les doublons</h4>
                    <p className="text-sm text-gray-600">Garde l'enregistrement le plus récent</p>
                  </div>
                  <Button onClick={cleanupData} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Nettoyer
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                  <div>
                    <h4 className="font-medium">Corriger les slugs</h4>
                    <p className="text-sm text-gray-600">Normalise les URLs</p>
                  </div>
                  <Button disabled size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Bientôt
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                  <div>
                    <h4 className="font-medium">Optimiser les JSON</h4>
                    <p className="text-sm text-gray-600">Valide et formate les données</p>
                  </div>
                  <Button disabled size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Bientôt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Historique des Audits
                </span>
                <Button onClick={fetchAuditReports} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun audit effectué</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditReports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(report.status)}
                          <div>
                            <h4 className="font-medium capitalize">{report.report_type}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(report.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>

                      {report.status === 'completed' && report.findings && (
                        <div className="mt-3 space-y-2">
                          <div className="text-sm font-medium">Problèmes détectés:</div>
                          {report.findings.slice(0, 3).map((finding, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Badge 
                                variant="secondary" 
                                className={getSeverityColor(finding.severity || 'medium')}
                              >
                                {finding.severity || 'medium'}
                              </Badge>
                              <span>{finding.description || finding.type}</span>
                            </div>
                          ))}
                          {report.findings.length > 3 && (
                            <div className="text-sm text-gray-500">
                              +{report.findings.length - 3} autres problèmes
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}