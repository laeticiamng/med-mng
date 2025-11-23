/**
 * Store Zustand pour gérer les notifications de tendances
 */

import logger from '@/lib/logger';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrendNotification {
  id: string;
  type: 'trending-item' | 'popular-search' | 'performance-alert';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

interface NotificationState {
  notifications: TrendNotification[];
  addNotification: (notification: Omit<TrendNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      
      addNotification: (notification) => {
        const newNotification: TrendNotification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          read: false,
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Max 50
        }));
        
        logger.debug('[Notifications] New notification:', notification.title);
      },
      
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }));
      },
      
      clearAll: () => {
        set({ notifications: [] });
      },
      
      unreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
      },
    }),
    {
      name: 'edn-notifications-storage',
    }
  )
);
