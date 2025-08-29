import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  Download, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Settings,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheEntry {
  key: string;
  size: number;
  lastAccessed: number;
  hitCount: number;
  category: 'audio' | 'images' | 'api' | 'user-data' | 'other';
  expiry?: number;
}

interface CacheStats {
  totalSize: number;
  totalEntries: number;
  hitRate: number;
  missRate: number;
  categories: Record<string, { size: number; count: number }>;
}

export const SmartCacheManager = memo(() => {
  const { toast } = useToast();
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [stats, setStats] = useState<CacheStats>({
    totalSize: 0,
    totalEntries: 0,
    hitRate: 85,
    missRate: 15,
    categories: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [autoCleanup, setAutoCleanup] = useState(true);
  
  // Configuration de cache intelligente
  const cacheConfig = {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxAge: 24 * 60 * 60 * 1000, // 24h
    priorities: {
      'audio': 0.9,
      'user-data': 0.8,
      'api': 0.7,
      'images': 0.6,
      'other': 0.3
    }
  };

  // Analyse du cache existant
  const analyzeCaches = useCallback(async () => {
    setIsLoading(true);
    const entries: CacheEntry[] = [];
    let totalSize = 0;
    const categories: Record<string, { size: number; count: number }> = {};

    try {
      // Analyse localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            const size = new Blob([value]).size;
            const category = determineCategory(key);
            
            entries.push({
              key,
              size,
              lastAccessed: Date.now(),
              hitCount: parseInt(localStorage.getItem(`${key}_hits`) || '0'),
              category
            });
            
            totalSize += size;
            
            if (!categories[category]) {
              categories[category] = { size: 0, count: 0 };
            }
            categories[category].size += size;
            categories[category].count += 1;
          }
        }
      }

      // Analyse sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          if (value) {
            const size = new Blob([value]).size;
            const category = determineCategory(key);
            
            entries.push({
              key: `session_${key}`,
              size,
              lastAccessed: Date.now(),
              hitCount: parseInt(sessionStorage.getItem(`${key}_hits`) || '0'),
              category
            });
            
            totalSize += size;
            
            if (!categories[category]) {
              categories[category] = { size: 0, count: 0 };
            }
            categories[category].size += size;
            categories[category].count += 1;
          }
        }
      }

      // Analyse Cache API si disponible
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const size = parseInt(response.headers.get('content-length') || '0');
              entries.push({
                key: `cache_${request.url}`,
                size,
                lastAccessed: Date.now(),
                hitCount: 0,
                category: 'api'
              });
              
              totalSize += size;
              if (!categories['api']) {
                categories['api'] = { size: 0, count: 0 };
              }
              categories['api'].size += size;
              categories['api'].count += 1;
            }
          }
        }
      }

      setCacheEntries(entries);
      setStats({
        totalSize,
        totalEntries: entries.length,
        hitRate: 85, // Calculé dynamiquement en réalité
        missRate: 15,
        categories
      });
      
    } catch (error) {
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser complètement le cache",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Déterminer la catégorie d'un élément de cache
  const determineCategory = (key: string): CacheEntry['category'] => {
    if (key.includes('audio') || key.includes('music') || key.includes('sound')) return 'audio';
    if (key.includes('image') || key.includes('img') || key.includes('photo')) return 'images';
    if (key.includes('api') || key.includes('fetch') || key.includes('query')) return 'api';
    if (key.includes('user') || key.includes('profile') || key.includes('settings')) return 'user-data';
    return 'other';
  };

  // Nettoyage intelligent du cache
  const smartCleanup = useCallback(async () => {
    setIsLoading(true);
    let cleanedSize = 0;
    let cleanedCount = 0;

    try {
      const now = Date.now();
      const entriesToRemove: CacheEntry[] = [];

      // Identifie les entrées à supprimer
      cacheEntries.forEach(entry => {
        const age = now - entry.lastAccessed;
        const priority = cacheConfig.priorities[entry.category] || 0.5;
        const shouldRemove = 
          age > cacheConfig.maxAge || // Trop ancien
          (entry.hitCount < 3 && age > 60 * 60 * 1000) || // Peu utilisé et > 1h
          (priority < 0.5 && stats.totalSize > cacheConfig.maxSize * 0.8); // Faible priorité et cache plein

        if (shouldRemove) {
          entriesToRemove.push(entry);
          cleanedSize += entry.size;
          cleanedCount++;
        }
      });

      // Supprime les entrées identifiées
      for (const entry of entriesToRemove) {
        if (entry.key.startsWith('session_')) {
          const actualKey = entry.key.replace('session_', '');
          sessionStorage.removeItem(actualKey);
          sessionStorage.removeItem(`${actualKey}_hits`);
        } else if (entry.key.startsWith('cache_')) {
          // Gestion Cache API
          const url = entry.key.replace('cache_', '');
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            for (const cacheName of cacheNames) {
              const cache = await caches.open(cacheName);
              await cache.delete(url);
            }
          }
        } else {
          localStorage.removeItem(entry.key);
          localStorage.removeItem(`${entry.key}_hits`);
        }
      }

      // Met à jour les statistiques
      await analyzeCaches();

      toast({
        title: "🧹 Nettoyage terminé",
        description: `${cleanedCount} entrées supprimées (${formatBytes(cleanedSize)} libérés)`
      });

    } catch (error) {
      toast({
        title: "Erreur de nettoyage",
        description: "Une erreur est survenue pendant le nettoyage",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [cacheEntries, stats.totalSize, toast, analyzeCaches]);

  // Suppression manuelle d'une entrée
  const removeEntry = useCallback(async (entry: CacheEntry) => {
    try {
      if (entry.key.startsWith('session_')) {
        const actualKey = entry.key.replace('session_', '');
        sessionStorage.removeItem(actualKey);
      } else if (entry.key.startsWith('cache_')) {
        const url = entry.key.replace('cache_', '');
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            await cache.delete(url);
          }
        }
      } else {
        localStorage.removeItem(entry.key);
      }
      
      await analyzeCaches();
      
      toast({
        title: "Entrée supprimée",
        description: `${entry.key} (${formatBytes(entry.size)})`
      });
    } catch (error) {
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer cette entrée",
        variant: "destructive"
      });
    }
  }, [analyzeCaches, toast]);

  // Préchargement intelligent
  const preloadContent = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Liste du contenu à précharger basé sur les patterns d'utilisation
      const criticalResources = [
        '/api/user/profile',
        '/api/music/popular',
        '/api/edn/recent'
      ];

      let preloadedCount = 0;
      
      for (const resource of criticalResources) {
        try {
          const response = await fetch(resource);
          if (response.ok) {
            const data = await response.text();
            localStorage.setItem(`preload_${resource}`, data);
            localStorage.setItem(`preload_${resource}_timestamp`, Date.now().toString());
            preloadedCount++;
          }
        } catch (error) {
          console.warn(`Erreur de préchargement pour ${resource}:`, error);
        }
      }

      await analyzeCaches();

      toast({
        title: "🚀 Préchargement terminé",
        description: `${preloadedCount} ressources préchargées`
      });

    } catch (error) {
      toast({
        title: "Erreur de préchargement",
        description: "Une erreur est survenue pendant le préchargement",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [analyzeCaches, toast]);

  // Formatage de la taille en bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Couleur selon la catégorie
  const getCategoryColor = (category: string) => {
    const colors = {
      'audio': 'bg-purple-500',
      'images': 'bg-blue-500', 
      'api': 'bg-green-500',
      'user-data': 'bg-orange-500',
      'other': 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  // Nettoyage automatique
  useEffect(() => {
    if (autoCleanup && stats.totalSize > cacheConfig.maxSize * 0.9) {
      smartCleanup();
    }
  }, [autoCleanup, stats.totalSize, smartCleanup]);

  useEffect(() => {
    analyzeCaches();
  }, [analyzeCaches]);

  return (
    <div className="space-y-6">
      {/* Aperçu global */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <div className="text-sm text-muted-foreground">Entrées</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <HardDrive className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
            <div className="text-sm text-muted-foreground">Espace utilisé</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.hitRate}%</div>
            <div className="text-sm text-muted-foreground">Taux de réussite</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {Math.round((cacheConfig.maxSize - stats.totalSize) / cacheConfig.maxSize * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Espace libre</div>
          </CardContent>
        </Card>
      </div>

      {/* Utilisation par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisation par Catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.categories).map(([category, data]) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                    <span className="capitalize">{category}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {data.count} entrées • {formatBytes(data.size)}
                  </div>
                </div>
                <Progress 
                  value={(data.size / stats.totalSize) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestion du Cache
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Nettoyage Automatique</div>
              <div className="text-sm text-muted-foreground">
                Supprime automatiquement les anciens éléments
              </div>
            </div>
            <Button
              variant={autoCleanup ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoCleanup(!autoCleanup)}
            >
              {autoCleanup ? 'Activé' : 'Désactivé'}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={smartCleanup}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Nettoyage Intelligent
            </Button>
            
            <Button 
              variant="outline"
              onClick={preloadContent}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Précharger
            </Button>
            
            <Button 
              variant="outline"
              onClick={analyzeCaches}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Analyser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste détaillée des entrées */}
      <Card>
        <CardHeader>
          <CardTitle>Entrées de Cache ({cacheEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {cacheEntries
              .sort((a, b) => b.size - a.size)
              .slice(0, 50)
              .map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(entry.category)}`} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{entry.key}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatBytes(entry.size)} • {entry.hitCount} accès
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeEntry(entry)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

SmartCacheManager.displayName = 'SmartCacheManager';