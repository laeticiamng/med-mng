import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { ComprehensiveAuditReport } from '@/scripts/audit/comprehensiveAudit';
import {
    AlertTriangle,
    CheckCircle,
    Database,
    Download,
    FileText,
    Play,
    Shield,
    TrendingUp,
    XCircle
} from 'lucide-react';

interface ComprehensiveAuditPanelProps {
  report: ComprehensiveAuditReport | null;
  loading: boolean;
  error: string | null;
  onRunAudit: () => Promise<void>;
  onExportReport: (format: 'json' | 'markdown') => void;
}

export const ComprehensiveAuditPanel = ({
  report,
  loading,
  error,
  onRunAudit,
  onExportReport
}: ComprehensiveAuditPanelProps) => {
  
  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 90) return 'text-success';
    if (percentage >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      critical: { variant: 'destructive', label: '🔴 Critique' },
      high: { variant: 'destructive', label: '🟠 Élevé' },
      medium: { variant: 'default', label: '🟡 Moyen' },
      low: { variant: 'secondary', label: '🔵 Faible' },
      info: { variant: 'outline', label: 'ℹ️ Info' }
    };
    const config = variants[severity] || variants.info;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6 text-primary" />
                Audit Complet de la Plateforme
              </CardTitle>
              <CardDescription>
                Analyse approfondie de tous les aspects de la plateforme MED MNG
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={onRunAudit}
                disabled={loading}
                size="lg"
                className="gap-2"
              >
                <Play className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Analyse en cours...' : 'Lancer l\'Audit'}
              </Button>
              {report && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onExportReport('markdown')}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Markdown
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onExportReport('json')}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    JSON
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {report && (
        <div className="grid gap-6">
          {/* Score Global */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Score Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    <span className={getScoreColor(report.totalScore, report.maxScore)}>
                      {report.totalScore}
                    </span>
                    <span className="text-muted-foreground"> / {report.maxScore}</span>
                  </span>
                  <span className="text-2xl font-semibold">
                    {((report.totalScore / report.maxScore) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(report.totalScore / report.maxScore) * 100} 
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Statistiques de la Plateforme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{report.statistics.totalItems}</div>
                  <div className="text-sm text-muted-foreground">Items totaux</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{report.statistics.itemsWithOICCompetencesA}</div>
                  <div className="text-sm text-muted-foreground">Avec OIC Rang A</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{report.statistics.itemsWithOICCompetencesB}</div>
                  <div className="text-sm text-muted-foreground">Avec OIC Rang B</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{report.statistics.itemsComplete}</div>
                  <div className="text-sm text-muted-foreground">Items 100% complets</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{report.oicQuality.qualityCompetencesA}</div>
                  <div className="text-sm text-muted-foreground">Compétences A qualité</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{report.oicQuality.qualityCompetencesB}</div>
                  <div className="text-sm text-muted-foreground">Compétences B qualité</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          {report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.recommendations.map((rec, index) => (
                    <Alert key={index}>
                      <AlertDescription className="text-sm whitespace-pre-line">
                        {rec}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Problèmes Détectés */}
          {report.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Problèmes Détectés ({report.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {/* Grouper par sévérité */}
                    {(['critical', 'high', 'medium', 'low'] as const).map(severity => {
                      const issues = report.issues.filter(i => i.severity === severity);
                      if (issues.length === 0) return null;

                      return (
                        <div key={severity} className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            {getSeverityBadge(severity)}
                            <span className="text-sm text-muted-foreground">
                              ({issues.length})
                            </span>
                          </div>
                          
                          {issues.slice(0, 20).map((issue, index) => (
                            <div key={index} className="p-3 bg-muted rounded-lg space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{issue.issue}</div>
                                  {issue.itemCode && (
                                    <div className="text-xs text-muted-foreground">
                                      Item: {issue.itemCode}
                                    </div>
                                  )}
                                  {issue.details && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {issue.details}
                                    </div>
                                  )}
                                  {issue.fix && (
                                    <div className="text-xs text-success mt-1">
                                      💡 {issue.fix}
                                    </div>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {issue.category}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          
                          {issues.length > 20 && (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              ... et {issues.length - 20} autres problèmes {severity}
                            </div>
                          )}
                          
                          <Separator className="my-4" />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Succès */}
          {report.issues.length === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle>✅ Parfait !</AlertTitle>
              <AlertDescription>
                Aucun problème détecté. La plateforme est en excellent état !
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};
