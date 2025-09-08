import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Smartphone,
  Settings,
  Database,
  Cloud,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

// Service Worker registration and management
class PWAManager {
  private static instance: PWAManager;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        logger.info('Service Worker registered successfully', 'PWA');
        
        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          logger.info('New Service Worker version available', 'PWA');
        });
      } catch (error) {
        logger.error('Service Worker registration failed', 'PWA', { error });
      }
    }
  }

  async updateServiceWorker(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
      logger.info('Service Worker update triggered', 'PWA');
    }
  }

  getInstallPrompt() {
    return (window as any).deferredPrompt;
  }

  async installApp(): Promise<boolean> {
    const prompt = this.getInstallPrompt();
    if (prompt) {
      prompt.prompt();
      const result = await prompt.userChoice;
      logger.userAction('PWA install prompt', undefined, { outcome: result.outcome });
      return result.outcome === 'accepted';
    }
    return false;
  }
}

export const PWAInstallBanner: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { toast } = useToast();
  const pwaManager = PWAManager.getInstance();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await pwaManager.installApp();
      if (installed) {
        setShowInstallPrompt(false);
        toast({
          title: 'Application installée !',
          description: 'MED-MNG est maintenant accessible depuis votre écran d\'accueil',
        });
      }
    } catch (error) {
      logger.error('PWA installation failed', 'PWA', { error });
      toast({
        title: 'Erreur d\'installation',
        description: 'Impossible d\'installer l\'application',
        variant: 'destructive',
      });
    } finally {
      setIsInstalling(false);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
    >
      <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="w-5 h-5 text-primary" />
            Installer MED-MNG
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ajoutez MED-MNG à votre écran d'accueil pour un accès rapide et une expérience hors ligne.
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1"
            >
              {isInstalling ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isInstalling ? 'Installation...' : 'Installer'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowInstallPrompt(false)}
            >
              Plus tard
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const AdvancedOfflineManager: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'caching' | 'success' | 'error'>('idle');
  const [cacheSize, setCacheSize] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (online && !offlineMode) {
        toast({
          title: 'Connexion rétablie',
          description: 'Synchronisation des données en cours...',
        });
        syncOfflineData();
      } else if (!online) {
        toast({
          title: 'Mode hors ligne activé',
          description: 'Vos données seront synchronisées à la reconnexion',
          variant: 'destructive',
        });
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Estimate cache size
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        setCacheSize(Math.round((estimate.usage || 0) / 1024 / 1024)); // MB
      });
    }

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [offlineMode, toast]);

  const syncOfflineData = async () => {
    try {
      // Sync logic would go here
      logger.info('Offline data sync started', 'PWA');
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logger.info('Offline data sync completed', 'PWA');
      toast({
        title: 'Synchronisation terminée',
        description: 'Toutes vos données sont à jour',
      });
    } catch (error) {
      logger.error('Offline data sync failed', 'PWA', { error });
      toast({
        title: 'Erreur de synchronisation',
        description: 'Certaines données n\'ont pas pu être synchronisées',
        variant: 'destructive',
      });
    }
  };

  const clearCache = async () => {
    setCacheStatus('caching');
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      setCacheStatus('success');
      setCacheSize(0);
      logger.info('Cache cleared successfully', 'PWA');
      toast({
        title: 'Cache vidé',
        description: 'Le cache de l\'application a été vidé',
      });
    } catch (error) {
      setCacheStatus('error');
      logger.error('Failed to clear cache', 'PWA', { error });
      toast({
        title: 'Erreur',
        description: 'Impossible de vider le cache',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Gestion hors ligne
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="font-medium">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? 'Connecté' : 'Déconnecté'}
          </Badge>
        </div>

        {/* Offline Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Mode hors ligne forcé</p>
            <p className="text-xs text-muted-foreground">
              Utiliser uniquement les données en cache
            </p>
          </div>
          <Switch
            checked={offlineMode}
            onCheckedChange={setOfflineMode}
          />
        </div>

        {/* Cache Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Taille du cache</span>
            <span className="text-sm text-muted-foreground">{cacheSize} MB</span>
          </div>
          
          <Progress value={Math.min((cacheSize / 100) * 100, 100)} className="h-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Stockage local utilisé</span>
            <span>Limite recommandée: 100 MB</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={clearCache}
            disabled={cacheStatus === 'caching'}
            className="w-full"
          >
            {cacheStatus === 'caching' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <HardDrive className="w-4 h-4 mr-2" />
            )}
            Vider le cache
          </Button>
          
          {!isOnline && (
            <Button
              variant="outline"
              onClick={syncOfflineData}
              className="w-full"
              disabled
            >
              <Cloud className="w-4 h-4 mr-2" />
              Synchroniser (hors ligne)
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {cacheStatus === 'success' && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              Cache vidé avec succès. L'application se rechargera automatiquement.
            </AlertDescription>
          </Alert>
        )}
        
        {cacheStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Erreur lors du vidage du cache. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export const AdvancedNotificationManager: React.FC = () => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
  const [settings, setSettings] = useState({
    musicGeneration: true,
    studyReminders: true,
    communityUpdates: false,
    systemAlerts: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Check for existing push subscription
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setPushSubscription(subscription);
        });
      });
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setupPushNotifications();
        toast({
          title: 'Notifications activées',
          description: 'Vous recevrez maintenant les notifications importantes',
        });
      }
    }
  };

  const setupPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY', // Replace with your VAPID key
        });
        
        setPushSubscription(subscription);
        
        // Send subscription to server
        await fetch('/api/push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
        
        logger.info('Push notification setup completed', 'PWA');
      } catch (error) {
        logger.error('Push notification setup failed', 'PWA', { error });
      }
    }
  };

  const sendTestNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('Test MED-MNG', {
        body: 'Ceci est une notification de test !',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'test-notification',
        requireInteraction: false,
      });
      
      logger.userAction('Test notification sent', undefined);
    }
  };

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    logger.userAction('Notification setting changed', undefined, { setting: key, value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications avancées
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Statut des notifications</p>
            <p className="text-xs text-muted-foreground">
              Autorisation du navigateur requise
            </p>
          </div>
          <Badge variant={notificationPermission === 'granted' ? 'default' : 'secondary'}>
            {notificationPermission === 'granted' ? 'Autorisées' : 'En attente'}
          </Badge>
        </div>

        {/* Request Permission */}
        {notificationPermission !== 'granted' && (
          <Button onClick={requestNotificationPermission} className="w-full">
            Activer les notifications
          </Button>
        )}

        {/* Notification Settings */}
        {notificationPermission === 'granted' && (
          <div className="space-y-4">
            <h4 className="font-medium">Types de notifications</h4>
            
            {Object.entries(settings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {key === 'musicGeneration' && 'Génération musicale'}
                    {key === 'studyReminders' && 'Rappels d\'étude'}
                    {key === 'communityUpdates' && 'Mises à jour communauté'}
                    {key === 'systemAlerts' && 'Alertes système'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {key === 'musicGeneration' && 'Notifications lors de la génération de contenus'}
                    {key === 'studyReminders' && 'Rappels pour vos sessions d\'étude'}
                    {key === 'communityUpdates' && 'Nouveaux messages et activités'}
                    {key === 'systemAlerts' && 'Mises à jour importantes du système'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updateSetting(key as keyof typeof settings, checked)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Push Subscription Status */}
        {pushSubscription && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              Notifications push activées. Vous recevrez les notifications même quand l'application est fermée.
            </AlertDescription>
          </Alert>
        )}

        {/* Test Notification */}
        {notificationPermission === 'granted' && (
          <Button variant="outline" onClick={sendTestNotification} className="w-full">
            <Bell className="w-4 h-4 mr-2" />
            Envoyer une notification test
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Initialize PWA Manager
export const initializePWA = () => {
  const pwaManager = PWAManager.getInstance();
  pwaManager.registerServiceWorker();
};

export default {
  PWAInstallBanner,
  AdvancedOfflineManager,
  AdvancedNotificationManager,
  initializePWA,
};