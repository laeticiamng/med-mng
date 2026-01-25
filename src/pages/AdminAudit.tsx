import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    Code,
    Database,
    FileText,
    Palette,
    Play,
    RefreshCw,
    Settings,
    Trash2,
    XCircle,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
      const { _data, _error } = await supabase
        .from('audit_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (_error) throw _error;
      setAuditReports(_data || []);
    } catch (error) {
      console.error('Error fetching audit reports:', error);
    }
  };

  const fetchOverallMetrics = async () => {
    try {
      // Récupérer les métriques depuis la dernière audit de base de données
      const { _data, _error } = await supabase
        .from('audit_reports')
        .select('metrics')
        .eq('report_type', 'database')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (_error) throw _error;
      
      if (_data && _data.length > 0) {
        const reportMetrics = _data[0].metrics as any;
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
      const { _data, error } = await supabase.functions.invoke('audit-system', {
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
    
    // Lancer tous les audits en séquence (sans délai artificiel)
    for (const auditType of auditTypes) {
      await runAudit(auditType);
    }
  };

  const cleanupData = async () => {
    try {
      const { _data, _error } = await supabase.rpc('cleanup_duplicates');
      
      if (_error) throw _error;

      const cleanupResult = _data as any;
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
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'running': return <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'running': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-success/10 text-success';
      case 'failed': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-warning/20 text-warning';
      case 'low': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit & Nettoyage</h1>
          <p className="text-muted-foreground mt-2">Analysez et optimisez votre projet automatiquement</p>
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
          <Button onClick={runFullAudit} className="bg-primary hover:bg-primary/90">
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
                <p className="text-sm text-muted-foreground">Items Total</p>
                <p className="text-2xl font-bold">{metrics.totalItems}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Doublons</p>
                <p className="text-2xl font-bold text-destructive">{metrics.duplicates}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incohérences</p>
                <p className="text-2xl font-bold text-warning">{metrics.inconsistencies}</p>
              </div>
              <XCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Complétude</p>
                <p className="text-2xl font-bold text-success">{metrics.completeness}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold text-accent">{metrics.performance}%</p>
              </div>
              <Zap className="h-8 w-8 text-accent" />
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
                  <Database className="h-5 w-5 text-primary" />
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
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-primary border-t-transparent rounded-full" />
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
                  <Code className="h-5 w-5 text-success" />
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
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-success border-t-transparent rounded-full" />
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
                  <Palette className="h-5 w-5 text-accent" />
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
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-accent border-t-transparent rounded-full" />
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
                  <Zap className="h-5 w-5 text-warning" />
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
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-warning border-t-transparent rounded-full" />
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
                <Trash2 className="h-5 w-5 text-destructive" />
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
                    <p className="text-sm text-muted-foreground">Garde l'enregistrement le plus récent</p>
                  </div>
                  <Button onClick={cleanupData} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Nettoyer
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                  <div>
                    <h4 className="font-medium">Corriger les slugs</h4>
                    <p className="text-sm text-muted-foreground">Normalise les URLs</p>
                  </div>
                  <Button disabled size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Bientôt
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                  <div>
                    <h4 className="font-medium">Optimiser les JSON</h4>
                    <p className="text-sm text-muted-foreground">Valide et formate les données</p>
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
                <div className="text-center py-8 text-muted-foreground">
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
                            <p className="text-sm text-muted-foreground">
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
                            <div className="text-sm text-muted-foreground">
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