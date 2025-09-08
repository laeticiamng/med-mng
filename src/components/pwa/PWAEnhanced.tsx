/**
 * 📱 PWA ENHANCED MANAGER - MED-MNG v3.0
 * Gestionnaire PWA avancé avec toutes les fonctionnalités modernes
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Download, 
  Bell, 
  BellOff, 
  Wifi, 
  WifiOff, 
  Smartphone,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

import { logger } from '@/lib/logger';
import { useAppStore } from '@/stores/appStore';
import { toast } from '@/hooks/use-toast';

// ==========================================
// TYPES ET INTERFACES
// ==========================================

interface PWACapabilities {
  installable: boolean;
  notifications: boolean;
  offline: boolean;
  backgroundSync: boolean;
  pushManager: boolean;
  serviceWorker: boolean;
  cacheAPI: boolean;
  geolocation: boolean;
  camera: boolean;
  microphone: boolean;
}

interface PWAMetrics {
  cacheSize: number;
  offlineRequests: number;
  syncQueueSize: number;
  lastUpdate: string;
  version: string;
  installDate?: string;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  notificationsEnabled: boolean;
  notificationsPermission: NotificationPermission;
  updateAvailable: boolean;
  capabilities: PWACapabilities;
  metrics: PWAMetrics;
  isLoading: boolean;
}

// ==========================================
// PWA ENHANCED COMPONENT
// ==========================================

export const PWAEnhanced: React.FC = () => {
  const { addNotification } = useAppStore();
  const deferredPrompt = useRef<any>(null);
  
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    notificationsEnabled: false,
    notificationsPermission: 'default',
    updateAvailable: false,
    capabilities: {
      installable: false,
      notifications: 'Notification' in window,
      offline: 'serviceWorker' in navigator,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      pushManager: 'serviceWorker' in navigator && 'PushManager' in window,
      serviceWorker: 'serviceWorker' in navigator,
      cacheAPI: 'caches' in window,
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    },
    metrics: {
      cacheSize: 0,
      offlineRequests: 0,
      syncQueueSize: 0,
      lastUpdate: new Date().toISOString(),
      version: '3.0.0',
    },
    isLoading: false
  });

  // ==========================================
  // DÉTECTION PWA ET CAPACITÉS
  // ==========================================

  useEffect(() => {
    detectPWACapabilities();
    setupEventListeners();
    checkServiceWorkerStatus();
    loadPWAMetrics();
    
    return () => {
      cleanup();
    };
  }, []);

  const detectPWACapabilities = useCallback(async () => {
    logger.info('pwa', '🔍 Detecting PWA capabilities');
    
    // Vérifier si l'app est installée
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    // Vérifier les permissions de notification
    const notificationPermission = Notification.permission;
    const notificationsEnabled = notificationPermission === 'granted';

    setPWAState(prev => ({
      ...prev,
      isInstalled,
      notificationsEnabled,
      notificationsPermission: notificationPermission,
      capabilities: {
        ...prev.capabilities,
        installable: !isInstalled && 'beforeinstallprompt' in window,
      }
    }));

    logger.info('pwa', '✅ PWA capabilities detected', {
      isInstalled,
      notificationsEnabled,
      capabilities: pwaState.capabilities
    });
  }, []);

  const setupEventListeners = useCallback(() => {
    // Écouter l'événement d'installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setPWAState(prev => ({ ...prev, isInstallable: true }));
      logger.info('pwa', '📱 Install prompt available');
    };

    // Écouter les changements de connectivité
    const handleOnline = () => {
      setPWAState(prev => ({ ...prev, isOnline: true }));
      addNotification({
        type: 'success',
        message: 'Connexion rétablie'
      });
      logger.info('pwa', '🌐 Back online');
    };

    const handleOffline = () => {
      setPWAState(prev => ({ ...prev, isOnline: false }));
      addNotification({
        type: 'warning',
        message: 'Mode hors ligne activé'
      });  
      logger.warn('pwa', '📴 Gone offline');
    };

    // Écouter les mises à jour du Service Worker
    const handleServiceWorkerUpdate = () => {
      setPWAState(prev => ({ ...prev, updateAvailable: true }));
      addNotification({
        type: 'info',
        message: 'Mise à jour disponible'
      });
      logger.info('pwa', '🔄 Update available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addNotification]);

  const checkServiceWorkerStatus = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          logger.info('pwa', '🔧 Service Worker registered');
          
          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            setPWAState(prev => ({ ...prev, updateAvailable: true }));
          });
        }
      } catch (error) {
        logger.error('pwa', 'Service Worker check failed', error);
      }
    }
  }, []);

  const loadPWAMetrics = useCallback(async () => {
    try {
      // Calculer la taille du cache
      let cacheSize = 0;
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          cacheSize += requests.length;
        }
      }

      // Charger les métriques depuis localStorage
      const storedMetrics = localStorage.getItem('pwa-metrics');
      const metrics = storedMetrics ? JSON.parse(storedMetrics) : {};

      setPWAState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          cacheSize,
          ...metrics,
          lastUpdate: new Date().toISOString()
        }
      }));

      logger.debug('pwa', 'PWA metrics loaded', { cacheSize, ...metrics });
    } catch (error) {
      logger.error('pwa', 'Failed to load PWA metrics', error);
    }
  }, []);

  // ==========================================
  // ACTIONS PWA
  // ==========================================

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;

    setPWAState(prev => ({ ...prev, isLoading: true }));

    try {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      
      if (outcome === 'accepted') {
        addNotification({
          type: 'success',
          message: 'Application installée avec succès!'
        });
        
        setPWAState(prev => ({
          ...prev,
          isInstalled: true,
          isInstallable: false
        }));

        // Sauvegarder la date d'installation
        const installDate = new Date().toISOString();
        localStorage.setItem('pwa-install-date', installDate);
        
        logger.info('pwa', '✅ PWA installed successfully');
      }
      
      deferredPrompt.current = null;
    } catch (error) {
      logger.error('pwa', 'Installation failed', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors de l\'installation'
      });
    } finally {
      setPWAState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addNotification]);

  const handleNotificationToggle = useCallback(async () => {
    if (!pwaState.capabilities.notifications) {
      toast({
        title: "Notifications non supportées",
        description: "Votre navigateur ne supporte pas les notifications.",
        variant: "destructive"
      });
      return;
    }

    if (pwaState.notificationsEnabled) {
      // Désactiver les notifications (guide utilisateur)
      toast({
        title: "Désactiver les notifications",
        description: "Allez dans les paramètres de votre navigateur pour désactiver les notifications.",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setPWAState(prev => ({ 
          ...prev, 
          notificationsEnabled: true,
          notificationsPermission: 'granted'
        }));

        // Notification de test
        new Notification('MED-MNG', {
          body: 'Notifications activées avec succès!',
          icon: '/favicon.ico',
          tag: 'pwa-notification-test'
        });

        logger.info('pwa', '🔔 Notifications enabled');
      } else {
        toast({
          title: "Permission refusée",
          description: "Les notifications ont été refusées.",
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error('pwa', 'Notification permission failed', error);
    }
  }, [pwaState.capabilities.notifications, pwaState.notificationsEnabled]);

  const handleUpdate = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      } catch (error) {
        logger.error('pwa', 'Update failed', error);
      }
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        addNotification({
          type: 'success',
          message: 'Cache vidé avec succès'
        });

        await loadPWAMetrics();
        logger.info('pwa', '🗑️ Cache cleared');
      }
    } catch (error) {
      logger.error('pwa', 'Clear cache failed', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors du vidage du cache'
      });
    }
  }, [addNotification, loadPWAMetrics]);

  const cleanup = useCallback(() => {
    // Cleanup des listeners et ressources
  }, []);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            État PWA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={pwaState.isInstalled ? 'default' : 'secondary'}>
                {pwaState.isInstalled ? 'Installée' : 'Non installée'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {pwaState.isOnline ? (
                <><Wifi className="h-4 w-4 text-green-500" /> En ligne</>
              ) : (
                <><WifiOff className="h-4 w-4 text-orange-500" /> Hors ligne</>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pwaState.notificationsEnabled ? (
                <><Bell className="h-4 w-4 text-blue-500" /> Notifications</>
              ) : (
                <><BellOff className="h-4 w-4 text-gray-400" /> Pas de notifications</>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pwaState.updateAvailable ? (
                <><RefreshCw className="h-4 w-4 text-orange-500" /> Mise à jour</>
              ) : (
                <><CheckCircle className="h-4 w-4 text-green-500" /> À jour</>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Installation */}
        {pwaState.isInstallable && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Installation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Installez MED-MNG sur votre appareil pour une expérience native.
              </p>
              <Button 
                onClick={handleInstall}
                disabled={pwaState.isLoading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Installer l'application
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Notifications push</span>
              <Switch
                checked={pwaState.notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
                disabled={!pwaState.capabilities.notifications}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {pwaState.capabilities.notifications 
                ? 'Recevez des notifications pour vos méditations'
                : 'Notifications non supportées par votre navigateur'
              }
            </p>
          </CardContent>
        </Card>

        {/* Mise à jour */}
        {pwaState.updateAvailable && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Mise à jour disponible
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Une nouvelle version de MED-MNG est disponible.
              </p>
              <Button onClick={handleUpdate} className="w-full">
                Mettre à jour maintenant
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cache Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cache et stockage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Éléments en cache:</span>
                <span>{pwaState.metrics.cacheSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Version:</span>
                <span>{pwaState.metrics.version}</span>
              </div>
            </div>
            <Button onClick={clearCache} variant="outline" size="sm" className="w-full">
              Vider le cache
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Capacités PWA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(pwaState.capabilities).map(([key, supported]) => (
              <div key={key} className="flex items-center gap-2">
                {supported ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAEnhanced;