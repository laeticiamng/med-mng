/**
 * Hook pour les notifications de génération
 * ✅ NOUVEAU: Gestion des notifications navigateur + toast
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseGenerationNotificationsOptions {
  enabled?: boolean;
  autoRequestPermission?: boolean;
}

export const useGenerationNotifications = (options: UseGenerationNotificationsOptions = {}) => {
  const { enabled = true, autoRequestPermission = true } = options;
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  // Vérifier le support et la permission au montage
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Demander la permission automatiquement
      if (autoRequestPermission && Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, [autoRequestPermission]);

  // Demander la permission manuellement
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Les notifications ne sont pas supportées par votre navigateur');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications activées !');
        return true;
      } else if (result === 'denied') {
        toast.error('Notifications refusées. Activez-les dans les paramètres du navigateur.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Erreur demande permission:', error);
      return false;
    }
  }, [isSupported]);

  // Envoyer une notification
  const notify = useCallback((title: string, options?: NotificationOptions): boolean => {
    if (!enabled || !isSupported || permission !== 'granted') {
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto-close après 5 secondes
      setTimeout(() => notification.close(), 5000);

      // Clic sur la notification = focus sur l'onglet
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      return false;
    }
  }, [enabled, isSupported, permission]);

  // Notifier génération complète
  const notifyGenerationComplete = useCallback((trackTitle?: string, rang?: string) => {
    const title = '🎵 Musique prête !';
    const body = trackTitle 
      ? `"${trackTitle}" ${rang ? `(Rang ${rang})` : ''} est disponible`
      : 'Votre musique a été générée avec succès';

    notify(title, { body, tag: 'generation-complete' });
    
    // Aussi un toast pour les utilisateurs sans notification
    toast.success(title, { description: body });
  }, [notify]);

  // Notifier erreur génération
  const notifyGenerationError = useCallback((errorMessage?: string) => {
    const title = '❌ Échec de génération';
    const body = errorMessage || 'Une erreur est survenue lors de la génération';

    notify(title, { body, tag: 'generation-error' });
    toast.error(title, { description: body });
  }, [notify]);

  // Notifier génération démarrée
  const notifyGenerationStarted = useCallback((rang?: string) => {
    toast.info('🎵 Génération démarrée', {
      description: `Création de votre musique ${rang ? `Rang ${rang}` : ''}. Cela peut prendre 2-3 minutes.`
    });
  }, []);

  return {
    // État
    isSupported,
    permission,
    canNotify: isSupported && permission === 'granted',
    
    // Actions
    requestPermission,
    notify,
    notifyGenerationComplete,
    notifyGenerationError,
    notifyGenerationStarted
  };
};
