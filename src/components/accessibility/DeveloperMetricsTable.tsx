import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import React from 'react';

interface DeveloperMetrics {
  login: string;
  totalPRs: number;
  passedPRs: number;
  failedPRs: number;
  avgFixTime: number;
  conformityRate: number;
}

interface DeveloperMetricsTableProps {
  developers: DeveloperMetrics[];
}

export const DeveloperMetricsTable: React.FC<DeveloperMetricsTableProps> = ({ developers }) => {
  const getConformityBadge = (rate: number) => {
    if (rate >= 90) return 'default';
    if (rate >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Métriques par Développeur
          <Badge variant="secondary">{developers.length} contributeurs</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {developers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune donnée disponible</p>
          </div>
        ) : (
          <div className="space-y-4">
            {developers.map((dev, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {dev.login}
                      {dev.conformityRate >= 90 && (
                        <span className="text-xl">🏆</span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {dev.totalPRs} PR{dev.totalPRs > 1 ? 's' : ''} analysée{dev.totalPRs > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant={getConformityBadge(dev.conformityRate)}>
                    {dev.conformityRate.toFixed(1)}% conforme
                  </Badge>
                </div>

                {/* Barre de progression */}
                <div className="mb-3">
                  <Progress 
                    value={dev.conformityRate} 
                    className="h-2"
                  />
                </div>

                {/* Statistiques détaillées */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Passées:</span>
                    <span className="font-semibold text-success">{dev.passedPRs}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-muted-foreground">Échouées:</span>
                    <span className="font-semibold text-destructive">{dev.failedPRs}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">Temps:</span>
                    <span className="font-semibold text-accent">
                      {dev.avgFixTime > 0 ? `${dev.avgFixTime.toFixed(1)}h` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
