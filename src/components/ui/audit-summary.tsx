import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface AuditSummaryProps {
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
  securityScore: number;
}

export const AuditSummary: React.FC<AuditSummaryProps> = ({
  totalIssues,
  criticalIssues,
  warningIssues,
  infoIssues,
  securityScore
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 60) return 'C';
    return 'D';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Score Global */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Score Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
              {securityScore}/100
            </div>
            <Badge variant={securityScore >= 90 ? 'default' : securityScore >= 70 ? 'secondary' : 'destructive'}>
              Grade {getScoreGrade(securityScore)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Issues Critiques */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            Critiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">
            {criticalIssues}
          </div>
          <p className="text-xs text-muted-foreground">
            Nécessitent une correction immédiate
          </p>
        </CardContent>
      </Card>

      {/* Avertissements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Avertissements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-warning">
            {warningIssues}
          </div>
          <p className="text-xs text-muted-foreground">
            À corriger quand possible
          </p>
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4 text-info" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-info">
            {infoIssues}
          </div>
          <p className="text-xs text-muted-foreground">
            Informations utiles
          </p>
        </CardContent>
      </Card>
    </div>
  );
};