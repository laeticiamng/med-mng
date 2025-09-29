import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Afficher aussi un toast pour les notifications importantes
    if (notification.type === 'success' || notification.type === 'error') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
    }
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Ajouter des notifications de démonstration au démarrage
  useEffect(() => {
    const demoNotifications = [
      {
        title: 'Bienvenue sur MED-MNG !',
        message: 'Découvrez nos nouveaux outils d\'apprentissage révolutionnaires',
        type: 'info' as const,
        action: { label: 'Explorer', url: '/edn-complete' }
      },
      {
        title: 'Nouvelle musique disponible',
        message: 'Une nouvelle piste mnémotechnique pour la cardiologie vient d\'être ajoutée',
        type: 'success' as const,
        action: { label: 'Écouter', url: '/med-mng/library' }
      },
      {
        title: 'Objectif de la semaine',
        message: 'Il vous reste 3 items EDN à compléter pour atteindre votre objectif',
        type: 'warning' as const,
        action: { label: 'Continuer', url: '/study-planner' }
      }
    ];

    // Ajouter les notifications après un délai pour simuler l'arrivée
    setTimeout(() => {
      demoNotifications.forEach((notif, index) => {
        setTimeout(() => addNotification(notif), index * 1000);
      });
    }, 2000);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      unreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};