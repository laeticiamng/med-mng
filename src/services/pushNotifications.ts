/**
 * Service de gestion des notifications push avec Service Worker
 * Permet de ré-engager les utilisateurs avec les nouvelles EDN et fonctionnalités
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  /**
   * Vérifie si les notifications sont supportées par le navigateur
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Vérifie l'état de permission actuel
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Demande la permission pour les notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Les notifications ne sont pas supportées par ce navigateur');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Permission notifications accordée');
      await this.registerServiceWorker();
    }

    return permission;
  }

  /**
   * Enregistre le Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      this.swRegistration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker prêt pour les notifications');
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
      throw error;
    }
  }

  /**
   * Affiche une notification locale
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported()) {
      console.warn('⚠️ Notifications non supportées');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('⚠️ Permission notifications non accordée');
      return;
    }

    if (!this.swRegistration) {
      await this.registerServiceWorker();
    }

    if (!this.swRegistration) {
      throw new Error('Service Worker non disponible');
    }

    const options = {
      body: payload.body,
      icon: payload.icon || '/pwa-192x192.png',
      badge: payload.badge || '/pwa-192x192.png',
      tag: payload.tag || 'med-mng-notification',
      data: payload.data,
      requireInteraction: false,
      silent: false,
      ...(payload.actions && { actions: payload.actions }),
    } as NotificationOptions;

    await this.swRegistration.showNotification(payload.title, options);
    console.log('✅ Notification affichée:', payload.title);
  }

  /**
   * Envoie une notification de nouvelle EDN
   */
  async notifyNewEDN(ednNumber: number, title: string): Promise<void> {
    await this.showNotification({
      title: `🎓 Nouvelle EDN ${ednNumber}`,
      body: title,
      icon: '/pwa-192x192.png',
      tag: `edn-${ednNumber}`,
      data: {
        type: 'new_edn',
        ednNumber,
        url: '/edn-complete',
      },
      actions: [
        {
          action: 'view',
          title: 'Consulter',
        },
        {
          action: 'dismiss',
          title: 'Plus tard',
        },
      ],
    });
  }

  /**
   * Envoie une notification de nouvelle fonctionnalité
   */
  async notifyNewFeature(featureName: string, description: string): Promise<void> {
    await this.showNotification({
      title: `✨ Nouvelle fonctionnalité: ${featureName}`,
      body: description,
      icon: '/pwa-192x192.png',
      tag: 'new-feature',
      data: {
        type: 'new_feature',
        feature: featureName,
      },
      actions: [
        {
          action: 'explore',
          title: 'Explorer',
        },
        {
          action: 'dismiss',
          title: 'Fermer',
        },
      ],
    });
  }

  /**
   * Envoie un rappel d'étude quotidien
   */
  async notifyDailyReminder(message: string): Promise<void> {
    await this.showNotification({
      title: '📚 Rappel d\'étude quotidien',
      body: message,
      icon: '/pwa-192x192.png',
      tag: 'daily-reminder',
      data: {
        type: 'daily_reminder',
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'start',
          title: 'Commencer',
        },
        {
          action: 'dismiss',
          title: 'Plus tard',
        },
      ],
    });
  }

  /**
   * Programme une notification pour plus tard
   */
  scheduleNotification(payload: NotificationPayload, delayMs: number): void {
    setTimeout(() => {
      this.showNotification(payload).catch(error => {
        console.error('❌ Erreur lors de l\'affichage de la notification programmée:', error);
      });
    }, delayMs);
  }

  /**
   * Annule toutes les notifications avec un tag spécifique
   */
  async cancelNotifications(tag?: string): Promise<void> {
    if (!this.swRegistration) return;

    const notifications = await this.swRegistration.getNotifications({ tag });
    notifications.forEach(notification => notification.close());
    console.log(`✅ ${notifications.length} notification(s) annulée(s)`);
  }
}

// Export singleton
export const pushNotifications = new PushNotificationService();

// Configuration des handlers d'événements pour les notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'notification-click') {
      const { action, data } = event.data;
      
      console.log('🔔 Notification cliquée:', action, data);
      
      // Gestion des actions de notification
      switch (data?.type) {
        case 'new_edn':
          if (action === 'view') {
            window.location.href = '/edn-complete';
          }
          break;
        case 'new_feature':
          if (action === 'explore') {
            window.location.href = '/';
          }
          break;
        case 'daily_reminder':
          if (action === 'start') {
            window.location.href = '/edn-complete';
          }
          break;
      }
    }
  });
}
