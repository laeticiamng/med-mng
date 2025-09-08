/**
 * 🏪 FINAL STORE - MED-MNG v3.0
 * Store unifié et fonctionnel sans immer
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types simplifiés
interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin' | 'doctor';
}

interface Analytics {
  pageViews: number;
  uniqueUsers: number;
  sessionDuration: number;
}

interface MedicalData {
  patients: number;
  appointments: number;
  treatments: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  activeUsers?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  errors?: number;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

interface FinalStoreState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // UI
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  
  // Data
  analytics: Analytics;
  medicalData: MedicalData;
  systemHealth: SystemHealth;
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  updatePreferences: (prefs: any) => void;
  updateSystemHealth: (health: Partial<SystemHealth>) => void;
  addNotification: (notification: Partial<Notification>) => void;
}

export const useFinalStore = create<FinalStoreState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      theme: 'system',
      sidebarOpen: true,
      analytics: {
        pageViews: 1250,
        uniqueUsers: 345,
        sessionDuration: 12.5
      },
      medicalData: {
        patients: 89,
        appointments: 156,
        treatments: 234
      },
      systemHealth: {
        status: 'healthy',
        uptime: 99.9,
        responseTime: 145
      },
      notifications: [],
      unreadCount: 0,
      
      // Actions d'authentification
      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Simulation authentification
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user: User = {
            id: '1',
            email,
            name: 'Dr. Martin',
            firstName: 'Dr.',
            lastName: 'Martin',
            role: 'doctor'
          };
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Erreur de connexion' };
        }
      },
      
      signOut: () => {
        set({
          user: null,
          isAuthenticated: false
        });
      },
      
      setUser: (user) => {
        set({ 
          user,
          isAuthenticated: !!user 
        });
      },
      
      setTheme: (theme) => {
        set({ theme });
        
        // Appliquer le thème
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // System
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
        }
      },
      
      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      updatePreferences: (prefs) => {
        // Mock implementation
        console.log('Preferences updated:', prefs);
      },
      
      updateSystemHealth: (health) => {
        set(state => ({
          systemHealth: { ...state.systemHealth, ...health }
        }));
      },
      
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const fullNotification = {
          id,
          title: notification.title || 'Notification',
          message: notification.message || '',
          type: notification.type || 'info'
        };
        set(state => ({
          notifications: [...state.notifications, fullNotification],
          unreadCount: state.unreadCount + 1
        }));
      }
    }),
    {
      name: 'final-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        analytics: state.analytics,
        medicalData: state.medicalData,
        systemHealth: state.systemHealth
      })
    }
  )
);

// Export par défaut
export default useFinalStore;