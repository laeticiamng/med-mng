/**
 * 🏪 PREMIUM STORE - MED-MNG v3.0
 * Store global premium avec toutes les fonctionnalités avancées
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { logger } from '@/lib/logger';

// ==========================================
// INTERFACES PREMIUM
// ==========================================

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  specialty?: string;
  license?: string;
  avatar?: string;
  preferences: UserPreferences;
  subscription: Subscription;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en' | 'es' | 'de' | 'it';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    urgentOnly: boolean;
  };
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
    keyboardNavigation: boolean;
  };
  privacy: {
    analyticsOptOut: boolean;
    shareUsageData: boolean;
    publicProfile: boolean;
  };
}

interface Subscription {
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'trial' | 'expired';
  expiresAt?: string;
  features: string[];
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeUsers: number;
  errors: number;
  lastCheck: string;
}

interface Analytics {
  pageViews: number;
  uniqueUsers: number;
  sessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  userEngagement: Record<string, number>;
  performanceMetrics: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
}

interface MedicalData {
  patients: number;
  appointments: number;
  treatments: number;
  emergencies: number;
  satisfactionScore: number;
  averageWaitTime: number;
}

// ==========================================
// STORE PRINCIPAL PREMIUM
// ==========================================

interface PremiumStore {
  // État utilisateur
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // État système
  systemHealth: SystemHealth;
  analytics: Analytics;
  medicalData: MedicalData;

  // État UI
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  settingsModalOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;

  // Cache et performance
  cache: Map<string, any>;
  performanceMode: 'normal' | 'high' | 'ultra';
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Actions utilisateur
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;

  // Actions système
  updateSystemHealth: (health: Partial<SystemHealth>) => void;
  updateAnalytics: (analytics: Partial<Analytics>) => void;
  updateMedicalData: (data: Partial<MedicalData>) => void;

  // Actions UI
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;

  // Actions cache
  setCache: (key: string, value: any, ttl?: number) => void;
  getCache: (key: string) => any;
  clearCache: () => void;
  
  // Actions performance
  setPerformanceMode: (mode: 'normal' | 'high' | 'ultra') => void;
  
  // Actions notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ==========================================
// ÉTAT INITIAL PREMIUM
// ==========================================

const initialSystemHealth: SystemHealth = {
  status: 'healthy',
  uptime: 0,
  responseTime: 0,
  memoryUsage: 0,
  cpuUsage: 0,
  activeUsers: 0,
  errors: 0,
  lastCheck: new Date().toISOString()
};

const initialAnalytics: Analytics = {
  pageViews: 0,
  uniqueUsers: 0,
  sessionDuration: 0,
  bounceRate: 0,
  conversionRate: 0,
  userEngagement: {},
  performanceMetrics: {
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0
  }
};

const initialMedicalData: MedicalData = {
  patients: 0,
  appointments: 0,
  treatments: 0,
  emergencies: 0,
  satisfactionScore: 0,
  averageWaitTime: 0
};

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

export const usePremiumStore = create<PremiumStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // État initial
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        systemHealth: initialSystemHealth,
        analytics: initialAnalytics,
        medicalData: initialMedicalData,
        sidebarOpen: true,
        commandPaletteOpen: false,
        settingsModalOpen: false,
        theme: 'system',
        language: 'fr',
        cache: new Map(),
        performanceMode: 'normal',
        notifications: [],
        unreadCount: 0,

        // Actions utilisateur
        signIn: async (email: string, password: string) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Simulation d'authentification
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user: User = {
              id: '1',
              email,
              firstName: 'Jean',
              lastName: 'Dupont',
              role: 'doctor',
              specialty: 'Cardiologie',
              license: '12345678',
              preferences: {
                theme: 'system',
                language: 'fr',
                timezone: 'Europe/Paris',
                notifications: {
                  email: true,
                  push: true,
                  desktop: false,
                  urgentOnly: false
                },
                accessibility: {
                  screenReader: false,
                  highContrast: false,
                  reducedMotion: false,
                  fontSize: 'medium',
                  keyboardNavigation: false
                },
                privacy: {
                  analyticsOptOut: false,
                  shareUsageData: true,
                  publicProfile: false
                }
              },
              subscription: {
                plan: 'premium',
                status: 'active',
                features: ['analytics', 'ai-assistant', 'advanced-security']
              }
            };

            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.theme = user.preferences.theme;
              state.language = user.preferences.language;
            });

            logger.info('auth', 'User signed in successfully', { userId: user.id });

            get().addNotification({
              type: 'success',
              title: 'Connexion réussie',
              message: 'Bienvenue sur MED-MNG Premium!'
            });

          } catch (error) {
            set((state) => {
              state.error = 'Échec de la connexion';
              state.isLoading = false;
            });

            logger.error('auth', 'Sign in failed', { error });

            get().addNotification({
              type: 'error',
              title: 'Erreur de connexion',
              message: 'Vérifiez vos identifiants et réessayez.'
            });
          }
        },

        signOut: async () => {
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.notifications = [];
            state.unreadCount = 0;
          });

          get().clearCache();
          logger.info('auth', 'User signed out');
        },

        updateUser: (updates: Partial<User>) => {
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          });
        },

        updatePreferences: (preferences: Partial<UserPreferences>) => {
          set((state) => {
            if (state.user) {
              Object.assign(state.user.preferences, preferences);
            }
          });
        },

        // Actions système
        updateSystemHealth: (health: Partial<SystemHealth>) => {
          set((state) => {
            Object.assign(state.systemHealth, health, {
              lastCheck: new Date().toISOString()
            });
          });
        },

        updateAnalytics: (analytics: Partial<Analytics>) => {
          set((state) => {
            Object.assign(state.analytics, analytics);
          });
        },

        updateMedicalData: (data: Partial<MedicalData>) => {
          set((state) => {
            Object.assign(state.medicalData, data);
          });
        },

        // Actions UI
        toggleSidebar: () => {
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          });
        },

        openCommandPalette: () => {
          set((state) => {
            state.commandPaletteOpen = true;
          });
        },

        closeCommandPalette: () => {
          set((state) => {
            state.commandPaletteOpen = false;
          });
        },

        openSettings: () => {
          set((state) => {
            state.settingsModalOpen = true;
          });
        },

        closeSettings: () => {
          set((state) => {
            state.settingsModalOpen = false;
          });
        },

        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set((state) => {
            state.theme = theme;
            if (state.user) {
              state.user.preferences.theme = theme;
            }
          });

          // Appliquer le thème immédiatement
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
          } else {
            // System preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', prefersDark);
          }
        },

        setLanguage: (language: string) => {
          set((state) => {
            state.language = language;
            if (state.user) {
              state.user.preferences.language = language as any;
            }
          });
        },

        // Actions cache
        setCache: (key: string, value: any, ttl: number = 300000) => {
          const cache = get().cache;
          cache.set(key, {
            value,
            expiry: Date.now() + ttl
          });
        },

        getCache: (key: string) => {
          const cache = get().cache;
          const item = cache.get(key);
          
          if (!item) return null;
          
          if (Date.now() > item.expiry) {
            cache.delete(key);
            return null;
          }
          
          return item.value;
        },

        clearCache: () => {
          set((state) => {
            state.cache.clear();
          });
        },

        // Actions performance
        setPerformanceMode: (mode: 'normal' | 'high' | 'ultra') => {
          set((state) => {
            state.performanceMode = mode;
          });

          // Appliquer les optimisations selon le mode
          switch (mode) {
            case 'ultra':
              document.documentElement.style.setProperty('--animation-duration', '0.1s');
              break;
            case 'high':
              document.documentElement.style.setProperty('--animation-duration', '0.2s');
              break;
            default:
              document.documentElement.style.setProperty('--animation-duration', '0.3s');
          }
        },

        // Actions notifications
        addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
          const id = Date.now().toString();
          const newNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date().toISOString(),
            read: false
          };

          set((state) => {
            state.notifications.unshift(newNotification);
            state.unreadCount++;
            
            // Limiter à 50 notifications
            if (state.notifications.length > 50) {
              state.notifications = state.notifications.slice(0, 50);
            }
          });
        },

        removeNotification: (id: string) => {
          set((state) => {
            const notification = state.notifications.find(n => n.id === id);
            if (notification && !notification.read) {
              state.unreadCount--;
            }
            state.notifications = state.notifications.filter(n => n.id !== id);
          });
        },

        markAsRead: (id: string) => {
          set((state) => {
            const notification = state.notifications.find(n => n.id === id);
            if (notification && !notification.read) {
              notification.read = true;
              state.unreadCount--;
            }
          });
        },

        clearAllNotifications: () => {
          set((state) => {
            state.notifications = [];
            state.unreadCount = 0;
          });
        }
      })),
      {
        name: 'premium-store',
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
          language: state.language,
          performanceMode: state.performanceMode,
          sidebarOpen: state.sidebarOpen
        })
      }
    )
  )
);

// ==========================================
// HOOKS PREMIUM SPÉCIALISÉS
// ==========================================

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, signIn, signOut, updateUser } = usePremiumStore();
  return { user, isAuthenticated, isLoading, error, signIn, signOut, updateUser };
};

export const useSystemHealth = () => {
  const { systemHealth, updateSystemHealth } = usePremiumStore();
  return { systemHealth, updateSystemHealth };
};

export const useNotifications = () => {
  const { 
    notifications, 
    unreadCount, 
    addNotification, 
    removeNotification, 
    markAsRead, 
    clearAllNotifications 
  } = usePremiumStore();
  
  return { 
    notifications, 
    unreadCount, 
    addNotification, 
    removeNotification, 
    markAsRead, 
    clearAllNotifications 
  };
};

export const useTheme = () => {
  const { theme, setTheme } = usePremiumStore();
  return { theme, setTheme };
};

export const useCache = () => {
  const { setCache, getCache, clearCache } = usePremiumStore();
  return { setCache, getCache, clearCache };
};

// Auto-initialisation du thème
usePremiumStore.subscribe(
  (state) => state.theme,
  (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }
);

export default usePremiumStore;