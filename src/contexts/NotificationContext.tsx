import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'generation';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
  actions?: NotificationAction[];
  progress?: number;
  icon?: ReactNode;
}

interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive';
}

interface NotificationContextType {
  _notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  clearAll: () => void;
  // Méthodes spécialisées
  notifyGeneration: (type: 'music' | 'quiz' | 'content', status: 'start' | 'progress' | 'complete' | 'error', data?: any) => void;
  notifyQuota: (remaining: number, total: number) => void;
  notifyStreaming: (action: 'play' | 'pause' | 'error', track?: string) => void;
  notifyPlaylist: (action: 'add' | 'remove' | 'create', data?: any) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [_notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>): string => {
    const id = crypto.randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove non-persistent notifications après 5s
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }

    // Utiliser aussi Sonner pour les toasts
    switch (notification.type) {
      case 'success':
        toast.success(notification.title, { description: notification.message });
        break;
      case 'error':
        toast.error(notification.title, { description: notification.message });
        break;
      case 'warning':
        toast.warning(notification.title, { description: notification.message });
        break;
      case 'info':
        toast.info(notification.title, { description: notification.message });
        break;
      case 'generation':
        // Toast personnalisé pour les générations
        toast.loading(notification.title, { description: notification.message, duration: 10000 });
        break;
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates } : n
    ));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Méthodes spécialisées pour différents types d'événements
  const notifyGeneration = (
    type: 'music' | 'quiz' | 'content', 
    status: 'start' | 'progress' | 'complete' | 'error', 
    data?: any
  ) => {
    const typeLabels = {
      music: '🎵 Musique',
      quiz: '🧠 Quiz',
      content: '📚 Contenu'
    };

    const statusMessages = {
      start: 'Génération démarrée...',
      progress: data?.progress ? `Progression: ${data.progress}%` : 'En cours...',
      complete: 'Génération terminée !',
      error: 'Erreur lors de la génération'
    };

    const notificationType: NotificationType = 
      status === 'error' ? 'error' : 
      status === 'complete' ? 'success' : 'generation';

    addNotification({
      type: notificationType,
      title: `${typeLabels[type]} - ${statusMessages[status]}`,
      message: data?.message || `${typeLabels[type]} ${status === 'complete' ? 'ajouté à votre bibliothèque' : ''}`,
      persistent: status === 'start' || status === 'progress',
      progress: data?.progress,
      actions: status === 'complete' ? [
        {
          label: 'Voir',
          action: () => data?.onView?.()
        }
      ] : undefined
    });
  };

  const notifyQuota = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    
    if (percentage <= 10) {
      addNotification({
        type: 'error',
        title: '⚠️ Quota bientôt épuisé',
        message: `Il vous reste ${remaining} crédits sur ${total}. Pensez à upgrader !`,
        persistent: true,
        actions: [
          {
            label: 'Upgrader',
            action: () => window.location.href = '/subscription'
          }
        ]
      });
    } else if (percentage <= 25) {
      addNotification({
        type: 'warning',
        title: '⚡ Quota faible',
        message: `Il vous reste ${remaining} crédits sur ${total}.`,
        actions: [
          {
            label: 'Voir les plans',
            action: () => window.location.href = '/subscription'
          }
        ]
      });
    }
  };

  const notifyStreaming = (action: 'play' | 'pause' | 'error', track?: string) => {
    switch (action) {
      case 'play':
        addNotification({
          type: 'info',
          title: '▶️ Lecture en cours',
          message: track ? `Lecture de: ${track}` : 'Musique en cours de lecture'
        });
        break;
      case 'pause':
        addNotification({
          type: 'info',
          title: '⏸️ Lecture en pause',
          message: track ? `En pause: ${track}` : 'Lecture mise en pause'
        });
        break;
      case 'error':
        addNotification({
          type: 'error',
          title: '❌ Erreur de lecture',
          message: 'Impossible de lire cette piste. Vérifiez votre connexion.',
          actions: [
            {
              label: 'Réessayer',
              action: () => window.location.reload()
            }
          ]
        });
        break;
    }
  };

  const notifyPlaylist = (action: 'add' | 'remove' | 'create', data?: any) => {
    switch (action) {
      case 'add':
        addNotification({
          type: 'success',
          title: '➕ Ajouté à la playlist',
          message: data?.playlistName ? `Ajouté à "${data.playlistName}"` : 'Chanson ajoutée à la playlist'
        });
        break;
      case 'remove':
        addNotification({
          type: 'info',
          title: '➖ Retiré de la playlist',
          message: data?.playlistName ? `Retiré de "${data.playlistName}"` : 'Chanson retirée de la playlist'
        });
        break;
      case 'create':
        addNotification({
          type: 'success',
          title: '🎵 Playlist créée',
          message: data?.playlistName ? `Playlist "${data.playlistName}" créée avec succès` : 'Nouvelle playlist créée',
          actions: [
            {
              label: 'Voir',
              action: () => data?.onView?.()
            }
          ]
        });
        break;
    }
  };

  const contextValue: NotificationContextType = {
    _notifications,
    addNotification,
    removeNotification,
    updateNotification,
    clearAll,
    notifyGeneration,
    notifyQuota,
    notifyStreaming,
    notifyPlaylist
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook pour surveiller les quotas automatiquement
export const useQuotaMonitoring = () => {
  const { notifyQuota } = useNotifications();

  useEffect(() => {
    const checkQuota = async () => {
      try {
        // Logique pour récupérer le quota depuis Supabase
        // const { data } = await supabase.from('subscriptions').select('credits_left, plan');
        // notifyQuota(data.credits_left, getPlanCredits(data.plan));
      } catch (error) {
        console.error('Error checking quota:', error);
      }
    };

    // Vérifier le quota au chargement et toutes les 5 minutes
    checkQuota();
    const interval = setInterval(checkQuota, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [notifyQuota]);
};

// Hook pour surveiller les événements de streaming
export const useStreamingNotifications = () => {
  const { notifyStreaming } = useNotifications();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page cachée - continuer la lecture en arrière-plan
        notifyStreaming('play', 'Lecture en arrière-plan');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Prévenir la fermeture accidentelle pendant la lecture
      const isPlaying = document.querySelector('audio:not([paused])');
      if (isPlaying) {
        e.preventDefault();
        e.returnValue = 'Une musique est en cours de lecture. Êtes-vous sûr de vouloir quitter ?';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [notifyStreaming]);
};