/**
 * 🏪 PREMIUM STORE - MED-MNG v3.0
 * DEPRECATED - Utiliser finalStore.ts à la place
 */

import { useFinalStore } from './finalStore';

export { useFinalStore as usePremiumStore } from './finalStore';

export const useSystemHealth = () => {
  const store = useFinalStore();
  return {
    systemHealth: store.systemHealth,
    updateSystemHealth: store.updateSystemHealth
  };
};

export const useNotifications = () => {
  const store = useFinalStore();
  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount
  };
};