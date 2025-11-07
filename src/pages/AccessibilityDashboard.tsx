import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGitHubAccessibilityMetrics } from '@/hooks/useGitHubAccessibilityMetrics';
import { AccessibilityDashboardMetrics } from '@/components/accessibility/AccessibilityDashboardMetrics';
import { ViolationsChart } from '@/components/accessibility/ViolationsChart';
import { DeveloperMetricsTable } from '@/components/accessibility/DeveloperMetricsTable';
import { BlockedPRsList } from '@/components/accessibility/BlockedPRsList';
import { ExportMetricsCard } from '@/components/accessibility/ExportMetricsCard';
import { EmailReportConfig } from '@/components/accessibility/EmailReportConfig';
import { TemplateEditor } from '@/components/accessibility/TemplateEditor';
import { EmailStatistics } from '@/components/accessibility/EmailStatistics';
import { ABTestManager } from '@/components/accessibility/ABTestManager';
import { WebhookManager } from '@/components/accessibility/WebhookManager';
import { RefreshCw, Key, BarChart3, AlertCircle, CheckCircle2, Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportMetricsToCSV, exportMetricsToJSON, exportSummaryToCSV, exportMonthlyReport } from '@/utils/exportAccessibilityMetrics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AccessibilityDashboard = () => {
  const [githubToken, setGithubToken] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();
  const { metrics, isLoading, error, refetch } = useGitHubAccessibilityMetrics(githubToken);

  useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setGithubToken(savedToken);
      setIsConfigured(true);
    }
  }, []);

  const handleSaveToken = () => {
    if (!githubToken.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un token GitHub valide',
        variant: 'destructive'
      });
      return;
    }

    localStorage.setItem('github_token', githubToken);
    setIsConfigured(true);
    toast({
      title: 'Configuration enregistrée',
      description: 'Token GitHub configuré avec succès',
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Actualisation en cours',
      description: 'Récupération des dernières métriques GitHub...',
    });
  };

  const handleExportCSV = () => {
    if (!metrics) {
      toast({
        title: 'Erreur',
        description: 'Aucune métrique à exporter. Actualisez d\'abord les données.',
        variant: 'destructive'
      });
      return;
    }
    
    exportMetricsToCSV(metrics);
    toast({
      title: 'Export réussi',
      description: 'Rapport CSV téléchargé avec succès',
    });
  };

  const handleExportJSON = () => {
    if (!metrics) {
      toast({
        title: 'Erreur',
        description: 'Aucune métrique à exporter. Actualisez d\'abord les données.',
        variant: 'destructive'
      });
      return;
    }
    
    exportMetricsToJSON(metrics);
    toast({
      title: 'Export réussi',
      description: 'Rapport JSON téléchargé avec succès',
    });
  };

  const handleExportSummary = () => {
    if (!metrics) {
      toast({
        title: 'Erreur',
        description: 'Aucune métrique à exporter. Actualisez d\'abord les données.',
        variant: 'destructive'
      });
      return;
    }
    
    exportSummaryToCSV(metrics);
    toast({
      title: 'Export réussi',
      description: 'Résumé CSV téléchargé avec succès',
    });
  };

  const handleExportMonthlyReport = () => {
    if (!metrics) {
      toast({
        title: 'Erreur',
        description: 'Aucune métrique à exporter. Actualisez d\'abord les données.',
        variant: 'destructive'
      });
      return;
    }
    
    exportMonthlyReport(metrics);
    toast({
      title: 'Export réussi',
      description: 'Rapport mensuel téléchargé avec succès',
    });
  };

  if (!isConfigured) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-6 w-6" />
              Configuration GitHub
            </CardTitle>
            <CardDescription>
              Configurez votre token GitHub pour accéder aux métriques d'accessibilité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Token GitHub requis:</strong> Pour utiliser ce dashboard, vous devez créer un Personal Access Token GitHub avec les permissions suivantes:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><code>repo</code> - Accès complet aux repositories</li>
                  <li><code>read:org</code> - Lecture des organisations</li>
                </ul>
                <a 
                  href="https://github.com/settings/tokens/new?scopes=repo,read:org&description=MED-MNG%20Accessibility%20Dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  → Créer un token GitHub
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="github-token">Token GitHub</Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Votre token sera stocké localement dans votre navigateur
              </p>
            </div>

            <Button onClick={handleSaveToken} className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Enregistrer et continuer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-primary" />
            Dashboard Accessibilité GitHub
          </h1>
          <p className="text-muted-foreground mt-2">
            Métriques de conformité WCAG/RGAA en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              localStorage.removeItem('github_token');
              setIsConfigured(false);
              setGithubToken('');
            }}
          >
            <Key className="h-4 w-4 mr-2" />
            Reconfigurer
          </Button>
          
          {/* Dropdown menu pour les exports */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!metrics}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Format d'export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV Complet
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleExportJSON}>
                <FileJson className="h-4 w-4 mr-2" />
                Export JSON Complet
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleExportSummary}>
                <FileText className="h-4 w-4 mr-2" />
                Résumé Rapide (CSV)
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleExportMonthlyReport}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Rapport Mensuel (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Erreur lors de la récupération des données'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && !metrics && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Récupération des métriques GitHub...</p>
          </div>
        </div>
      )}

      {/* Dashboard content */}
      {metrics && (
        <>
          {/* Métriques globales */}
          <AccessibilityDashboardMetrics
            totalPRs={metrics.totalPRs}
            passedPRs={metrics.passedPRs}
            failedPRs={metrics.failedPRs}
            conformityRate={metrics.conformityRate}
            avgFixTime={metrics.avgFixTime}
            blockedPRsCount={metrics.blockedPRs.length}
          />

          {/* Configuration des emails automatiques */}
          <EmailReportConfig />

          {/* Éditeur de templates */}
          <TemplateEditor />

          {/* Statistiques d'emails */}
          <EmailStatistics />

          {/* Tests A/B */}
          <ABTestManager />

          {/* Gestion des Webhooks */}
          <WebhookManager />

          {/* Carte d'export */}
          <ExportMetricsCard
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            onExportSummary={handleExportSummary}
            onExportMonthlyReport={handleExportMonthlyReport}
            hasData={!!metrics}
          />

          {/* PRs bloquées */}
          <BlockedPRsList blockedPRs={metrics.blockedPRs} />

          {/* Graphique des violations */}
          <ViolationsChart violations={metrics.violations} />

          {/* Métriques par développeur */}
          <DeveloperMetricsTable developers={metrics.developers} />

          {/* Footer info */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                📊 Dashboard mis à jour en temps réel via l'API GraphQL GitHub • 
                Dernière actualisation: {new Date().toLocaleString('fr-FR')}
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* No data state */}
      {!isLoading && !metrics && !error && (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground">
              Cliquez sur "Actualiser" pour charger les métriques
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccessibilityDashboard;
