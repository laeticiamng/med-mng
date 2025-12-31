import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, RefreshCw, Wifi, WifiOff, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAPrompt: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isOffline,
    needRefresh,
    offlineReady,
    installApp,
    updateServiceWorker,
    dismissUpdate,
    dismissOfflineReady,
  } = usePWA();

  // Install prompt
  if (isInstallable && !isInstalled) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-primary/30 bg-card/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Installer MED-MNG</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Installez l'app pour un accès rapide et une utilisation hors-ligne
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={installApp} className="gap-1">
                  <Download className="h-3 w-3" />
                  Installer
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {}}>
                  Plus tard
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Update available
  if (needRefresh) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-accent/30 bg-card/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <RefreshCw className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Mise à jour disponible</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Une nouvelle version de l'app est disponible
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => updateServiceWorker(true)} className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Mettre à jour
                </Button>
                <Button size="sm" variant="ghost" onClick={dismissUpdate}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Offline ready notification
  if (offlineReady) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-success/30 bg-card/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Wifi className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Prêt pour le hors-ligne !</h4>
              <p className="text-xs text-muted-foreground mt-1">
                L'app peut maintenant fonctionner sans connexion internet
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={dismissOfflineReady}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Offline indicator
  if (isOffline) {
    return (
      <Card className="fixed top-4 left-1/2 -translate-x-1/2 z-50 border-warning/30 bg-warning/10 backdrop-blur-sm shadow-lg">
        <CardContent className="p-2 px-4 flex items-center gap-2">
          <WifiOff className="h-4 w-4 text-warning" />
          <span className="text-xs font-medium text-warning">Mode hors-ligne</span>
        </CardContent>
      </Card>
    );
  }

  return null;
};
