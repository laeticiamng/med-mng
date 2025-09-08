/**
 * 🏪 STORE GLOBAL ZUSTAND - MED-MNG v3.0
 * Gestion d'état centralisée et optimisée
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { logger } from '@/lib/logger';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'premium';
  subscription?: {
    plan: string;
    status: 'active' | 'inactive' | 'trial';
    expires_at?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'fr' | 'en';
    accessibility: {
      fontSize: 'small' | 'normal' | 'large';
      highContrast: boolean;
      reducedMotion: boolean;
      screenReader: boolean;
    };
    audio: {
      volume: number;
      autoplay: boolean;
      quality: 'low' | 'medium' | 'high';
    };
  };
}

export interface AppState {
  // Auth & User
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // UI State
  sidebarOpen: boolean;
  currentPage: string;
  breadcrumbs: Array<{ label: string; href: string }>;
  modals: Record<string, boolean>;
  
  // Audio Player
  currentTrack: {
    id: string;
    title: string;
    url: string;
    duration?: number;
  } | null;
  isPlaying: boolean;
  volume: number;
  playlist: Array<{ id: string; title: string; url: string }>;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    read: boolean;
    timestamp: number;
  }>;
  
  // Cache & Performance
  cache: Record<string, { data: any; timestamp: number; ttl: number }>;
  lastActivity: number;
  
  // Analytics
  metrics: {
    pageViews: Record<string, number>;
    interactions: Record<string, number>;
    errors: Array<{ message: string; timestamp: number }>;
  };
}

export interface AppActions {
  // Auth Actions
  setUser: (user: User | null) => void;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void;
  login: (user: User) => void;
  logout: () => void;
  
  // UI Actions
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: AppState['breadcrumbs']) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  
  // Audio Actions
  setCurrentTrack: (track: AppState['currentTrack']) => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  addToPlaylist: (track: { id: string; title: string; url: string }) => void;
  removeFromPlaylist: (trackId: string) => void;
  clearPlaylist: () => void;
  
  // Notification Actions
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Cache Actions
  setCache: (key: string, data: any, ttl?: number) => void;
  getCache: (key: string) => any;
  clearCache: (key?: string) => void;
  
  // Analytics Actions
  trackPageView: (page: string) => void;
  trackInteraction: (action: string) => void;
  trackError: (error: string) => void;
  
  // Utility Actions
  updateLastActivity: () => void;
  resetStore: () => void;
}

// ==========================================
// ÉTAT INITIAL
// ==========================================

const initialState: AppState = {
  // Auth & User
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  // UI State
  sidebarOpen: false,
  currentPage: '/',
  breadcrumbs: [],
  modals: {},
  
  // Audio Player
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  playlist: [],
  
  // Notifications
  notifications: [],
  
  // Cache & Performance
  cache: {},
  lastActivity: Date.now(),
  
  // Analytics
  metrics: {
    pageViews: {},
    interactions: {},
    errors: []
  }
};

// ==========================================
// STORE PRINCIPAL
// ==========================================

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,
          
          // ==========================================
          // AUTH ACTIONS
          // ==========================================
          
          setUser: (user) => {
            set((state) => {
              state.user = user;
              state.isAuthenticated = !!user;
              state.isLoading = false;
            });
            
            logger.info('auth', user ? 'User set' : 'User cleared', { 
              userId: user?.id,
              role: user?.role 
            });
          },
          
          updateUserPreferences: (preferences) => {
            set((state) => {
              if (state.user) {
                state.user.preferences = { ...state.user.preferences, ...preferences };
              }
            });
            
            logger.info('auth', 'User preferences updated', { preferences });
          },
          
          login: (user) => {
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
            
            get().addNotification({
              type: 'success',
              title: 'Connexion réussie',
              message: `Bienvenue ${user.name || user.email}!`,
              read: false
            });
            
            logger.info('auth', 'User logged in', { userId: user.id });
          },
          
          logout: () => {
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.currentTrack = null;
              state.isPlaying = false;
              state.playlist = [];
            });
            
            get().addNotification({
              type: 'info',
              title: 'Déconnexion',
              message: 'Vous avez été déconnecté avec succès',
              read: false
            });
            
            logger.info('auth', 'User logged out');
          },
          
          // ==========================================
          // UI ACTIONS
          // ==========================================
          
          toggleSidebar: () => {
            set((state) => {
              state.sidebarOpen = !state.sidebarOpen;
            });
          },
          
          setCurrentPage: (page) => {
            set((state) => {
              state.currentPage = page;
            });
            get().trackPageView(page);
          },
          
          setBreadcrumbs: (breadcrumbs) => {
            set((state) => {
              state.breadcrumbs = breadcrumbs;
            });
          },
          
          openModal: (modalId) => {
            set((state) => {
              state.modals[modalId] = true;
            });
            get().trackInteraction(`modal_open_${modalId}`);
          },
          
          closeModal: (modalId) => {
            set((state) => {
              state.modals[modalId] = false;
            });
            get().trackInteraction(`modal_close_${modalId}`);
          },
          
          toggleModal: (modalId) => {
            set((state) => {
              state.modals[modalId] = !state.modals[modalId];
            });
          },
          
          // ==========================================
          // AUDIO ACTIONS
          // ==========================================
          
          setCurrentTrack: (track) => {
            set((state) => {
              state.currentTrack = track;
              state.isPlaying = !!track;
            });
            
            if (track) {
              get().trackInteraction(`play_track_${track.id}`);
              logger.info('audio', 'Track set', { trackId: track.id, title: track.title });
            }
          },
          
          togglePlayPause: () => {
            set((state) => {
              state.isPlaying = !state.isPlaying;
            });
            
            const action = get().isPlaying ? 'play' : 'pause';
            get().trackInteraction(`audio_${action}`);
          },
          
          setVolume: (volume) => {
            set((state) => {
              state.volume = Math.max(0, Math.min(1, volume));
            });
          },
          
          addToPlaylist: (track) => {
            set((state) => {
              if (!state.playlist.find(t => t.id === track.id)) {
                state.playlist.push(track);
              }
            });
            
            get().trackInteraction('playlist_add');
          },
          
          removeFromPlaylist: (trackId) => {
            set((state) => {
              state.playlist = state.playlist.filter(t => t.id !== trackId);
            });
            
            get().trackInteraction('playlist_remove');
          },
          
          clearPlaylist: () => {
            set((state) => {
              state.playlist = [];
            });
          },
          
          // ==========================================
          // NOTIFICATION ACTIONS
          // ==========================================
          
          addNotification: (notification) => {
            const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            set((state) => {
              state.notifications.unshift({
                ...notification,
                id,
                timestamp: Date.now()
              });
              
              // Garder seulement les 50 dernières notifications
              if (state.notifications.length > 50) {
                state.notifications = state.notifications.slice(0, 50);
              }
            });
            
            // Auto-remove après 5 secondes pour les notifications non critiques
            if (notification.type === 'success' || notification.type === 'info') {
              setTimeout(() => {
                get().removeNotification(id);
              }, 5000);
            }
          },
          
          markNotificationRead: (id) => {
            set((state) => {
              const notification = state.notifications.find(n => n.id === id);
              if (notification) {
                notification.read = true;
              }
            });
          },
          
          removeNotification: (id) => {
            set((state) => {
              state.notifications = state.notifications.filter(n => n.id !== id);
            });
          },
          
          clearNotifications: () => {
            set((state) => {
              state.notifications = [];
            });
          },
          
          // ==========================================
          // CACHE ACTIONS
          // ==========================================
          
          setCache: (key, data, ttl = 5 * 60 * 1000) => {
            set((state) => {
              state.cache[key] = {
                data,
                timestamp: Date.now(),
                ttl
              };
            });
          },
          
          getCache: (key) => {
            const cached = get().cache[key];
            if (!cached) return null;
            
            if (Date.now() - cached.timestamp > cached.ttl) {
              get().clearCache(key);
              return null;
            }
            
            return cached.data;
          },
          
          clearCache: (key) => {
            set((state) => {
              if (key) {
                delete state.cache[key];
              } else {
                state.cache = {};
              }
            });
          },
          
          // ==========================================
          // ANALYTICS ACTIONS
          // ==========================================
          
          trackPageView: (page) => {
            set((state) => {
              state.metrics.pageViews[page] = (state.metrics.pageViews[page] || 0) + 1;
            });
            
            logger.debug('analytics', 'Page view tracked', { page });
          },
          
          trackInteraction: (action) => {
            set((state) => {
              state.metrics.interactions[action] = (state.metrics.interactions[action] || 0) + 1;
            });
            
            logger.debug('analytics', 'Interaction tracked', { action });
          },
          
          trackError: (error) => {
            set((state) => {
              state.metrics.errors.push({
                message: error,
                timestamp: Date.now()
              });
              
              // Garder seulement les 100 dernières erreurs
              if (state.metrics.errors.length > 100) {
                state.metrics.errors = state.metrics.errors.slice(-100);
              }
            });
            
            logger.error('analytics', 'Error tracked', { error });
          },
          
          // ==========================================
          // UTILITY ACTIONS
          // ==========================================
          
          updateLastActivity: () => {
            set((state) => {
              state.lastActivity = Date.now();
            });
          },
          
          resetStore: () => {
            set(initialState);
            logger.info('app', 'Store reset');
          }
        }))
      ),
      {
        name: 'med-mng-store',
        partialize: (state) => ({
          user: state.user,
          sidebarOpen: state.sidebarOpen,
          volume: state.volume,
          notifications: state.notifications.filter(n => n.type === 'error'), // Persister seulement les erreurs
        }),
        version: 1,
      }
    ),
    {
      name: 'MED-MNG Store',
      enabled: import.meta.env.DEV,
    }
  )
);

// ==========================================
// SELECTORS OPTIMISÉS
// ==========================================

export const useUser = () => useAppStore((state) => state.user);
export const useAuth = () => useAppStore((state) => ({ 
  user: state.user, 
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading 
}));

export const useAudioPlayer = () => useAppStore((state) => ({
  currentTrack: state.currentTrack,
  isPlaying: state.isPlaying,
  volume: state.volume,
  playlist: state.playlist
}));

export const useNotifications = () => useAppStore((state) => 
  state.notifications.filter(n => !n.read)
);

export const useUIState = () => useAppStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  currentPage: state.currentPage,
  breadcrumbs: state.breadcrumbs,
  modals: state.modals
}));

// ==========================================
// AUTO-CLEANUP
// ==========================================

// Nettoyage automatique du cache toutes les 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    const { cache, clearCache } = useAppStore.getState();
    const now = Date.now();
    
    Object.keys(cache).forEach(key => {
      const cached = cache[key];
      if (now - cached.timestamp > cached.ttl) {
        clearCache(key);
      }
    });
  }, 10 * 60 * 1000);
  
  // Track user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
    document.addEventListener(event, () => {
      useAppStore.getState().updateLastActivity();
    }, { passive: true });
  });
}

// Log store initialization
logger.info('app', '🏪 Store initialized with Zustand', {
  features: ['persist', 'devtools', 'immer', 'subscriptions', 'analytics']
});