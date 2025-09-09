import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Database, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { syncAllItemsWithOic } from '@/utils/sync/syncAllItems';
import { logger } from '@/services/logger';

interface SyncStats {
  timestamp: string;
  itemsProcessed: number;
  itemsUpdated: number;
}

export const SyncAllItemsButton = () => {
  const [isSync, setIsSync] = useState(false);
  const [lastSync, setLastSync] = useState<SyncStats | null>(null);
  
  const { toast } = useToast();

  const handleSyncAll = async () => {
    if (isSync) return;
    
    setIsSync(true);
    
    try {
      toast({
        title: "🔄 Synchronisation globale",
        description: "Mise à jour de tous les items EDN avec les compétences OIC...",
      });

      const result = await syncAllItemsWithOic();
      
      setLastSync({
        timestamp: new Date().toISOString(),
        itemsProcessed: result.statistics?.items_processed || 0,
        itemsUpdated: result.statistics?.items_updated || 0,
      });

      toast({
        title: "✅ Synchronisation réussie",
        description: `${result.statistics?.items_updated || 0} items mis à jour avec les compétences OIC`,
      });

    } catch (error) {
      logger.error('Erreur synchronisation globale', {
        component: 'SyncAllItemsButton',
        action: 'handleSyncAll',
        metadata: { error }
      });
      toast({
        title: "❌ Erreur de synchronisation",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsSync(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          Synchronisation globale des compétences OIC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSyncAll} 
            disabled={isSync}
            className="min-w-[200px]"
            size="lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSync ? 'animate-spin' : ''}`} />
            {isSync ? 'Synchronisation...' : 'Synchroniser tous les items'}
          </Button>
        </div>

        {lastSync && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">
                Dernière synchronisation réussie
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Timestamp: {new Date(lastSync.timestamp).toLocaleString('fr-FR')}</p>
              <p>Items traités: {lastSync.itemsProcessed}</p>
              <p>Items mis à jour: {lastSync.itemsUpdated}</p>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Cette action va :</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Traiter tous les 367 items EDN</li>
            <li>Récupérer toutes les compétences OIC avec statut 'completed', 'updated', 'verified_unchanged' ou 'skipped_error'</li>
            <li>Mettre à jour les tableaux Rang A et Rang B pour chaque item</li>
            <li>Actualiser les compteurs de compétences</li>
            <li>Synchroniser l'affichage avec les dernières données backup_oic_competences</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};