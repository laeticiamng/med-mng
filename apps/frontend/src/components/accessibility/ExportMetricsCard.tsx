import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileJson, FileText, BarChart3, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExportMetricsCardProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportSummary: () => void;
  onExportMonthlyReport: () => void;
  hasData: boolean;
}

export const ExportMetricsCard: React.FC<ExportMetricsCardProps> = ({
  onExportCSV,
  onExportJSON,
  onExportSummary,
  onExportMonthlyReport,
  hasData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exporter les Métriques
        </CardTitle>
        <CardDescription>
          Téléchargez les rapports d'accessibilité dans différents formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export CSV complet */}
          <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/10">
                <FileSpreadsheet className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">CSV Complet</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Toutes les métriques formatées pour Excel/Sheets
                </p>
                <Badge variant="secondary" className="text-xs">
                  Recommandé pour analyse
                </Badge>
              </div>
            </div>
            <Button 
              size="sm" 
              className="w-full" 
              onClick={onExportCSV}
              disabled={!hasData}
            >
              <FileSpreadsheet className="h-3 w-3 mr-2" />
              Télécharger CSV
            </Button>
          </div>

          {/* Export JSON complet */}
          <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileJson className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">JSON Complet</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Structure hiérarchique pour intégrations API
                </p>
                <Badge variant="secondary" className="text-xs">
                  Pour développeurs
                </Badge>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={onExportJSON}
              disabled={!hasData}
            >
              <FileJson className="h-3 w-3 mr-2" />
              Télécharger JSON
            </Button>
          </div>

          {/* Résumé rapide */}
          <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Résumé Rapide</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Indicateurs clés en un coup d'œil (CSV léger)
                </p>
                <Badge variant="secondary" className="text-xs">
                  Partage rapide
                </Badge>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={onExportSummary}
              disabled={!hasData}
            >
              <FileText className="h-3 w-3 mr-2" />
              Télécharger Résumé
            </Button>
          </div>

          {/* Rapport mensuel */}
          <div className="p-4 rounded-lg border bg-gradient-to-br from-warning/5 to-warning/10 hover:from-warning/10 hover:to-warning/20 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <BarChart3 className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Rapport Mensuel</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Rapport exécutif complet avec recommandations
                </p>
                <Badge variant="warning" className="text-xs">
                  ⭐ Format Premium
                </Badge>
              </div>
            </div>
            <Button 
              size="sm" 
              className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
              onClick={onExportMonthlyReport}
              disabled={!hasData}
            >
              <BarChart3 className="h-3 w-3 mr-2" />
              Générer Rapport
            </Button>
          </div>
        </div>

        {/* Info complémentaire */}
        {!hasData && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              Actualisez les données pour activer les exports
            </p>
          </div>
        )}
        
        {hasData && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Astuce:</strong> Le rapport mensuel inclut une synthèse exécutive, 
              le classement des violations, les performances par développeur et des recommandations automatiques.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
