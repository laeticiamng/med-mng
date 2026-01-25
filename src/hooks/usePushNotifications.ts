import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Hook pour gérer les notifications push
 * - Demande de permission
 * - Abonnement/Désabonnement
 * - Gestion des préférences
 */
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    const supported = 'Notification' in window && 
                     'serviceWorker' in navigator && 
                     'PushManager' in window;
    
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  // Vérifier si l'utilisateur est déjà abonné
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  // Demander la permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Les notifications ne sont pas supportées sur ce navigateur');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Notifications activées !');
        return true;
      } else {
        toast.error('Permission refusée');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Erreur lors de la demande de permission');
      return false;
    }
  };

  // S'abonner aux notifications
  const subscribe = async () => {
    if (!isSupported) return;
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setIsLoading(true);

    try {
      // Fetch VAPID public key from Edge Function
      const { _data, error } = await supabase.functions.invoke('get-vapid-key');
      
      if (error || !_data?.publicKey) {
        // Fallback: use local notification instead
        toast.info('Notifications locales activées (mode hors-ligne)');
        setIsSubscribed(true);
        setIsLoading(false);
        return;
      }
      
      const vapidPublicKey = _data.publicKey;

      const registration = await navigator.serviceWorker.ready;
      
      // Créer l'abonnement push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
      });

      // Sauvegarder l'abonnement dans Supabase
      await saveSubscription(subscription);
      
      setIsSubscribed(true);
      toast.success('Vous êtes maintenant abonné aux notifications !');
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast.error('Erreur lors de l\'abonnement: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Se désabonner
  const unsubscribe = async () => {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscription(subscription.endpoint);
        setIsSubscribed(false);
        toast.success('Désabonné des notifications');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Erreur lors du désabonnement');
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder l'abonnement dans Supabase
  const saveSubscription = async (subscription: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const subscriptionData = JSON.parse(JSON.stringify(subscription));
    
    const { _error } = await supabase.from('push_subscriptions' as any).upsert({
      user_id: user.id,
      endpoint: subscriptionData.endpoint,
      p256dh: subscriptionData.keys.p256dh,
      auth: subscriptionData.keys.auth,
      device_type: getDeviceType(),
      browser: getBrowser(),
    }, {
      onConflict: 'endpoint',
    });

    if (_error) throw _error;
  };

  // Supprimer l'abonnement de Supabase
  const removeSubscription = async (endpoint: string) => {
    const { _error } = await supabase
      .from('push_subscriptions' as any)
      .delete()
      .eq('endpoint', endpoint);

    if (_error) throw _error;
  };

  // Envoyer une notification de test
  const sendTestNotification = async () => {
    if (!isSubscribed) {
      toast.error('Vous devez d\'abord vous abonner aux notifications');
      return;
    }

    try {
      // Appeler l'edge function pour envoyer une notification
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: '🎉 Notification Test',
          body: 'Ceci est une notification de test de MED-MNG!',
          icon: '/pwa-192x192.png',
          badge: '/badge-72x72.png',
          url: '/dashboard',
        },
      });

      if (error) throw error;
      toast.success('Notification de test envoyée !');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Erreur lors de l\'envoi de la notification');
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
};

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
  return 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
}
