/**
 * 📱 PWA AMÉLIORÉ - MED-MNG v3.0
 * Gestionnaire PWA complet avec notifications, mise à jour et installation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Download, 
  Smartphone, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle,
  Zap,
  Monitor,
  Battery,
  Signal
} from 'lucide-react';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

interface PWAEnhancedProps {
  className?: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAEnhanced: React.FC<PWAEnhancedProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  }>({});

  const { announce } = useAccessibility();

  // Check if app is installed
  const checkInstallation = useCallback(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInstalled = isStandalone || isInWebAppiOS;
    setIsInstalled(isInstalled);
    return isInstalled;
  }, []);

  // Network information
  const updateNetworkInfo = useCallback(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      });
    }
  }, []);

  useEffect(() => {
    checkInstallation();
    updateNetworkInfo();

    // Online/Offline handlers
    const handleOnline = () => {
      setIsOnline(true);
      announce('Connexion internet rétablie', 'polite');
      toast({
        title: 'Connexion rétablie',
        description: 'Vous êtes maintenant en ligne',
        variant: 'default'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      announce('Connexion internet perdue', 'assertive');
      toast({
        title: 'Mode hors ligne',
        description: 'Certaines fonctionnalités peuvent être limitées',
        variant: 'destructive'
      });
    };

    // Install prompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // App installed handler
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      announce('Application installée avec succès', 'assertive');
      toast({
        title: 'Installation réussie',
        description: 'MED-MNG est maintenant installé sur votre appareil',
        variant: 'default'
      });
    };

    // Service Worker update handler
    const handleSWUpdate = () => {
      setUpdateAvailable(true);
      announce('Mise à jour disponible', 'polite');
      toast({
        title: 'Mise à jour disponible',
        description: 'Une nouvelle version de l\'application est prête',
        variant: 'default'
      });
    };

    // Network change handler
    const handleConnectionChange = () => {
      updateNetworkInfo();
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Service Worker registration for updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate);
      }
    };
  }, [announce, checkInstallation, updateNetworkInfo]);

  // Install app
  const handleInstall = async () => {
    if (!installPrompt) return;
    
    setIsInstalling(true);
    setInstallProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setInstallProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      clearInterval(progressInterval);
      setInstallProgress(100);

      if (outcome === 'accepted') {
        announce('Installation de l\'application en cours', 'polite');
        setTimeout(() => {
          setIsInstalled(true);
          setInstallPrompt(null);
        }, 1000);
      } else {
        announce('Installation annulée', 'polite');
      }
    } catch (error) {
      console.error('Installation failed:', error);
      announce('Erreur lors de l\'installation', 'assertive');
      toast({
        title: 'Erreur d\'installation',
        description: 'Impossible d\'installer l\'application',
        variant: 'destructive'
      });
    } finally {
      setIsInstalling(false);
      setTimeout(() => setInstallProgress(0), 2000);
    }
  };

  // Request notification permission
  const handleNotificationPermission = async () => {
    if (notificationPermission === 'granted') {
      // Disable notifications
      setNotificationPermission('denied');
      announce('Notifications désactivées', 'polite');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        announce('Notifications activées', 'polite');
        toast({
          title: 'Notifications activées',
          description: 'Vous recevrez des notifications importantes',
          variant: 'default'
        });
        
        // Send test notification
        new Notification('MED-MNG', {
          body: 'Notifications activées avec succès!',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } else {
        announce('Notifications refusées', 'polite');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  // Update app
  const handleUpdate = async () => {
    if (!updateAvailable) return;
    
    setIsUpdating(true);
    announce('Mise à jour en cours', 'polite');

    try {
      // Force service worker update
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        await registration?.update();
      }

      // Reload page after update
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      toast({
        title: 'Mise à jour en cours',
        description: 'L\'application va redémarrer automatiquement',
        variant: 'default'
      });
    } catch (error) {
      console.error('Update failed:', error);
      announce('Erreur lors de la mise à jour', 'assertive');
      toast({
        title: 'Erreur de mise à jour',
        description: 'Impossible de mettre à jour l\'application',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getConnectionQuality = () => {
    if (!isOnline) return { label: 'Hors ligne', color: 'text-destructive' };
    
    const { effectiveType } = networkInfo;
    switch (effectiveType) {
      case '4g':
        return { label: 'Excellente', color: 'text-success' };
      case '3g':
        return { label: 'Bonne', color: 'text-warning' };
      case '2g':
        return { label: 'Lente', color: 'text-destructive' };
      default:
        return { label: 'Inconnue', color: 'text-muted-foreground' };
    }
  };

  const connectionQuality = getConnectionQuality();

  return (
    <Card className={`medical-card-premium ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" aria-hidden="true" />
          Application Progressive (PWA)
          {isInstalled && (
            <Badge variant="secondary" className="text-success">
              <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
              Installée
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Installez MED-MNG pour une expérience native complète
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-success" aria-hidden="true" />
              ) : (
                <WifiOff className="w-4 h-4 text-destructive" aria-hidden="true" />
              )}
              Connexion
            </span>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Badge>
          </div>

          {isOnline && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Qualité:</span>
                <span className={connectionQuality.color}>{connectionQuality.label}</span>
              </div>
              {networkInfo.downlink && (
                <div className="flex justify-between">
                  <span>Débit:</span>
                  <span>{networkInfo.downlink} Mbps</span>
                </div>
              )}
              {networkInfo.rtt && (
                <div className="flex justify-between">
                  <span>Latence:</span>
                  <span>{networkInfo.rtt}ms</span>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Installation */}
        {!isInstalled && installPrompt && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Installation</span>
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                size="sm"
                className="medical-btn-primary"
              >
                {isInstalling ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Installation...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                    Installer
                  </>
                )}
              </Button>
            </div>

            {isInstalling && (
              <div className="space-y-2">
                <Progress value={installProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Installation en cours... {installProgress}%
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>L'installation permet d'utiliser l'app comme une application native</p>
            </div>
          </div>
        )}

        {isInstalled && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">Application installée</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Vous pouvez maintenant utiliser MED-MNG comme une app native
            </p>
          </div>
        )}

        <Separator />

        {/* Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              {notificationPermission === 'granted' ? (
                <Bell className="w-4 h-4 text-primary" aria-hidden="true" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              )}
              Notifications
            </span>
            <Button
              onClick={handleNotificationPermission}
              variant="outline"
              size="sm"
            >
              {notificationPermission === 'granted' ? 'Désactiver' : 'Activer'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              {notificationPermission === 'granted'
                ? 'Vous recevrez des notifications importantes'
                : 'Activez les notifications pour ne rien manquer'
              }
            </p>
          </div>
        </div>

        <Separator />

        {/* Updates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
              Mises à jour
            </span>
            {updateAvailable ? (
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                size="sm"
                className="medical-btn-primary"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                    Mettre à jour
                  </>
                )}
              </Button>
            ) : (
              <Badge variant="secondary">
                <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                À jour
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              {updateAvailable
                ? 'Une nouvelle version est disponible'
                : 'Votre application est à jour'
              }
            </p>
          </div>
        </div>

        {/* Capabilities */}
        <Separator />
        
        <div className="space-y-2">
          <span className="text-sm font-medium">Fonctionnalités PWA</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" aria-hidden="true" />
              <span>Mode hors ligne</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" aria-hidden="true" />
              <span>Installation native</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" aria-hidden="true" />
              <span>Notifications push</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" aria-hidden="true" />
              <span>Mise à jour auto</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};