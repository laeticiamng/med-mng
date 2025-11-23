/**
 * Dialog pour demander la permission des notifications push
 * Design moderne avec animations et semantic tokens
 */

import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { pushNotifications } from '@shared/services/pushNotifications';
import { useToast } from '@/hooks/use-toast';

interface NotificationPermissionDialogProps {
  autoShow?: boolean;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export const NotificationPermissionDialog = ({
  autoShow = false,
  onPermissionGranted,
  onPermissionDenied,
}: NotificationPermissionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si on doit afficher automatiquement la dialog
    if (autoShow && pushNotifications.isSupported()) {
      const permission = pushNotifications.getPermissionStatus();
      
      // Afficher seulement si la permission n'a pas encore été demandée
      if (permission === 'default') {
        // Attendre 3 secondes après le chargement de la page
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [autoShow]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const permission = await pushNotifications.requestPermission();
      
      if (permission === 'granted') {
        toast({
          title: '✅ Notifications activées',
          description: 'Vous recevrez des alertes pour les nouvelles EDN et fonctionnalités.',
        });
        
        // Afficher une notification de test
        await pushNotifications.showNotification({
          title: '🎉 Bienvenue sur MED-MNG',
          body: 'Vous recevrez maintenant des notifications pour rester à jour !',
          icon: '/pwa-192x192.png',
        });
        
        onPermissionGranted?.();
        setIsOpen(false);
      } else {
        toast({
          title: '⚠️ Notifications désactivées',
          description: 'Vous pouvez les activer plus tard dans les paramètres de votre navigateur.',
          variant: 'destructive',
        });
        onPermissionDenied?.();
        setIsOpen(false);
      }
    } catch (error) {
      logger.error('Erreur lors de la demande de permission:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'activer les notifications.',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    onPermissionDenied?.();
  };

  if (!pushNotifications.isSupported()) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-foreground">
            Restez à jour avec MED-MNG
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Recevez des notifications pour les nouvelles EDN, fonctionnalités et rappels d'étude.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Avantages */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-success" />
              </div>
              <p className="text-sm text-foreground">
                <strong>Nouvelles EDN</strong> ajoutées à la plateforme
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-success" />
              </div>
              <p className="text-sm text-foreground">
                <strong>Fonctionnalités</strong> et améliorations
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-success" />
              </div>
              <p className="text-sm text-foreground">
                <strong>Rappels</strong> d'étude personnalisés
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              {isRequesting ? 'Activation...' : 'Activer les notifications'}
            </Button>
            
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Plus tard
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Vous pouvez modifier ce paramètre à tout moment dans les réglages de votre navigateur.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
