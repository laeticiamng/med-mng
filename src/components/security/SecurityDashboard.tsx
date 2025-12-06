import { Shield, AlertTriangle, CheckCircle, Download, RefreshCw, FileText, Users, Calculator, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { IncidentManagement } from './IncidentManagement';
import { RoleManagement } from './RoleManagement';
import { CVSSCalculator } from './CVSSCalculator';
import { CVSSList } from './CVSSList';
import { ScheduledReports } from './ScheduledReports';
import { UnifiedAlertsPanel } from './UnifiedAlertsPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export const SecurityDashboard = () => {
  const { validation, loading, revalidate, exportReport } = useSecurityValidation();
  const { hasRole, isAdmin, loadingMyRoles } = useUserRoles();

  const exportPDFReport = async () => {
    try {
      toast.info('Génération du rapport PDF...');
      
      const { data, error } = await supabase.functions.invoke('generate-security-report');
      
      if (error) throw error;
      
      // Generate PDF from HTML using jsPDF
      const doc = new jsPDF();
      
      // Add content to PDF
      doc.setFontSize(20);
      doc.text('Rapport de Sécurité', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35);
      
      doc.setFontSize(14);
      doc.text(`Score de Sécurité: ${data.metrics?.security_score || 0}/100`, 20, 50);
      
      doc.setFontSize(12);
      doc.text(`Tables avec RLS: ${data.metrics?.tables_with_rls || 0}/${data.metrics?.total_tables || 0}`, 20, 65);
      doc.text(`Politiques RLS: ${data.metrics?.total_policies || 0}`, 20, 75);
      doc.text(`Alertes actives: ${data.alerts?.filter((a: any) => a.status === 'open').length || 0}`, 20, 85);
      
      // Save PDF
      doc.save(`rapport-securite-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('Rapport PDF généré avec succès');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Shield className="h-4 w-4 text-primary" />;
    }
  };

  const getIssueVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive' as const;
      case 'warning': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  // Check if user has access to security features
  if (loadingMyRoles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Vérification des permissions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasRole('admin') && !hasRole('security_analyst') && !hasRole('viewer')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Accès Refusé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Vous n'avez pas les permissions nécessaires pour accéder au dashboard de sécurité.
              Contactez un administrateur pour obtenir un rôle.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Analyzing security configuration...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid grid-cols-3 lg:grid-cols-7 w-full">
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="unified">Alertes Unifiées</TabsTrigger>
        <TabsTrigger value="incidents">Incidents</TabsTrigger>
        <TabsTrigger value="cvss-calc">
          <Calculator className="h-4 w-4 mr-2" />
          CVSS
        </TabsTrigger>
        <TabsTrigger value="cvss-list">Vulnérabilités</TabsTrigger>
        <TabsTrigger value="reports">
          <Calendar className="h-4 w-4 mr-2" />
          Rapports
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="roles">
            <Users className="h-4 w-4 mr-2" />
            Rôles
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Security Score */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Score
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={revalidate}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={exportPDFReport}>
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${getScoreColor(validation.score)}`}>
              {validation.score}/100
            </div>
            <div>
              <Badge 
                variant={validation.isSecure ? 'default' : 'destructive'}
                className="text-lg px-3 py-1"
              >
                Grade {getScoreGrade(validation.score)}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                {validation.isSecure ? 'Secure Configuration' : 'Security Issues Found'}
              </div>
            </div>
          </div>
          <Progress value={validation.score} className="mt-4" />
          
          {validation.isSecure && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your application meets security best practices! 🎉
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Issues */}
      {validation.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Security Issues</CardTitle>
            <CardDescription>
              {validation.issues.filter(i => i.type === 'critical').length} critical, {' '}
              {validation.issues.filter(i => i.type === 'warning').length} warnings, {' '}
              {validation.issues.filter(i => i.type === 'info').length} info
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validation.issues.map((issue, index) => (
                <Alert key={index} variant={issue.type === 'critical' ? 'destructive' : 'default'}>
                  <div className="flex items-start gap-2">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{issue.message}</span>
                        <Badge variant={getIssueVariant(issue.type)} className="text-xs">
                          {issue.type}
                        </Badge>
                      </div>
                      {issue.details && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {issue.details}
                        </p>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {validation.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Security Recommendations</CardTitle>
            <CardDescription>
              Actions to improve your security posture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {validation.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      </TabsContent>

      <TabsContent value="unified">
        <UnifiedAlertsPanel />
      </TabsContent>

      <TabsContent value="incidents">
        <IncidentManagement />
      </TabsContent>

      <TabsContent value="cvss-calc">
        <CVSSCalculator />
      </TabsContent>

      <TabsContent value="cvss-list">
        <CVSSList />
      </TabsContent>

      <TabsContent value="reports">
        <ScheduledReports />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>
      )}
    </Tabs>
  );
};