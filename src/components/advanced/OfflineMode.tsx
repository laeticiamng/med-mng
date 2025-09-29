import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, WifiOff, Download, RefreshCw, Check, AlertCircle,
  HardDrive, Cloud, RotateCw, CheckCircle
} from 'lucide-react';

interface OfflineData {
  id: string;
  type: 'edn' | 'music' | 'ecos' | 'course';
  title: string;
  size: number;
  downloadedAt: Date;
  lastSynced: Date;
}

interface SyncStatus {
  pending: number;
  syncing: boolean;
  lastSync: Date | null;
  errors: string[];
}

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

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync quand on revient en ligne
      if (syncStatus.pending > 0) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Charger les données hors ligne depuis IndexedDB
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = async () => {
    // Simuler le chargement depuis IndexedDB
    const mockData: OfflineData[] = [
      {
        id: '1',
        type: 'edn',
        title: 'Cardiologie - Module 1',
        size: 2.5 * 1024 * 1024, // 2.5 MB
        downloadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        lastSynced: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'music',
        title: 'Mélodie Rang A - EDN-001',
        size: 5.2 * 1024 * 1024, // 5.2 MB
        downloadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        lastSynced: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];

    setOfflineData(mockData);
    setSyncStatus(prev => ({ ...prev, pending: Math.floor(Math.random() * 5) }));
  };

  const handleDownload = async (contentId: string, title: string, type: string) => {
    setDownloadProgress(prev => ({ ...prev, [contentId]: 0 }));

    // Simuler le téléchargement
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setDownloadProgress(prev => ({ ...prev, [contentId]: i }));
    }

    // Ajouter aux données hors ligne
    const newData: OfflineData = {
      id: contentId,
      type: type as any,
      title,
      size: Math.random() * 10 * 1024 * 1024, // Taille aléatoire
      downloadedAt: new Date(),
      lastSynced: new Date()
    };

    setOfflineData(prev => [...prev, newData]);
    setDownloadProgress(prev => {
      const { [contentId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSync = async () => {
    if (!isOnline) return;

    setSyncStatus(prev => ({ ...prev, syncing: true, errors: [] }));

    try {
      // Simuler la synchronisation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        pending: 0,
        lastSync: new Date()
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        errors: ['Erreur de synchronisation réseau']
      }));
    }
  };

  const removeOfflineData = (id: string) => {
    setOfflineData(prev => prev.filter(item => item.id !== id));
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
      case 'edn': return '📚';
      case 'music': return '🎵';
      case 'ecos': return '🎭';
      case 'course': return '📖';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statut de connexion */}
      <Alert className={isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-orange-600" />}
          <AlertDescription className={isOnline ? 'text-green-800' : 'text-orange-800'}>
            {isOnline ? 'Connecté à Internet' : 'Mode hors ligne actif - Vos données sont disponibles localement'}
          </AlertDescription>
        </div>
      </Alert>

      {/* Synchronisation */}
      {isOnline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCw className="h-5 w-5" />
              Synchronisation
            </CardTitle>
            <CardDescription>
              Synchronisez vos données avec le cloud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm">
                  {syncStatus.pending > 0 ? `${syncStatus.pending} modifications en attente` : 'Tout est synchronisé'}
                </p>
                {syncStatus.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Dernière sync: {syncStatus.lastSync.toLocaleTimeString()}
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleSync}
                disabled={syncStatus.syncing}
                variant={syncStatus.pending > 0 ? "default" : "outline"}
              >
                {syncStatus.syncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {syncStatus.errors.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contenu hors ligne */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Contenu Hors Ligne
            </div>
            <Badge variant="secondary">
              {formatSize(getTotalSize())} utilisés
            </Badge>
          </CardTitle>
          <CardDescription>
            Gérez vos contenus disponibles sans connexion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {offlineData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun contenu téléchargé pour l'instant</p>
              <p className="text-sm">Téléchargez du contenu pour le consulter hors ligne</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offlineData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatSize(item.size)}</span>
                        <span>Téléchargé le {item.downloadedAt.toLocaleDateString()}</span>
                        {item.lastSynced && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Synchronisé
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOfflineData(item.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Téléchargements en cours */}
          {Object.keys(downloadProgress).length > 0 && (
            <div className="space-y-3 mt-6 pt-6 border-t">
              <h4 className="font-medium">Téléchargements en cours</h4>
              {Object.entries(downloadProgress).map(([id, progress]) => (
                <div key={id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Téléchargement #{id}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Téléchargements pour un accès hors ligne
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleDownload('demo-edn', 'Module EDN Cardiologie', 'edn')}
              disabled={Object.keys(downloadProgress).length > 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger EDN Démo
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleDownload('demo-music', 'Musique Démo Rang B', 'music')}
              disabled={Object.keys(downloadProgress).length > 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger Musique Démo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};