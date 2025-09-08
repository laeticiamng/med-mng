import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  Share2, 
  Bell, 
  Smartphone, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallPromptProps {
  onInstall: () => void;
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstall, className = "" }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      onInstall();
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={className}
    >
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Installer l'application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Installez MED-MNG sur votre appareil pour un accès rapide et hors ligne.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleInstall} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Installer
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

export const OfflineStatus: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connexion rétablie",
        description: "Vous êtes maintenant en ligne",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Mode hors ligne",
        description: "Certaines fonctionnalités peuvent être limitées",
        variant: "destructive",
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            En ligne
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Hors ligne
          </>
        )}
      </Badge>
    </motion.div>
  );
};

interface BackgroundSyncStatusProps {
  className?: string;
}

export const BackgroundSyncStatus: React.FC<BackgroundSyncStatusProps> = ({ className = "" }) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Simulate background sync
    const syncInterval = setInterval(() => {
      if ('serviceWorker' in navigator && navigator.onLine) {
        setSyncStatus('syncing');
        
        // Simulate sync operation
        setTimeout(() => {
          setSyncStatus('success');
          setLastSync(new Date());
          
          setTimeout(() => {
            setSyncStatus('idle');
          }, 2000);
        }, 1000);
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, []);

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Synchronisation...';
      case 'success':
        return 'Synchronisé';
      case 'error':
        return 'Erreur de sync';
      default:
        return lastSync ? `Dernière sync: ${lastSync.toLocaleTimeString()}` : 'En attente';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {getSyncStatusIcon()}
        <span>{getSyncStatusText()}</span>
      </div>
    </motion.div>
  );
};

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  text, 
  url = window.location.href, 
  className = "" 
}) => {
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papiers",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={`flex items-center gap-2 ${className}`}
    >
      <Share2 className="h-4 w-4" />
      Partager
    </Button>
  );
};

interface NotificationManagerProps {
  className?: string;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({ className = "" }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Non supporté",
        description: "Les notifications ne sont pas supportées sur cet appareil",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez des notifications pour les nouvelles musiques",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer les notifications",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('MED-MNG', {
        body: 'Nouvelle musique disponible !',
        icon: '/favicon.ico',
      });
    }
  };

  if (!isSupported) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Statut des notifications</span>
          <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
            {permission === 'granted' ? 'Activées' : 'Désactivées'}
          </Badge>
        </div>
        
        {permission === 'default' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Activez les notifications pour être informé des nouveautés.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-2">
          {permission !== 'granted' && (
            <Button onClick={requestPermission} size="sm">
              Activer les notifications
            </Button>
          )}
          {permission === 'granted' && (
            <Button onClick={sendTestNotification} variant="outline" size="sm">
              Test de notification
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};