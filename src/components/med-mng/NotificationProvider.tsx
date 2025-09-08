import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'music' | 'study' | 'social' | 'security';
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: {
    enableBrowserNotifications: boolean;
    enableSounds: boolean;
    mutedCategories: string[];
  };
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationState['settings']> };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    enableBrowserNotifications: true,
    enableSounds: true,
    mutedCategories: [],
  },
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, read: true })),
        unreadCount: 0,
      };
    
    case 'REMOVE_NOTIFICATION':
      const removedNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload),
        unreadCount: removedNotification && !removedNotification.read 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount,
      };
    
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    default:
      return state;
  }
}

interface NotificationContextType {
  state: NotificationState;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationState['settings']>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { toast } = useToast();

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // Check if category is muted
    if (state.settings.mutedCategories.includes(notification.category)) {
      return;
    }

    const notificationId = crypto.randomUUID();
    const newNotification: Notification = {
      ...notification,
      id: notificationId,
      timestamp: new Date(),
      read: false,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default',
      duration: notification.persistent ? undefined : 5000,
    });

    // Browser notification if enabled and supported
    if (
      state.settings.enableBrowserNotifications &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notificationId,
      });
    }
  }, [state.settings, toast]);

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_READ', payload: id });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const updateSettings = useCallback((settings: Partial<NotificationState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const value: NotificationContextType = {
    state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};