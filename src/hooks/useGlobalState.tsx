import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

/**
 * État Global de l'Application
 */
const GlobalStateContext = createContext<any>(null);

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalStateProvider');
  }
  return context;
};

interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<any>({
    // Interface
    sidebarCollapsed: false,
    theme: 'system',
    language: 'fr',
    
    // Notifications
    notifications: [],
    unreadCount: 0,
    
    // Performance
    performanceMode: 'auto',
    animationsEnabled: true,
    
    // Utilisateur
    user: null,
    preferences: {
      notifications: true,
      sounds: true,
      animations: true,
      highContrast: false,
      fontSize: 'medium'
    }
  });

  // Persistance locale
  useEffect(() => {
    const savedState = localStorage.getItem('med-mng-global-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setState(prev => ({ ...prev, ...parsedState }));
      } catch (error) {
        console.warn('Erreur lors du chargement de l\'état:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('med-mng-global-state', JSON.stringify(state));
  }, [state]);

  const updateState = (updates) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const updatePreferences = (preferences) => {
    setState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...preferences
      }
    }));
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications].slice(0, 50), // Limite à 50
      unreadCount: prev.unreadCount + 1
    }));

    return id;
  };

  const markNotificationRead = (id) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1)
    }));
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif => ({ ...notif, read: true })),
      unreadCount: 0
    }));
  };

  const removeNotification = (id) => {
    setState(prev => {
      const notification = prev.notifications.find(n => n.id === id);
      const wasUnread = notification && !notification.read;
      
      return {
        ...prev,
        notifications: prev.notifications.filter(notif => notif.id !== id),
        unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
      };
    });
  };

  const contextValue = {
    state,
    updateState,
    updatePreferences,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification
  };

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;