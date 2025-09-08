/**
 * 📱 PWA MANAGER - MED-MNG v3.0
 * Gestionnaire de Progressive Web App avec fonctionnalités avancées
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, Wifi, WifiOff, RefreshCw, Bell } from 'lucide-react';
import { useAppStore } from '@/store';
import { logger } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: PWAInstallPrompt | null;
  registration: ServiceWorkerRegistration | null;
}

// ==========================================
// PWA MANAGER COMPONENT
// ==========================================

export const PWAManager: React.FC = () => {
  const { toast } = useToast();
  const { addNotification } = useAppStore();
  
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null,
    registration: null
  });

  // ==========================================
  // PWA INSTALLATION
  // ==========================================

  const handleInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    const installPrompt = e as PWAInstallPrompt;
    
    setPwaState(prev => ({
      ...prev,
      isInstallable: true,
      installPrompt
    }));

    logger.info('pwa', 'PWA install prompt available');
    
    addNotification({
      type: 'info',
      title: 'Installation disponible',
      message: 'Vous pouvez installer MED-MNG sur votre appareil',
      read: false
    });
  }, [addNotification]);

  const installPWA = useCallback(async () => {
    const { installPrompt } = pwaState;
    
    if (!installPrompt) {
      toast({
        title: 'Installation non disponible',
        description: 'L\'installation n\'est pas disponible sur ce navigateur',
        variant: 'destructive'
      });
      return;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        logger.info('pwa', 'PWA installation accepted');
        setPwaState(prev => ({
          ...prev,
          isInstallable: false,
          isInstalled: true,
          installPrompt: null
        }));
        
        toast({
          title: 'Installation réussie',
          description: 'MED-MNG a été installé sur votre appareil',
        });
      } else {
        logger.info('pwa', 'PWA installation dismissed');
      }
    } catch (error) {
      logger.error('pwa', 'PWA installation failed', { error });
      toast({
        title: 'Erreur d\'installation',
        description: 'Impossible d\'installer l\'application',
        variant: 'destructive'
      });
    }
  }, [pwaState, toast]);

  // ==========================================
  // SERVICE WORKER MANAGEMENT
  // ==========================================

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      logger.warn('pwa', 'Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setPwaState(prev => ({ ...prev, registration }));

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setPwaState(prev => ({ ...prev, isUpdateAvailable: true }));
            
            addNotification({
              type: 'info',
              title: 'Mise à jour disponible',
              message: 'Une nouvelle version de l\'application est disponible',
              read: false
            });
            
            logger.info('pwa', 'Service Worker update available');
          }
        });
      });

      logger.info('pwa', 'Service Worker registered successfully');
    } catch (error) {
      logger.error('pwa', 'Service Worker registration failed', { error });
    }
  }, [addNotification]);

  const updateServiceWorker = useCallback(async () => {
    const { registration } = pwaState;
    
    if (!registration || !registration.waiting) {
      return;
    }

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload after a short delay to ensure new SW is active
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    logger.info('pwa', 'Service Worker update triggered');
  }, [pwaState]);

  // ==========================================
  // NETWORK STATUS
  // ==========================================

  const handleOnlineStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    
    setPwaState(prev => ({ ...prev, isOnline }));
    
    if (isOnline) {
      toast({
        title: 'Connexion rétablie',
        description: 'Vous êtes de nouveau en ligne',
      });
      logger.info('pwa', 'Network connection restored');
    } else {
      toast({
        title: 'Hors ligne',
        description: 'Mode hors ligne activé',
        variant: 'destructive'
      });
      logger.warn('pwa', 'Network connection lost');
    }
  }, [toast]);

  // ==========================================
  // PUSH NOTIFICATIONS
  // ==========================================

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notifications non supportées',
        description: 'Ce navigateur ne supporte pas les notifications',
        variant: 'destructive'
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      toast({
        title: 'Notifications activées',
        description: 'Vous recevrez des notifications importantes',
      });
      logger.info('pwa', 'Notification permission granted');
      return true;
    } else {
      toast({
        title: 'Notifications refusées',
        description: 'Vous pouvez les activer dans les paramètres du navigateur',
        variant: 'destructive'
      });
      logger.warn('pwa', 'Notification permission denied');
      return false;
    }
  }, [toast]);

  const sendTestNotification = useCallback(() => {
    if (Notification.permission === 'granted') {
      new Notification('MED-MNG', {
        body: 'Les notifications fonctionnent correctement !',
        icon: '/favicon-192.png',
        badge: '/favicon-192.png'
      });
      logger.info('pwa', 'Test notification sent');
    }
  }, []);

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    
    // Listen for online/offline events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
                       
    setPwaState(prev => ({ ...prev, isInstalled }));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [handleInstallPrompt, handleOnlineStatus, registerServiceWorker]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Progressive Web App
        </CardTitle>
        <CardDescription>
          Installez MED-MNG pour une expérience optimale
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Statut réseau:</span>
          <Badge variant={pwaState.isOnline ? 'default' : 'destructive'}>
            {pwaState.isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                En ligne
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Hors ligne
              </>
            )}
          </Badge>
        </div>

        {/* Installation Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Installation:</span>
          <Badge variant={pwaState.isInstalled ? 'default' : 'secondary'}>
            {pwaState.isInstalled ? '✅ Installé' : '📱 Non installé'}
          </Badge>
        </div>

        {/* Install Button */}
        {pwaState.isInstallable && !pwaState.isInstalled && (
          <Button 
            onClick={installPWA}
            className="w-full"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Installer l'application
          </Button>
        )}

        {/* Update Button */}
        {pwaState.isUpdateAvailable && (
          <Button 
            onClick={updateServiceWorker}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Mettre à jour l'application
          </Button>
        )}

        {/* Notification Permissions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Notifications:</span>
            <Badge variant={
              Notification.permission === 'granted' ? 'default' :
              Notification.permission === 'denied' ? 'destructive' : 'secondary'
            }>
              {Notification.permission === 'granted' ? '✅ Activées' :
               Notification.permission === 'denied' ? '❌ Refusées' : '⏳ Non configurées'}
            </Badge>
          </div>
          
          {Notification.permission !== 'granted' && (
            <Button 
              onClick={requestNotificationPermission}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Activer les notifications
            </Button>
          )}
          
          {Notification.permission === 'granted' && (
            <Button 
              onClick={sendTestNotification}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Tester les notifications
            </Button>
          )}
        </div>

        {/* PWA Features */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✅ Fonctionne hors ligne</p>
          <p>✅ Installation sur l'écran d'accueil</p>
          <p>✅ Notifications push</p>
          <p>✅ Mise à jour automatique</p>
          <p>✅ Mode plein écran</p>
        </div>
      </CardContent>
    </Card>
  );
};

// ==========================================
// PWA UTILITIES
// ==========================================

export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const canInstallPWA = (): boolean => {
  return 'beforeinstallprompt' in window;
};

export const supportsServiceWorker = (): boolean => {
  return 'serviceWorker' in navigator;
};

export const supportsNotifications = (): boolean => {
  return 'Notification' in window;
};

// ==========================================
// PWA PROVIDER
// ==========================================

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    logger.info('pwa', '📱 PWA Manager initialized', {
      installed: isPWAInstalled(),
      online: isOnline(),
      canInstall: canInstallPWA(),
      serviceWorker: supportsServiceWorker(),
      notifications: supportsNotifications()
    });
  }, []);

  return <>{children}</>;
};

export default PWAManager;