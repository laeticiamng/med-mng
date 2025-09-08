/**
 * 📱 PWA MANAGER AVANCÉ - MED-MNG v3.0
 * Gestionnaire PWA complet avec installation et notifications push
 */

import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Download, Bell, BellOff, Wifi, WifiOff } from 'lucide-react';

// ==========================================
// INTERFACES PWA
// ==========================================

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  notificationsEnabled: boolean;
  updateAvailable: boolean;
}

// ==========================================
// PWA UTILITIES
// ==========================================

const PWAUtils = {
  isPWAInstalled: (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },

  isNotificationSupported: (): boolean => {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },

  requestNotificationPermission: async (): Promise<boolean> => {
    if (!PWAUtils.isNotificationSupported()) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  isOnline: (): boolean => navigator.onLine
};

// ==========================================
// COMPOSANT PWA MANAGER
// ==========================================

export const PWAManager: React.FC = () => {
  const { addNotification, trackUserAction } = useAppStore();
  
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: PWAUtils.isPWAInstalled(),
    isOnline: PWAUtils.isOnline(),
    notificationsEnabled: Notification.permission === 'granted',
    updateAvailable: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Installation PWA
  const handleInstallPrompt = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        trackUserAction('pwa_installed');
        addNotification({
          type: 'success',
          title: 'Application installée',
          message: 'L\'application a été installée avec succès!'
        });
        
        setPWAState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      }
      
      setDeferredPrompt(null);
      
    } catch (error) {
      logger.error('pwa', 'Installation failed', error);
    }
  }, [deferredPrompt, trackUserAction, addNotification]);

  // Gestion des notifications
  const handleNotificationToggle = useCallback(async () => {
    if (pwaState.notificationsEnabled) {
      addNotification({
        type: 'info',
        title: 'Notifications désactivées',
        message: 'Désactivez les notifications dans les paramètres du navigateur.'
      });
    } else {
      const granted = await PWAUtils.requestNotificationPermission();
      
      if (granted) {
        setPWAState(prev => ({ ...prev, notificationsEnabled: true }));
        trackUserAction('notifications_enabled');
      }
    }
  }, [pwaState.notificationsEnabled, addNotification, trackUserAction]);

  useEffect(() => {
    // Listener pour l'installation PWA
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPWAState(prev => ({ ...prev, isInstallable: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  return (
    <div className="pwa-manager">
      <div className="flex items-center gap-2 mb-4">
        {pwaState.isOnline ? (
          <div className="flex items-center gap-1 text-green-600">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">En ligne</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-orange-600">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">Hors ligne</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {pwaState.isInstallable && !pwaState.isInstalled && (
          <Button
            onClick={handleInstallPrompt}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Installer l'application
          </Button>
        )}

        {PWAUtils.isNotificationSupported() && (
          <Button
            onClick={handleNotificationToggle}
            variant={pwaState.notificationsEnabled ? "default" : "outline"}
            className="w-full flex items-center gap-2"
          >
            {pwaState.notificationsEnabled ? (
              <>
                <Bell className="h-4 w-4" />
                Notifications activées
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4" />
                Activer les notifications
              </>
            )}
          </Button>
        )}
      </div>

      {pwaState.isInstalled && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 font-medium">
            ✓ Application installée
          </p>
        </div>
      )}
    </div>
  );
};

export default PWAManager;