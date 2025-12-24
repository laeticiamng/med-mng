import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wifi, WifiOff, Download, RefreshCw, Check, AlertCircle,
  HardDrive, Cloud, RotateCw, CheckCircle, Trash2, FileDown,
  Music, BookOpen, ClipboardList, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// IndexedDB configuration
const DB_NAME = 'medmng_offline';
const DB_VERSION = 1;
const STORES = {
  content: 'offline_content',
  syncQueue: 'sync_queue',
  metadata: 'metadata'
};

interface OfflineData {
  id: string;
  type: 'edn' | 'music' | 'ecos' | 'course';
  title: string;
  size: number;
  downloadedAt: Date;
  lastSynced: Date;
  data?: any;
  itemCode?: string;
}

interface SyncStatus {
  pending: number;
  syncing: boolean;
  lastSync: Date | null;
  errors: string[];
}

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
}

interface DownloadProgress {
  itemId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

interface StorageQuota {
  used: number;
  available: number;
  percentage: number;
}

// IndexedDB helper class
class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store pour le contenu hors ligne
        if (!db.objectStoreNames.contains(STORES.content)) {
          const contentStore = db.createObjectStore(STORES.content, { keyPath: 'id' });
          contentStore.createIndex('type', 'type', { unique: false });
          contentStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }

        // Store pour la queue de sync
        if (!db.objectStoreNames.contains(STORES.syncQueue)) {
          const syncStore = db.createObjectStore(STORES.syncQueue, { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store pour les métadonnées
        if (!db.objectStoreNames.contains(STORES.metadata)) {
          db.createObjectStore(STORES.metadata, { keyPath: 'key' });
        }
      };
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getMetadata(key: string): Promise<any> {
    const data = await this.get<{ key: string; value: any }>(STORES.metadata, key);
    return data?.value;
  }

  async setMetadata(key: string, value: any): Promise<void> {
    await this.put(STORES.metadata, { key, value });
  }
}

// Singleton instance
const offlineDB = new OfflineDB();

export const OfflineMode: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    syncing: false,
    lastSync: null,
    errors: []
  });
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [availableContent, setAvailableContent] = useState<Array<{
    id: string;
    title: string;
    type: 'edn' | 'music' | 'ecos' | 'course';
    size: number;
    itemCode?: string;
  }>>([]);
  const [activeTab, setActiveTab] = useState('downloaded');

  // Charger les données hors ligne depuis IndexedDB
  const loadOfflineData = useCallback(async () => {
    try {
      setLoading(true);
      await offlineDB.init();

      // Charger le contenu téléchargé
      const content = await offlineDB.getAll<OfflineData>(STORES.content);
      setOfflineData(content.map(item => ({
        ...item,
        downloadedAt: new Date(item.downloadedAt),
        lastSynced: new Date(item.lastSynced)
      })));

      // Charger les items en attente de sync
      const syncQueue = await offlineDB.getAll<SyncQueueItem>(STORES.syncQueue);
      const lastSync = await offlineDB.getMetadata('lastSync');

      setSyncStatus(prev => ({
        ...prev,
        pending: syncQueue.length,
        lastSync: lastSync ? new Date(lastSync) : null
      }));

    } catch (error) {
      console.error('Erreur chargement IndexedDB:', error);
      toast.error('Erreur de chargement du stockage hors ligne');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger le contenu disponible depuis Supabase
  const loadAvailableContent = useCallback(async () => {
    if (!isOnline) return;

    try {
      // Charger les items EDN disponibles
      const { data: ednItems } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title')
        .limit(20);

      // Charger les musiques disponibles (depuis ai_generated_content)
      const { data: musicItems } = await (supabase
        .from('ai_generated_content') as any)
        .select('id, title, identifier')
        .eq('content_type', 'music')
        .limit(20);

      const available: typeof availableContent = [];

      // Ajouter les EDN items
      ednItems?.forEach(item => {
        if (!offlineData.find(d => d.id === `edn_${item.item_code}`)) {
          available.push({
            id: `edn_${item.item_code}`,
            title: `${item.item_code} - ${item.title}`,
            type: 'edn',
            size: 500 * 1024, // ~500KB estimé
            itemCode: item.item_code
          });
        }
      });

      // Ajouter les musiques
      musicItems?.forEach((item: any) => {
        if (!offlineData.find(d => d.id === `music_${item.id}`)) {
          available.push({
            id: `music_${item.id}`,
            title: item.title || `Musique ${item.identifier}`,
            type: 'music',
            size: 5 * 1024 * 1024, // ~5MB pour une musique
            itemCode: item.identifier
          });
        }
      });

      setAvailableContent(available);
    } catch (error) {
      console.error('Erreur chargement contenu disponible:', error);
    }
  }, [isOnline, offlineData]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connexion rétablie');
      // Auto-sync quand on revient en ligne
      if (syncStatus.pending > 0) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('Mode hors ligne activé');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialiser IndexedDB et charger les données
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadOfflineData, syncStatus.pending]);

  useEffect(() => {
    if (isOnline && !loading) {
      loadAvailableContent();
    }
  }, [isOnline, loading, loadAvailableContent]);

  // Télécharger du contenu pour le mode hors ligne
  const handleDownload = async (contentId: string, title: string, type: string, itemCode?: string) => {
    if (!isOnline) {
      toast.error('Connexion requise pour télécharger');
      return;
    }

    setDownloadProgress(prev => ({ ...prev, [contentId]: 0 }));

    try {
      let data: any = null;
      let size = 0;

      // Télécharger les données selon le type
      if (type === 'edn' && itemCode) {
        setDownloadProgress(prev => ({ ...prev, [contentId]: 20 }));

        // Récupérer l'item EDN complet
        const { data: ednData, error } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .eq('item_code', itemCode)
          .maybeSingle();

        if (error) throw error;

        setDownloadProgress(prev => ({ ...prev, [contentId]: 60 }));

        // Récupérer les compétences associées
        const { data: competences } = await (supabase
          .from('oic_competences') as any)
          .select('*')
          .eq('item_number', itemCode?.replace('IC-', ''));

        data = { item: ednData, competences };
        size = JSON.stringify(data).length;

      } else if (type === 'music') {
        setDownloadProgress(prev => ({ ...prev, [contentId]: 20 }));

        const musicId = contentId.replace('music_', '');
        const { data: musicData, error } = await (supabase
          .from('ai_generated_content') as any)
          .select('*')
          .eq('id', musicId)
          .maybeSingle();

        if (error) throw error;

        setDownloadProgress(prev => ({ ...prev, [contentId]: 50 }));

        // Télécharger le fichier audio si disponible
        const audioUrl = musicData?.content?.audio_url;
        if (audioUrl) {
          try {
            const response = await fetch(audioUrl);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            data = { ...musicData, audioBlob: Array.from(new Uint8Array(arrayBuffer)) };
            size = blob.size;
          } catch {
            // Si le téléchargement audio échoue, sauvegarder sans l'audio
            data = musicData;
            size = JSON.stringify(data).length;
          }
        } else {
          data = musicData;
          size = JSON.stringify(data).length;
        }
      }

      setDownloadProgress(prev => ({ ...prev, [contentId]: 80 }));

      // Sauvegarder dans IndexedDB
      const newData: OfflineData = {
        id: contentId,
        type: type as OfflineData['type'],
        title,
        size,
        downloadedAt: new Date(),
        lastSynced: new Date(),
        data,
        itemCode
      };

      await offlineDB.put(STORES.content, newData);

      setDownloadProgress(prev => ({ ...prev, [contentId]: 100 }));

      // Mettre à jour l'état
      setOfflineData(prev => [...prev, newData]);
      setAvailableContent(prev => prev.filter(c => c.id !== contentId));

      toast.success(`${title} téléchargé`);

    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      // Retirer de la progression après un délai
      setTimeout(() => {
        setDownloadProgress(prev => {
          const { [contentId]: _, ...rest } = prev;
          return rest;
        });
      }, 500);
    }
  };

  // Synchroniser les données en attente
  const handleSync = async () => {
    if (!isOnline) {
      toast.error('Connexion requise pour synchroniser');
      return;
    }

    setSyncStatus(prev => ({ ...prev, syncing: true, errors: [] }));

    try {
      const syncQueue = await offlineDB.getAll<SyncQueueItem>(STORES.syncQueue);
      const errors: string[] = [];

      for (const item of syncQueue) {
        try {
          if (item.action === 'create') {
            await (supabase as any).from(item.table).insert(item.data);
          } else if (item.action === 'update') {
            await (supabase as any).from(item.table).update(item.data).eq('id', item.data.id);
          } else if (item.action === 'delete') {
            await (supabase as any).from(item.table).delete().eq('id', item.data.id);
          }

          // Supprimer de la queue après succès
          await offlineDB.delete(STORES.syncQueue, item.id);
        } catch (error) {
          errors.push(`Erreur sync ${item.table}: ${(error as Error).message}`);
        }
      }

      // Mettre à jour la date de dernière sync
      const now = new Date();
      await offlineDB.setMetadata('lastSync', now.toISOString());

      setSyncStatus({
        pending: errors.length,
        syncing: false,
        lastSync: now,
        errors
      });

      if (errors.length === 0) {
        toast.success('Synchronisation terminée');
      } else {
        toast.warning(`Synchronisation partielle: ${errors.length} erreur(s)`);
      }

    } catch (error) {
      console.error('Erreur synchronisation:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        errors: ['Erreur de synchronisation réseau']
      }));
      toast.error('Erreur de synchronisation');
    }
  };

  // Supprimer du contenu hors ligne
  const removeOfflineData = async (id: string) => {
    try {
      await offlineDB.delete(STORES.content, id);
      setOfflineData(prev => prev.filter(item => item.id !== id));
      toast.success('Contenu supprimé');

      // Rafraîchir le contenu disponible
      loadAvailableContent();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Vider tout le stockage hors ligne
  const clearAllOfflineData = async () => {
    try {
      await offlineDB.clear(STORES.content);
      setOfflineData([]);
      toast.success('Stockage hors ligne vidé');
      loadAvailableContent();
    } catch (error) {
      console.error('Erreur vidage:', error);
      toast.error('Erreur lors du vidage');
    }
  };

  // Ajouter à la queue de sync (pour les actions hors ligne)
  const addToSyncQueue = async (action: SyncQueueItem['action'], table: string, data: any) => {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action,
      table,
      data,
      timestamp: Date.now()
    };

    await offlineDB.put(STORES.syncQueue, item);
    setSyncStatus(prev => ({ ...prev, pending: prev.pending + 1 }));
  };

  const formatSize = (bytes: number) => {
    const MB = bytes / (1024 * 1024);
    return `${MB.toFixed(1)} MB`;
  };

  const getTotalSize = () => {
    return offlineData.reduce((total, item) => total + item.size, 0);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'edn': return <BookOpen className="h-5 w-5 text-primary" />;
      case 'music': return <Music className="h-5 w-5 text-warning" />;
      case 'ecos': return <ClipboardList className="h-5 w-5 text-success" />;
      case 'course': return <BookOpen className="h-5 w-5 text-accent" />;
      default: return <FileDown className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du stockage hors ligne...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statut de connexion */}
      <Alert className={isOnline ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-success" /> : <WifiOff className="h-4 w-4 text-warning" />}
            <AlertDescription className={isOnline ? 'text-success' : 'text-warning'}>
              {isOnline ? 'Connecté à Internet' : 'Mode hors ligne actif - Vos données sont disponibles localement'}
            </AlertDescription>
          </div>
          <Badge variant={isOnline ? 'default' : 'secondary'}>
            {formatSize(getTotalSize())} stockés
          </Badge>
        </div>
      </Alert>

      {/* Synchronisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="h-5 w-5" />
              Synchronisation
            </div>
            {syncStatus.pending > 0 && (
              <Badge variant="destructive">{syncStatus.pending} en attente</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Synchronisez vos données avec le cloud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm">
                {syncStatus.pending > 0
                  ? `${syncStatus.pending} modification${syncStatus.pending > 1 ? 's' : ''} en attente`
                  : 'Tout est synchronisé'}
              </p>
              {syncStatus.lastSync && (
                <p className="text-xs text-muted-foreground">
                  Dernière sync: {syncStatus.lastSync.toLocaleDateString('fr-FR')} à {syncStatus.lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            <Button
              onClick={handleSync}
              disabled={syncStatus.syncing || !isOnline}
              variant={syncStatus.pending > 0 ? 'default' : 'outline'}
            >
              {syncStatus.syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Synchroniser
                </>
              )}
            </Button>
          </div>

          {syncStatus.errors.length > 0 && (
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive text-sm">
                {syncStatus.errors.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Contenu avec onglets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Gestion du Contenu
            </div>
            {offlineData.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllOfflineData}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Tout supprimer
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="downloaded" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Téléchargés ({offlineData.length})
              </TabsTrigger>
              <TabsTrigger value="available" className="flex items-center gap-2" disabled={!isOnline}>
                <Cloud className="h-4 w-4" />
                Disponibles ({availableContent.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="downloaded">
              {offlineData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Aucun contenu téléchargé</p>
                  <p className="text-sm">Téléchargez du contenu pour le consulter hors ligne</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offlineData.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{formatSize(item.size)}</span>
                            <span>•</span>
                            <span>{item.downloadedAt.toLocaleDateString('fr-FR')}</span>
                            <span className="flex items-center gap-1 text-success">
                              <CheckCircle className="h-3 w-3" />
                              Disponible hors ligne
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOfflineData(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="available">
              {!isOnline ? (
                <div className="text-center py-8 text-muted-foreground">
                  <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Connexion requise</p>
                  <p className="text-sm">Connectez-vous pour voir le contenu disponible</p>
                </div>
              ) : availableContent.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-success" />
                  <p className="font-medium">Tout est téléchargé</p>
                  <p className="text-sm">Vous avez téléchargé tout le contenu disponible</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableContent.map((item) => {
                    const isDownloading = downloadProgress[item.id] !== undefined;
                    const progress = downloadProgress[item.id] || 0;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-muted rounded-lg">
                            {getTypeIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>~{formatSize(item.size)}</span>
                              <Badge variant="outline" className="text-xs">
                                {item.type.toUpperCase()}
                              </Badge>
                            </div>
                            {isDownloading && (
                              <Progress value={progress} className="h-1 mt-2" />
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(item.id, item.title, item.type, item.itemCode)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              {progress}%
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-1" />
                              Télécharger
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Stats de stockage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistiques de Stockage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{offlineData.filter(d => d.type === 'edn').length}</p>
              <p className="text-xs text-muted-foreground">Items EDN</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Music className="h-5 w-5 mx-auto mb-1 text-warning" />
              <p className="text-2xl font-bold">{offlineData.filter(d => d.type === 'music').length}</p>
              <p className="text-xs text-muted-foreground">Musiques</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <ClipboardList className="h-5 w-5 mx-auto mb-1 text-success" />
              <p className="text-2xl font-bold">{offlineData.filter(d => d.type === 'ecos').length}</p>
              <p className="text-xs text-muted-foreground">ECOS</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <HardDrive className="h-5 w-5 mx-auto mb-1 text-accent" />
              <p className="text-2xl font-bold">{formatSize(getTotalSize())}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};