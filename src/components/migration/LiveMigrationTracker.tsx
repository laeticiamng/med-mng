import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  CheckCircle2, 
  FileCode, 
  Zap,
  Clock,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FileProgress {
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  violationsFound: number;
  violationsFixed: number;
  startTime?: number;
  endTime?: number;
}

interface MigrationReport {
  id: string;
  report_type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  findings: any;
  metrics: any;
}

export const LiveMigrationTracker: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [filesProcessed, setFilesProcessed] = useState<FileProgress[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [stats, setStats] = useState({
    processed: 0,
    total: 0,
    violations: 0,
    elapsed: 0
  });

  // Charger les données réelles depuis Supabase
  const loadRealMigrationData = useCallback(async () => {
    try {
      const { data: reports, error } = await supabase
        .from('audit_reports')
        .select('*')
        .eq('report_type', 'migration')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (reports && reports.length > 0) {
        const processedFiles: FileProgress[] = reports.map((report: MigrationReport) => {
          const metrics = report.metrics as { files_processed?: number; violations_found?: number } | null;
          return {
            filename: `Migration ${report.id.slice(0, 8)}`,
            status: report.status === 'completed' ? 'completed' : 
                   report.status === 'error' ? 'error' : 'processing',
            violationsFound: metrics?.violations_found || 0,
            violationsFixed: report.status === 'completed' ? (metrics?.violations_found || 0) : 0,
            startTime: new Date(report.created_at).getTime(),
            endTime: report.completed_at ? new Date(report.completed_at).getTime() : undefined
          };
        });

        setFilesProcessed(processedFiles);
        
        const completedCount = processedFiles.filter(f => f.status === 'completed').length;
        const totalViolations = processedFiles.reduce((sum, f) => sum + f.violationsFound, 0);
        
        setStats({
          processed: completedCount,
          total: processedFiles.length,
          violations: totalViolations,
          elapsed: processedFiles.reduce((sum, f) => {
            if (f.startTime && f.endTime) {
              return sum + (f.endTime - f.startTime) / 1000;
            }
            return sum;
          }, 0)
        });
        
        setTotalProgress(processedFiles.length > 0 ? (completedCount / processedFiles.length) * 100 : 0);
      }
    } catch (error) {
      console.error('Erreur chargement migrations:', error);
    }
  }, []);

  useEffect(() => {
    loadRealMigrationData();
    
    // Polling toutes les 5 secondes si en cours
    const interval = setInterval(() => {
      if (isRunning) {
        loadRealMigrationData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isRunning, loadRealMigrationData]);

  const startMigration = async () => {
    setIsRunning(true);
    await loadRealMigrationData();
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton démo */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className={`w-5 h-5 ${isRunning ? 'animate-pulse text-success' : 'text-primary'}`} />
                Suivi en Temps Réel
              </CardTitle>
              <CardDescription>
                Visualisation live des fichiers en cours de traitement
              </CardDescription>
            </div>
            {!isRunning && (
              <button
                onClick={startMigration}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Charger Migrations
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isRunning && filesProcessed.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">En attente de migration</p>
              <p className="text-sm mt-2">Lancez le script pour voir la progression en temps réel</p>
              <p className="text-xs mt-4">Ou cliquez sur "Démo Simulation" pour un aperçu</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress globale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Progression: {stats.processed}/{stats.total} fichiers
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {totalProgress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={totalProgress} className="h-3" />
              </div>

              {/* Stats temps réel */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{stats.processed}</div>
                  <div className="text-xs text-muted-foreground">Traités</div>
                </div>
                <div className="text-center p-3 border rounded-lg bg-success/10">
                  <div className="text-2xl font-bold text-success">{stats.violations}</div>
                  <div className="text-xs text-muted-foreground">Violations</div>
                </div>
                <div className="text-center p-3 border rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{stats.elapsed.toFixed(1)}s</div>
                  <div className="text-xs text-muted-foreground">Écoulé</div>
                </div>
              </div>

              {/* Fichier en cours */}
              {currentFile && isRunning && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">En cours de traitement...</p>
                        <code className="text-xs bg-background px-2 py-1 rounded mt-1 inline-block">
                          {currentFile}
                        </code>
                      </div>
                      <Activity className="w-5 h-5 text-primary animate-spin" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Liste des fichiers traités */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Fichiers Récents</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filesProcessed.slice().reverse().slice(0, 10).map((file, idx) => (
                    <div
                      key={`${file.filename}-${idx}`}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                        file.status === 'processing' 
                          ? 'bg-primary/5 border-primary/20 animate-pulse' 
                          : file.status === 'completed'
                          ? 'bg-success/5 border-success/20'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {file.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        )}
                        {file.status === 'processing' && (
                          <Clock className="w-4 h-4 text-primary animate-spin shrink-0" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileCode className="w-3 h-3 text-muted-foreground shrink-0" />
                            <code className="text-xs truncate">{file.filename}</code>
                          </div>
                          {file.endTime && file.startTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {((file.endTime - file.startTime) / 1000).toFixed(2)}s
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={
                            file.status === 'completed' 
                              ? 'bg-success/10 text-success border-success/20' 
                              : 'bg-muted'
                          }
                        >
                          {file.status === 'completed' ? file.violationsFixed : file.violationsFound} corrections
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note technique */}
      <Card className="border-muted">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">💡 Note Technique</p>
          <p>
            En production, ce composant se connecterait au script via WebSocket ou polling 
            pour afficher la progression réelle. La simulation ci-dessus démontre l'interface.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
