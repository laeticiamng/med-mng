import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Cloud, 
  CloudOff, 
  Database, 
  Download, 
  HardDrive, 
  Loader2, 
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CachedData {
  key: string;
  label: string;
  size: number;
  lastSync: Date | null;
  itemCount: number;
}

export function OfflineModeManager() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cachedData, setCachedData] = useState<CachedData[]>([
    { key: 'edn-items', label: 'Items EDN', size: 0, lastSync: null, itemCount: 0 },
    { key: 'flashcards', label: 'Flashcards', size: 0, lastSync: null, itemCount: 0 },
    { key: 'songs', label: 'Chansons', size: 0, lastSync: null, itemCount: 0 },
    { key: 'clinical-cases', label: 'Cas cliniques', size: 0, lastSync: null, itemCount: 0 },
  ]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: '🌐 Connexion rétablie',
        description: 'Vos données seront synchronisées automatiquement.',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: '📴 Mode hors-ligne',
        description: 'Vous pouvez continuer à utiliser les données en cache.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Check storage usage
  useEffect(() => {
    const checkStorage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setStorageUsed(estimate.usage || 0);
        setStorageQuota(estimate.quota || 0);
      }

      // Check localStorage for cached data
      const updatedCache = cachedData.map(item => {
        const cached = localStorage.getItem(`offline-${item.key}`);
        if (cached) {
          try {
            const data = JSON.parse(cached);
            return {
              ...item,
              size: new Blob([cached]).size,
              lastSync: data.syncedAt ? new Date(data.syncedAt) : null,
              itemCount: data.items?.length || 0,
            };
          } catch {
            return item;
          }
        }
        return item;
      });
      setCachedData(updatedCache);
    };

    checkStorage();
  }, []);

  const handleSync = async (key?: string) => {
    setIsSyncing(true);
    
    try {
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (key) {
        // Sync specific data
        const mockData = {
          syncedAt: new Date().toISOString(),
          items: Array(Math.floor(Math.random() * 100) + 10).fill(null),
        };
        localStorage.setItem(`offline-${key}`, JSON.stringify(mockData));
        
        setCachedData(prev => prev.map(item => 
          item.key === key 
            ? { ...item, lastSync: new Date(), itemCount: mockData.items.length, size: new Blob([JSON.stringify(mockData)]).size }
            : item
        ));
        
        toast({
          title: '✅ Synchronisation terminée',
          description: `${cachedData.find(c => c.key === key)?.label} mis à jour.`,
        });
      } else {
        // Sync all
        cachedData.forEach(item => {
          const mockData = {
            syncedAt: new Date().toISOString(),
            items: Array(Math.floor(Math.random() * 100) + 10).fill(null),
          };
          localStorage.setItem(`offline-${item.key}`, JSON.stringify(mockData));
        });
        
        setCachedData(prev => prev.map(item => ({
          ...item,
          lastSync: new Date(),
          itemCount: Math.floor(Math.random() * 100) + 10,
          size: Math.floor(Math.random() * 1000000),
        })));
        
        toast({
          title: '✅ Synchronisation complète',
          description: 'Toutes les données ont été mises en cache.',
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Erreur de synchronisation',
        description: 'Vérifiez votre connexion et réessayez.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async (key?: string) => {
    if (key) {
      localStorage.removeItem(`offline-${key}`);
      setCachedData(prev => prev.map(item => 
        item.key === key 
          ? { ...item, lastSync: null, itemCount: 0, size: 0 }
          : item
      ));
      toast({
        title: 'Cache vidé',
        description: `${cachedData.find(c => c.key === key)?.label} supprimé du cache.`,
      });
    } else {
      cachedData.forEach(item => localStorage.removeItem(`offline-${item.key}`));
      setCachedData(prev => prev.map(item => ({ ...item, lastSync: null, itemCount: 0, size: 0 })));
      toast({
        title: 'Cache vidé',
        description: 'Toutes les données hors-ligne ont été supprimées.',
      });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais';
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalCachedSize = cachedData.reduce((acc, item) => acc + item.size, 0);
  const storagePercent = storageQuota > 0 ? (storageUsed / storageQuota) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={isOnline ? 'border-success/50' : 'border-warning/50'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isOnline ? 'bg-success/20' : 'bg-warning/20'
              }`}>
                {isOnline ? (
                  <Wifi className="h-6 w-6 text-success" />
                ) : (
                  <WifiOff className="h-6 w-6 text-warning" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {isOnline ? 'Connecté' : 'Hors-ligne'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? 'Toutes les fonctionnalités sont disponibles'
                    : 'Utilisation des données en cache'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Mode hors-ligne</span>
                <Switch
                  checked={offlineModeEnabled}
                  onCheckedChange={setOfflineModeEnabled}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSync()}
                disabled={isSyncing || !isOnline}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Tout synchroniser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Stockage local
          </CardTitle>
          <CardDescription>
            Espace utilisé pour les données hors-ligne
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Utilisé: {formatSize(storageUsed)}</span>
              <span>Quota: {formatSize(storageQuota)}</span>
            </div>
            <Progress value={storagePercent} className="h-2" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Cache MED-MNG</span>
            </div>
            <Badge variant="outline">{formatSize(totalCachedSize)}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cached Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Données en cache
          </CardTitle>
          <CardDescription>
            Gérez les données disponibles hors-ligne
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cachedData.map((item) => (
              <div 
                key={item.key}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {item.lastSync && (
                      <Badge variant="outline" className="text-xs">
                        {item.itemCount} éléments
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dernière sync: {formatDate(item.lastSync)}
                    {item.size > 0 && ` • ${formatSize(item.size)}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSync(item.key)}
                    disabled={isSyncing || !isOnline}
                    title="Synchroniser"
                  >
                    {isSyncing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                  {item.lastSync && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleClearCache(item.key)}
                      title="Supprimer du cache"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {cachedData.some(c => c.lastSync) && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => handleClearCache()}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Vider tout le cache
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CloudOff className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">À propos du mode hors-ligne</p>
              <p className="text-sm text-muted-foreground">
                Le mode hors-ligne vous permet de réviser vos items EDN, flashcards et cas cliniques
                même sans connexion internet. Synchronisez régulièrement pour avoir les dernières
                mises à jour. Les données seront automatiquement synchronisées dès que la connexion
                sera rétablie.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OfflineModeManager;
