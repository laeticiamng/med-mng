import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * État Global de l'Application - Synced with Supabase
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
    sidebarCollapsed: false,
    theme: 'system',
    language: 'fr',
    notifications: [],
    unreadCount: 0,
    performanceMode: 'auto',
    animationsEnabled: true,
    user: null,
    preferences: {
      notifications: true,
      sounds: true,
      animations: true,
      highContrast: false,
      fontSize: 'medium'
    }
  });

  // Load state from Supabase (source of truth)
  const loadState = useCallback(async () => {
    // Load directly from Supabase for authenticated users
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await (supabase as any)
        .from('user_global_state')
        .select('state')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.state) {
        setState(prev => ({ ...prev, ...data.state }));
      }
    }
    // Anonymous users use default state only
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Save state to Supabase only (source of truth)
  const saveState = useCallback(async (newState: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any)
        .from('user_global_state')
        .upsert({
          user_id: user.id,
          state: newState,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }
    // Anonymous users don't persist state
  }, []);

  const updateState = useCallback((updates: any) => {
    setState((prev: any) => {
      const newState = { ...prev, ...updates };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const updatePreferences = useCallback((preferences: any) => {
    setState((prev: any) => {
      const newState = {
        ...prev,
        preferences: { ...prev.preferences, ...preferences }
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const addNotification = useCallback(async (notification: any) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setState((prev: any) => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications].slice(0, 50),
      unreadCount: prev.unreadCount + 1
    }));

    // Also save to Supabase notifications table
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from('user_notifications').insert({
        user_id: user.id,
        notification_type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata || {}
      });
    }

    return id;
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    setState((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((notif: any) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1)
    }));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any)
        .from('user_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('id', id);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setState((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((notif: any) => ({ ...notif, read: true })),
      unreadCount: 0
    }));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any)
        .from('user_notifications')
        .update({ read: true })
        .eq('user_id', user.id);
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    setState((prev: any) => {
      const notification = prev.notifications.find((n: any) => n.id === id);
      const wasUnread = notification && !notification.read;
      return {
        ...prev,
        notifications: prev.notifications.filter((notif: any) => notif.id !== id),
        unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
      };
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any)
        .from('user_notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('id', id);
    }
  }, []);

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