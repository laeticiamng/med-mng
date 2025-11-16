import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { useCloudSync } from '@/hooks/useCloudSync';
import { TagData } from './TagManager';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CloudSyncManagerProps {
  favorites: Set<string>;
  tags: TagData[];
  visitStats: Record<string, { count: number; timestamps: number[]; sessions: any[] }>;
  navigationPaths: { from: string; to: string; count: number }[];
  alertThresholds: { bounceRate: number; avgTimeSeconds: number };
  onDataLoaded: (data: {
    favorites: Set<string>;
    tags: TagData[];
    visitStats: Record<string, { count: number; timestamps: number[]; sessions: any[] }>;
    navigationPaths: { from: string; to: string; count: number }[];
    alertThresholds: { bounceRate: number; avgTimeSeconds: number };
  }) => void;
}

export function CloudSyncManager({
  favorites,
  tags,
  visitStats,
  navigationPaths,
  alertThresholds,
  onDataLoaded,
}: CloudSyncManagerProps) {
  const {
    isSyncing,
    lastSyncedAt,
    isAuthenticated,
    autoSyncEnabled,
    syncToCloud,
    syncFromCloud,
    toggleAutoSync,
  } = useCloudSync();

  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSyncToCloud = async () => {
    setActionStatus(null);
    const success = await syncToCloud({
      favorites,
      tags,
      visitStats,
      navigationPaths,
      alertThresholds,
    });

    if (success) {
      setActionStatus({
        type: 'success',
        message: 'Données sauvegardées dans le cloud avec succès',
      });
    }

    setTimeout(() => setActionStatus(null), 5000);
  };

  const handleSyncFromCloud = async () => {
    setActionStatus(null);
    const data = await syncFromCloud();

    if (data) {
      onDataLoaded(data);
      setActionStatus({
        type: 'success',
        message: 'Données chargées depuis le cloud avec succès',
      });
    }

    setTimeout(() => setActionStatus(null), 5000);
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Synchronisation Cloud</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Sauvegardez vos données dans le cloud
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Authentification requise</p>
              <p className="text-sm">
                Connectez-vous pour activer la synchronisation cloud et sauvegarder vos favoris, tags et statistiques automatiquement.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Synchronisation Cloud</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {lastSyncedAt
                  ? `Dernière sync: ${format(lastSyncedAt, 'Pp', { locale: fr })}`
                  : 'Jamais synchronisé'}
              </p>
            </div>
          </div>
          <Badge variant={autoSyncEnabled ? 'default' : 'outline'} className="gap-2">
            <RefreshCw className={`h-3 w-3 ${autoSyncEnabled ? 'animate-spin' : ''}`} />
            {autoSyncEnabled ? 'Auto-sync ON' : 'Auto-sync OFF'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {actionStatus && (
          <Alert variant={actionStatus.type === 'error' ? 'destructive' : 'default'}>
            {actionStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{actionStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
          <div className="space-y-1">
            <Label htmlFor="auto-sync" className="text-sm font-medium">
              Synchronisation automatique
            </Label>
            <p className="text-xs text-muted-foreground">
              Sauvegarder automatiquement les modifications
            </p>
          </div>
          <Switch
            id="auto-sync"
            checked={autoSyncEnabled}
            onCheckedChange={toggleAutoSync}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={handleSyncToCloud}
            disabled={isSyncing}
            className="w-full gap-2"
            variant="default"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CloudUpload className="h-4 w-4" />
            )}
            Sauvegarder dans le cloud
          </Button>

          <Button
            onClick={handleSyncFromCloud}
            disabled={isSyncing}
            className="w-full gap-2"
            variant="outline"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CloudDownload className="h-4 w-4" />
            )}
            Charger depuis le cloud
          </Button>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <h4 className="text-sm font-semibold mb-2">📊 Données à synchroniser</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>• {favorites.size} favoris</div>
            <div>• {tags.length} tags</div>
            <div>• {Object.keys(visitStats).length} pages trackées</div>
            <div>• {navigationPaths.length} chemins</div>
          </div>
        </div>

        <Alert>
          <Cloud className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Vos données sont chiffrées et sécurisées. Elles sont uniquement accessibles par vous et synchronisées entre tous vos appareils.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
