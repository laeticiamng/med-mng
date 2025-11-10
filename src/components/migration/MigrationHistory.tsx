import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  FileCode,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MigrationHistoryEntry {
  id: string;
  date: string;
  time: string;
  filesModified: number;
  violationsFixed: number;
  backupPath: string;
  status: 'completed' | 'in-progress' | 'failed';
  method: 'manual' | 'automatic';
  duration: string;
}

export const MigrationHistory: React.FC = () => {
  const { toast } = useToast();

  const historyEntries: MigrationHistoryEntry[] = [
    {
      id: '3',
      date: '2025-11-10',
      time: '17:00',
      filesModified: 2,
      violationsFixed: 20,
      backupPath: '.migration-backup/2025-11-10-17-00',
      status: 'completed',
      method: 'manual',
      duration: '15min'
    },
    {
      id: '2',
      date: '2025-11-10',
      time: '16:15',
      filesModified: 11,
      violationsFixed: 106,
      backupPath: '.migration-backup/2025-11-10-16-15',
      status: 'completed',
      method: 'manual',
      duration: '45min'
    },
    {
      id: '1',
      date: '2025-11-10',
      time: '14:30',
      filesModified: 12,
      violationsFixed: 60,
      backupPath: '.migration-backup/2025-11-10-14-30',
      status: 'completed',
      method: 'manual',
      duration: '1h30'
    }
  ];

  const handleRestore = (entry: MigrationHistoryEntry) => {
    toast({
      title: "Restauration",
      description: `Pour restaurer depuis ${entry.backupPath}, utilisez Git ou copiez manuellement les fichiers depuis le backup.`,
    });
  };

  const handleDownloadReport = (entry: MigrationHistoryEntry) => {
    toast({
      title: "Téléchargement",
      description: `Rapport de migration pour ${entry.date} ${entry.time}`,
    });
  };

  const getTotalStats = () => {
    return {
      totalMigrations: historyEntries.length,
      totalFiles: historyEntries.reduce((acc, e) => acc + e.filesModified, 0),
      totalViolations: historyEntries.reduce((acc, e) => acc + e.violationsFixed, 0)
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Stats résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Migrations totales</p>
                <p className="text-2xl font-bold">{stats.totalMigrations}</p>
              </div>
              <History className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fichiers modifiés</p>
                <p className="text-2xl font-bold">{stats.totalFiles}</p>
              </div>
              <FileCode className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Violations corrigées</p>
                <p className="text-2xl font-bold">{stats.totalViolations}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste historique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historique des Migrations
          </CardTitle>
          <CardDescription>
            Toutes les sessions de migration avec possibilité de restauration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historyEntries.map((entry) => (
              <div 
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  {entry.status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-success mt-1" />
                  )}
                  {entry.status === 'in-progress' && (
                    <Clock className="w-5 h-5 text-warning animate-pulse mt-1" />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {entry.date} à {entry.time}
                      </div>
                      <Badge variant={entry.method === 'automatic' ? 'default' : 'secondary'}>
                        {entry.method === 'automatic' ? 'Automatique' : 'Manuel'}
                      </Badge>
                      <Badge variant="outline" className="bg-muted">
                        {entry.duration}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Fichiers: </span>
                        <span className="font-medium">{entry.filesModified}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Violations: </span>
                        <span className="font-medium text-success">{entry.violationsFixed}</span>
                      </div>
                    </div>
                    
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                      {entry.backupPath}
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport(entry)}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Rapport
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(entry)}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restaurer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions restauration */}
      <Card className="border-warning/20 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-warning" />
            Comment Restaurer un Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">Option 1: Via Git (Recommandé)</p>
            <code className="block bg-background p-2 rounded text-xs">
              git restore --source=HEAD~1 src/
            </code>
          </div>
          
          <div>
            <p className="font-medium mb-1">Option 2: Copier depuis le backup</p>
            <code className="block bg-background p-2 rounded text-xs">
              cp -r .migration-backup/[date-time]/* ./
            </code>
          </div>
          
          <div>
            <p className="font-medium mb-1">Option 3: Via l'historique Lovable</p>
            <p className="text-muted-foreground">Utilisez le bouton "View History" en haut de l'interface pour restaurer une version précédente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
