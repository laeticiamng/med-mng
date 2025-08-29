import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  Download, 
  Send, 
  Calendar, 
  Clock,
  TrendingUp,
  BarChart3,
  Mail,
  Settings,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  type: 'performance' | 'analytics' | 'health' | 'security' | 'custom';
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  lastGenerated: string;
  nextScheduled?: string;
  recipients: string[];
  enabled: boolean;
  format: 'pdf' | 'excel' | 'json';
}

interface ReportTemplate {
  name: string;
  description: string;
  type: Report['type'];
  defaultSchedule: Report['schedule'];
  metrics: string[];
}

export const AutomatedReportsGenerator = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReport, setNewReport] = useState({
    name: '',
    type: 'performance' as Report['type'],
    schedule: 'weekly' as Report['schedule'],
    recipients: '',
    format: 'pdf' as Report['format']
  });

  useEffect(() => {
    initializeReports();
  }, []);

  const initializeReports = async () => {
    try {
      // Initialize report templates
      const reportTemplates: ReportTemplate[] = [
        {
          name: 'Rapport de Performance',
          description: 'Métriques Web Vitals et temps de réponse',
          type: 'performance',
          defaultSchedule: 'weekly',
          metrics: ['LCP', 'FID', 'CLS', 'TTFB', 'Response Time', 'Uptime']
        },
        {
          name: 'Analytics Utilisateurs',
          description: 'Comportement et engagement utilisateurs',
          type: 'analytics',
          defaultSchedule: 'monthly',
          metrics: ['Active Users', 'Sessions', 'Bounce Rate', 'Conversion Rate']
        },
        {
          name: 'Santé Système',
          description: 'État de santé des services et infrastructure',
          type: 'health',
          defaultSchedule: 'daily',
          metrics: ['Service Status', 'Resource Usage', 'Error Rates', 'Incidents']
        },
        {
          name: 'Audit de Sécurité',
          description: 'Vulnérabilités et conformité sécurité',
          type: 'security',
          defaultSchedule: 'weekly',
          metrics: ['Vulnerabilities', 'Failed Logins', 'Access Patterns', 'Compliance']
        }
      ];

      // Initialize existing reports
      const existingReports: Report[] = [
        {
          id: '1',
          name: 'Rapport Hebdomadaire Performance',
          type: 'performance',
          schedule: 'weekly',
          lastGenerated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          nextScheduled: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          recipients: ['admin@medicalmind.fr', 'tech@medicalmind.fr'],
          enabled: true,
          format: 'pdf'
        },
        {
          id: '2',
          name: 'Analytics Mensuel',
          type: 'analytics',
          schedule: 'monthly',
          lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          nextScheduled: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
          recipients: ['marketing@medicalmind.fr'],
          enabled: true,
          format: 'excel'
        },
        {
          id: '3',
          name: 'Check Santé Quotidien',
          type: 'health',
          schedule: 'daily',
          lastGenerated: new Date().toISOString(),
          nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          recipients: ['ops@medicalmind.fr'],
          enabled: true,
          format: 'json'
        }
      ];

      setTemplates(reportTemplates);
      setReports(existingReports);
    } catch (error) {
      console.error('Error initializing reports:', error);
      toast.error('Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      toast.info(`Génération du rapport "${report.name}" en cours...`);

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update last generated time
      const updatedReports = reports.map(r => 
        r.id === reportId 
          ? { ...r, lastGenerated: new Date().toISOString() }
          : r
      );
      setReports(updatedReports);

      toast.success(`Rapport "${report.name}" généré avec succès`);
    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Échec de la génération du rapport');
    }
  };

  const createReport = async () => {
    if (!newReport.name.trim()) {
      toast.error('Le nom du rapport est requis');
      return;
    }

    try {
      const report: Report = {
        id: Date.now().toString(),
        name: newReport.name,
        type: newReport.type,
        schedule: newReport.schedule,
        lastGenerated: new Date().toISOString(),
        recipients: newReport.recipients.split(',').map(email => email.trim()).filter(Boolean),
        enabled: true,
        format: newReport.format
      };

      setReports([...reports, report]);
      setNewReport({
        name: '',
        type: 'performance',
        schedule: 'weekly',
        recipients: '',
        format: 'pdf'
      });

      toast.success('Nouveau rapport créé avec succès');
    } catch (error) {
      console.error('Failed to create report:', error);
      toast.error('Échec de la création du rapport');
    }
  };

  const toggleReport = (reportId: string) => {
    const updatedReports = reports.map(r =>
      r.id === reportId ? { ...r, enabled: !r.enabled } : r
    );
    setReports(updatedReports);
    
    const report = reports.find(r => r.id === reportId);
    toast.success(`Rapport "${report?.name}" ${report?.enabled ? 'désactivé' : 'activé'}`);
  };

  const exportReportConfig = () => {
    const config = {
      reports: reports,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Configuration exportée avec succès');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'analytics': return 'bg-green-100 text-green-800 border-green-200';
      case 'health': return 'bg-red-100 text-red-800 border-red-200';
      case 'security': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'health': return <CheckCircle className="h-4 w-4" />;
      case 'security': return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FileText className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du générateur de rapports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Générateur de Rapports Automatisés</h2>
          <p className="text-muted-foreground">Création et planification de rapports intelligents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportReportConfig} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter Config
          </Button>
          <Button onClick={() => generateReport(reports[0]?.id)} size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Générer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Rapports Actifs</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="create">Nouveau Rapport</TabsTrigger>
          <TabsTrigger value="schedule">Planification</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{report.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(report.type)}
                    <Switch 
                      checked={report.enabled}
                      onCheckedChange={() => toggleReport(report.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge className={getTypeColor(report.type)} variant="outline">
                      {report.type}
                    </Badge>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Fréquence:</span>
                        <Badge variant="outline">{report.schedule}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Destinataires:</span>
                        <Badge variant="outline">{report.recipients.length}</Badge>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <div>Dernière génération: {new Date(report.lastGenerated).toLocaleDateString()}</div>
                      {report.nextScheduled && (
                        <div>Prochaine: {new Date(report.nextScheduled).toLocaleDateString()}</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => generateReport(report.id)}
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Générer
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="h-3 w-3 mr-1" />
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTypeIcon(template.type)}
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Métriques incluses:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.metrics.map((metric, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge className={getTypeColor(template.type)} variant="outline">
                        {template.defaultSchedule}
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setNewReport({
                            ...newReport,
                            name: template.name,
                            type: template.type,
                            schedule: template.defaultSchedule
                          });
                        }}
                      >
                        Utiliser ce modèle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Créer un Nouveau Rapport</CardTitle>
              <CardDescription>
                Configurez un rapport personnalisé avec planification automatique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du rapport</Label>
                  <Input
                    id="name"
                    value={newReport.name}
                    onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                    placeholder="Ex: Rapport Mensuel Performance"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Type de rapport</Label>
                  <select
                    id="type"
                    value={newReport.type}
                    onChange={(e) => setNewReport({...newReport, type: e.target.value as Report['type']})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="performance">Performance</option>
                    <option value="analytics">Analytics</option>
                    <option value="health">Santé Système</option>
                    <option value="security">Sécurité</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="schedule">Fréquence</Label>
                  <select
                    id="schedule"
                    value={newReport.schedule}
                    onChange={(e) => setNewReport({...newReport, schedule: e.target.value as Report['schedule']})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                    <option value="manual">Manuel</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="format">Format</Label>
                  <select
                    id="format"
                    value={newReport.format}
                    onChange={(e) => setNewReport({...newReport, format: e.target.value as Report['format']})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="recipients">Destinataires (emails séparés par des virgules)</Label>
                <Input
                  id="recipients"
                  value={newReport.recipients}
                  onChange={(e) => setNewReport({...newReport, recipients: e.target.value})}
                  placeholder="admin@example.com, manager@example.com"
                />
              </div>

              <Button onClick={createReport} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Créer le Rapport
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Planification des Rapports
              </CardTitle>
              <CardDescription>
                Gestion des horaires et automatisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.filter(r => r.enabled).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {report.schedule}
                        </span>
                        {report.nextScheduled && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Prochaine: {new Date(report.nextScheduled).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(report.type)} variant="outline">
                        {report.type}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {reports.filter(r => r.enabled).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun rapport planifié actif
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};