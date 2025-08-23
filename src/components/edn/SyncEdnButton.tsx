import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { syncAllEdnContent, getLastSyncStatus, type SyncResult } from '@/utils/sync/syncEdnContent';

interface SyncEdnButtonProps {
  onSyncComplete?: () => void;
}

export const SyncEdnButton = ({ onSyncComplete }: SyncEdnButtonProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const [syncStatus, setSyncStatus] = useState<{
    lastSync?: string;
    itemsCount: number;
    completedOicCount: number;
  } | null>(null);
  
  const { toast } = useToast();

  React.useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await getLastSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Erreur chargement status:', error);
    }
  };

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      toast({
        title: "🔄 Synchronisation démarrée",
        description: "Mise à jour des contenus EDN en cours...",
      });

      const result = await syncAllEdnContent();
      setLastSync(result);
      
      if (result.success) {
        toast({
          title: "✅ Synchronisation réussie",
          description: `${result.statistics.items_updated} items mis à jour sur ${result.statistics.items_processed}`,
        });
        
        // Recharger le status
        await loadSyncStatus();
        
        // Notifier le parent pour recharger les données
        onSyncComplete?.();
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
      
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      toast({
        title: "❌ Erreur de synchronisation",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Synchronisation des contenus EDN
        </CardTitle>
        <CardDescription>
          Mettre à jour tous les contenus des items EDN avec les dernières données OIC de la base
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status actuel */}
        {syncStatus && (
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {syncStatus.itemsCount} items EDN
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {syncStatus.completedOicCount} compétences OIC
              </Badge>
            </div>
            {syncStatus.lastSync && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                Dernière sync: {new Date(syncStatus.lastSync).toLocaleString('fr-FR')}
              </div>
            )}
          </div>
        )}

        {/* Bouton de synchronisation */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            size="lg"
            className="min-w-[200px]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
          </Button>
          
          {isSyncing && (
            <div className="flex-1">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1">
                Traitement des items en cours...
              </p>
            </div>
          )}
        </div>

        {/* Résultats de la dernière synchronisation */}
        {lastSync && lastSync.success && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Dernière synchronisation réussie</span>
              <Badge variant="secondary" className="text-xs">
                {new Date(lastSync.timestamp).toLocaleString('fr-FR')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Traités:</span>
                <br />
                <span className="font-medium">{lastSync.statistics.items_processed}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mis à jour:</span>
                <br />
                <span className="font-medium text-green-600">{lastSync.statistics.items_updated}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Inchangés:</span>
                <br />
                <span className="font-medium">{lastSync.statistics.items_unchanged}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Erreurs:</span>
                <br />
                <span className="font-medium text-red-600">{lastSync.statistics.errors}</span>
              </div>
            </div>

            {lastSync.update_report && lastSync.update_report.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Voir le détail des mises à jour ({lastSync.update_report.filter(r => r.updated).length} items)
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {lastSync.update_report
                    .filter(report => report.updated)
                    .slice(0, 20)
                    .map((report, index) => (
                      <div key={index} className="text-xs py-1 border-b border-muted">
                        <span className="font-mono">{report.item_code}</span>
                        {report.rang_a_before !== undefined && report.rang_a_after !== undefined && (
                          <span className="ml-2 text-muted-foreground">
                            Rang A: {report.rang_a_before} → {report.rang_a_after}
                          </span>
                        )}
                        {report.rang_b_before !== undefined && report.rang_b_after !== undefined && (
                          <span className="ml-2 text-muted-foreground">
                            Rang B: {report.rang_b_before} → {report.rang_b_after}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Erreur de synchronisation */}
        {lastSync && !lastSync.success && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Erreur de synchronisation</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{lastSync.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};