import logger from '@/lib/logger';
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Détecter si déjà installé (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Vérifier si l'utilisateur n'a pas déjà dismissé
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed && !standalone) {
        // Attendre un peu avant d'afficher le prompt
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Afficher pour iOS après un délai
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('pwa-install-dismissed-ios');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          toast.success('Application installée avec succès !');
        }
        
        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {
        logger.error('Erreur installation PWA:', error);
        toast.error('Erreur lors de l\'installation');
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa-install-dismissed-ios', 'true');
    } else {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // Ne pas afficher si déjà installé ou si le prompt n'est pas prêt
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-50 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 md:hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">
              {isIOS ? 'Ajouter à l\'écran d\'accueil' : 'Installer l\'application'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isIOS 
                ? 'Appuyez sur le bouton de partage puis "Sur l\'écran d\'accueil"'
                : 'Accédez rapidement à MedMNG depuis votre écran d\'accueil'
              }
            </p>
            
            {!isIOS && (
              <Button 
                size="sm" 
                className="mt-2 h-8 text-xs"
                onClick={handleInstallClick}
              >
                <Download className="h-3 w-3 mr-1" />
                Installer
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-6 w-6 p-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook pour gérer l'état PWA
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Vérifier si installé
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(standalone);

    // Écouter les changements
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { isInstalled, isInstallable };
}