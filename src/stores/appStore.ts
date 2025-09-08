/**
 * STORE PRINCIPAL OPTIMISÉ - ZUSTAND
 * ===================================
 * State management global pour éviter props drilling et optimiser les performances
 */

import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface Song {
  id: string;
  title: string;
  audioUrl?: string;
  duration?: number;
  isPlaying?: boolean;
  currentTime?: number;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  autoPlay: boolean;
  volume: number;
  language: string;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  preferences: UserPreferences;
  
  // Music Player State
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffled: boolean;
  
  // UI State
  sidebarOpen: boolean;
  activeModal: string | null;
  isLoading: boolean;
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>;
  
  // Performance Metrics
  lastUpdateTime: number;
  renderCount: number;
  
  // Actions
  setUser: (user: User | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Music Player Actions
  setCurrentSong: (song: Song | null) => void;
  togglePlayback: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  toggleShuffle: () => void;
  updateSongProgress: (currentTime: number) => void;
  
  // UI Actions
  toggleSidebar: () => void;
  setActiveModal: (modal: string | null) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  
  // Performance Actions
  incrementRenderCount: () => void;
  resetMetrics: () => void;
}

// Store principal avec middleware optimisés
export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // État initial
        user: null,
        isAuthenticated: false,
        preferences: {
          theme: 'light',
          autoPlay: false,
          volume: 70,
          language: 'fr',
          accessibility: {
            highContrast: false,
            reducedMotion: false,
            fontSize: 'medium',
          },
        },
        
        currentSong: null,
        playlist: [],
        isPlaying: false,
        volume: 70,
        isMuted: false,
        repeatMode: 'none',
        isShuffled: false,
        
        sidebarOpen: true,
        activeModal: null,
        isLoading: false,
        notifications: [],
        
        lastUpdateTime: Date.now(),
        renderCount: 0,
        
        // Actions optimisées avec Immer
        setUser: (user) => set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
          state.lastUpdateTime = Date.now();
        }),
        
        updatePreferences: (prefs) => set((state) => {
          Object.assign(state.preferences, prefs);
          state.lastUpdateTime = Date.now();
        }),
        
        setCurrentSong: (song) => set((state) => {
          state.currentSong = song;
          state.isPlaying = !!song;
          state.lastUpdateTime = Date.now();
        }),
        
        togglePlayback: () => set((state) => {
          state.isPlaying = !state.isPlaying;
          state.lastUpdateTime = Date.now();
        }),
        
        setVolume: (volume) => set((state) => {
          state.volume = Math.max(0, Math.min(100, volume));
          state.isMuted = volume === 0;
          state.lastUpdateTime = Date.now();
        }),
        
        toggleMute: () => set((state) => {
          state.isMuted = !state.isMuted;
          state.lastUpdateTime = Date.now();
        }),
        
        setRepeatMode: (mode) => set((state) => {
          state.repeatMode = mode;
          state.lastUpdateTime = Date.now();
        }),
        
        toggleShuffle: () => set((state) => {
          state.isShuffled = !state.isShuffled;
          state.lastUpdateTime = Date.now();
        }),
        
        updateSongProgress: (currentTime) => set((state) => {
          if (state.currentSong) {
            state.currentSong.currentTime = currentTime;
          }
        }),
        
        toggleSidebar: () => set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),
        
        setActiveModal: (modal) => set((state) => {
          state.activeModal = modal;
        }),
        
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        
        addNotification: (notification) => set((state) => {
          const id = Math.random().toString(36).substr(2, 9);
          state.notifications.push({ ...notification, id });
          
          // Auto-remove après 5 secondes pour les notifications non-erreur
          if (notification.type !== 'error') {
            setTimeout(() => {
              set((state) => {
                state.notifications = state.notifications.filter(n => n.id !== id);
              });
            }, 5000);
          }
        }),
        
        removeNotification: (id) => set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        }),
        
        incrementRenderCount: () => set((state) => {
          state.renderCount += 1;
        }),
        
        resetMetrics: () => set((state) => {
          state.renderCount = 0;
          state.lastUpdateTime = Date.now();
        }),
      }))
    ),
    { name: 'med-mng-store' }
  )
);

// Selectors optimisés pour éviter re-renders
export const useUser = () => useAppStore(state => state.user);
export const useIsAuthenticated = () => useAppStore(state => state.isAuthenticated);
export const usePreferences = () => useAppStore(state => state.preferences);
export const useTheme = () => useAppStore(state => state.preferences.theme);

export const useCurrentSong = () => useAppStore(state => state.currentSong);
export const useIsPlaying = () => useAppStore(state => state.isPlaying);
export const useVolume = () => useAppStore(state => state.volume);

export const usePlayerState = () => useAppStore(state => ({
  currentSong: state.currentSong,
  isPlaying: state.isPlaying,
  volume: state.volume,
  isMuted: state.isMuted,
  repeatMode: state.repeatMode,
  isShuffled: state.isShuffled
}));

export const useUIState = () => useAppStore(state => ({
  sidebarOpen: state.sidebarOpen,
  activeModal: state.activeModal,
  isLoading: state.isLoading,
  notifications: state.notifications
}));

// Actions selectors
export const usePlayerActions = () => useAppStore(state => ({
  setCurrentSong: state.setCurrentSong,
  togglePlayback: state.togglePlayback,
  setVolume: state.setVolume,
  toggleMute: state.toggleMute,
  setRepeatMode: state.setRepeatMode,
  toggleShuffle: state.toggleShuffle,
  updateSongProgress: state.updateSongProgress
}));

export const useUIActions = () => useAppStore(state => ({
  toggleSidebar: state.toggleSidebar,
  setActiveModal: state.setActiveModal,
  setLoading: state.setLoading,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification
}));

// Persist middleware pour sauvegarder les préférences
useAppStore.subscribe(
  (state) => state.preferences,
  (preferences) => {
    localStorage.setItem('med-mng-preferences', JSON.stringify(preferences));
  }
);

// Charger les préférences au démarrage
const storedPreferences = localStorage.getItem('med-mng-preferences');
if (storedPreferences) {
  try {
    const preferences = JSON.parse(storedPreferences);
    useAppStore.getState().updatePreferences(preferences);
  } catch (error) {
    console.warn('Erreur lors du chargement des préférences:', error);
  }
}