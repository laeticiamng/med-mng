import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Download, Filter, Calendar, TrendingUp, Users,
  Activity, BarChart3, PieChart, LineChart, ArrowLeft, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Report {
  id: string;
  title: string;
  type: 'analytics' | 'performance' | 'progress' | 'engagement';
  description: string;
  generatedAt: string;
  generatedBy: string;
  period: string;
  status: 'ready' | 'generating' | 'error';
}

export default function ReportViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');

  const { user } = useAuth();
  const { isAdmin, loadingMyRoles } = useUserRoles();

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportType, setReportType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30days');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock reports data
  const reports: Report[] = [
    {
      id: '1',
      title: 'Rapport d\'Analytics Mensuel',
      type: 'analytics',
      description: 'Vue d\'ensemble des métriques clés du mois de novembre 2024',
      generatedAt: new Date().toISOString(),
      generatedBy: 'Système',
      period: 'Novembre 2024',
      status: 'ready'
    },
    {
      id: '2',
      title: 'Performance des Étudiants Q4',
      type: 'performance',
      description: 'Analyse détaillée des performances et de la progression des étudiants',
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'Admin',
      period: 'Q4 2024',
      status: 'ready'
    },
    {
      id: '3',
      title: 'Progression Hebdomadaire',
      type: 'progress',
      description: 'Suivi de la progression sur les items EDN cette semaine',
      generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'Système',
      period: 'Semaine 47',
      status: 'ready'
    },
    {
      id: '4',
      title: 'Engagement Communautaire',
      type: 'engagement',
      description: 'Statistiques d\'engagement et d\'activité de la communauté',
      generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'Admin',
      period: '30 derniers jours',
      status: 'ready'
    },
    {
      id: '5',
      title: 'Rapport Annuel 2024',
      type: 'analytics',
      description: 'Rapport complet de l\'année 2024',
      generatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'Système',
      period: 'Année 2024',
      status: 'generating'
    }
  ];

  const filteredReports = reports.filter(report => {
    if (reportType === 'all') return true;
    return report.type === reportType;
  });

  if (!user) {
    return <Navigate to="/med-mng-login" replace />;
  }

  if (!loadingMyRoles && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loadingMyRoles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'analytics': return BarChart3;
      case 'performance': return TrendingUp;
      case 'progress': return LineChart;
      case 'engagement': return Users;
      default: return FileText;
    }
  };

  const getReportTypeBadge = (type: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      analytics: { variant: 'default', label: 'Analytics' },
      performance: { variant: 'secondary', label: 'Performance' },
      progress: { variant: 'outline', label: 'Progression' },
      engagement: { variant: 'default', label: 'Engagement' }
    };
    return variants[type] || variants.analytics;
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Rapport généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = (report: Report) => {
    const data = {
      ...report,
      exportDate: new Date().toISOString(),
      data: {
        summary: 'Données du rapport...',
        metrics: {
          totalUsers: 1250,
          activeUsers: 980,
          completionRate: 78.5,
          averageScore: 82.3
        }
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Rapport exporté');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Helmet>
        <title>Visualiseur de Rapports | Med-Mng</title>
        <meta name="description" content="Visualisez et analysez les rapports de la plateforme" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'admin
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-10 w-10 text-primary" />
                <div>
                  <h1 className="text-4xl font-bold">Visualiseur de Rapports</h1>
                  <p className="text-muted-foreground mt-1">
                    Accédez et analysez tous vos rapports en un seul endroit
                  </p>
                </div>
              </div>
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Nouveau Rapport
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Filters & Report List */}
            <div className="lg:col-span-1">
              {/* Filters */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="h-5 w-5" />
                    Filtres
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reportType">Type de rapport</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger id="reportType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les rapports</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="progress">Progression</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateRange">Période</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger id="dateRange">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">7 derniers jours</SelectItem>
                        <SelectItem value="30days">30 derniers jours</SelectItem>
                        <SelectItem value="90days">90 derniers jours</SelectItem>
                        <SelectItem value="year">Cette année</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Report List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rapports Disponibles</CardTitle>
                  <CardDescription>
                    {filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredReports.map((report) => {
                      const Icon = getReportIcon(report.type);
                      const badge = getReportTypeBadge(report.type);

                      return (
                        <button
                          key={report.id}
                          onClick={() => setSelectedReport(report)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedReport?.id === report.id
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm line-clamp-1">
                                {report.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {report.period}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={badge.variant} className="text-xs">
                                  {badge.label}
                                </Badge>
                                {report.status === 'generating' && (
                                  <Badge variant="outline" className="text-xs">
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    En cours
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Report Viewer */}
            <div className="lg:col-span-2">
              {selectedReport ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {(() => {
                            const Icon = getReportIcon(selectedReport.type);
                            return <Icon className="h-6 w-6 text-primary" />;
                          })()}
                          <CardTitle className="text-2xl">{selectedReport.title}</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                          {selectedReport.description}
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(selectedReport.generatedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Par {selectedReport.generatedBy}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleExportReport(selectedReport)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                        <TabsTrigger value="details">Détails</TabsTrigger>
                        <TabsTrigger value="charts">Graphiques</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-6 mt-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold text-primary">1,250</div>
                              <p className="text-xs text-muted-foreground mt-1">Utilisateurs Total</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold text-green-600">78.5%</div>
                              <p className="text-xs text-muted-foreground mt-1">Taux de Complétion</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold text-blue-600">82.3</div>
                              <p className="text-xs text-muted-foreground mt-1">Score Moyen</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold text-orange-600">+12%</div>
                              <p className="text-xs text-muted-foreground mt-1">Croissance</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Key Insights */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Points Clés</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                              <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-sm text-green-900 dark:text-green-100">
                                  Engagement en hausse
                                </h4>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                  Le taux d'engagement a augmenté de 15% ce mois-ci
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                              <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                                  Performance stable
                                </h4>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                  Les scores moyens restent constants avec une légère amélioration
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                              <Users className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                                  Communauté active
                                </h4>
                                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                  980 utilisateurs actifs sur les 7 derniers jours
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="details" className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Données Détaillées</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Période couverte</p>
                                  <p className="font-semibold">{selectedReport.period}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Type de rapport</p>
                                  <p className="font-semibold capitalize">{selectedReport.type}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Généré le</p>
                                  <p className="font-semibold">{formatDate(selectedReport.generatedAt)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Statut</p>
                                  <Badge variant="outline">
                                    {selectedReport.status === 'ready' ? 'Prêt' :
                                     selectedReport.status === 'generating' ? 'En cours' : 'Erreur'}
                                  </Badge>
                                </div>
                              </div>

                              <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-3">Métadonnées</h4>
                                <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-auto">
                                  <pre>{JSON.stringify({
                                    id: selectedReport.id,
                                    version: '1.0',
                                    format: 'JSON',
                                    encoding: 'UTF-8',
                                    compression: 'none'
                                  }, null, 2)}</pre>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="charts" className="mt-6">
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Visualisations</CardTitle>
                              <CardDescription>
                                Les graphiques seront affichés ici avec les données réelles
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
                                <div className="text-center text-muted-foreground">
                                  <PieChart className="h-12 w-12 mx-auto mb-3" />
                                  <p className="text-sm">Graphiques à venir</p>
                                  <p className="text-xs mt-1">Intégration avec Recharts en cours</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-16">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Sélectionnez un rapport</h3>
                    <p className="text-muted-foreground">
                      Choisissez un rapport dans la liste pour le visualiser
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
