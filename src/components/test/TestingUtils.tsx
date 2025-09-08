/**
 * 🧪 TESTING UTILITIES - MED-MNG v3.0
 * Utilitaires et composants pour les tests
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, expect } from 'vitest';

// Stores and Providers
import { useAppStore } from '@/stores/appStore';
import { i18n } from '@/lib/i18n';
import { logger } from '@/lib/logger';

// ==========================================
// MOCKS GLOBAUX
// ==========================================

// Mock du store Zustand
export const mockAppStore = {
  user: null,
  isAuthenticated: false,
  preferences: {
    theme: 'light' as const,
    autoPlay: false,
    volume: 70,
    language: 'fr' as const,
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium' as const,
    },
  },
  currentSong: null,
  playlist: [],
  isPlaying: false,
  volume: 70,
  isMuted: false,
  repeatMode: 'none' as const,
  isShuffled: false,
  sidebarOpen: true,
  activeModal: null,
  isLoading: false,
  notifications: [],
  lastUpdateTime: Date.now(),
  renderCount: 0,
  
  // Actions mockées
  setUser: vi.fn(),
  updatePreferences: vi.fn(),
  setCurrentSong: vi.fn(),
  togglePlayback: vi.fn(),
  setVolume: vi.fn(),
  toggleMute: vi.fn(),
  setRepeatMode: vi.fn(),
  toggleShuffle: vi.fn(),
  updateSongProgress: vi.fn(),
  toggleSidebar: vi.fn(),
  setActiveModal: vi.fn(),
  setLoading: vi.fn(),
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
  incrementRenderCount: vi.fn(),
  resetMetrics: vi.fn(),
};

// Mock des APIs
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  })),
  functions: {
    invoke: vi.fn(),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
    })),
  },
};

// Mock des modules externes
export const mockMediaQuery = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(),
  }));
};

// Mock ResizeObserver
export const mockResizeObserver = () => {
  global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
};

// ==========================================
// PROVIDERS DE TEST
// ==========================================

// Provider minimal pour les tests
const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Provider complet avec tous les contextes
const FullTestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// ==========================================
// RENDER FUNCTIONS
// ==========================================

// Render function personnalisée
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestProviders, ...options });

// Render function avec tous les providers
const fullRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: FullTestProviders, ...options });

// ==========================================
// UTILITAIRES DE TEST
// ==========================================

// Attendre que l'état async soit résolu
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Simuler un délai
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Créer des données de test
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  ...overrides,
});

export const createMockSong = (overrides = {}) => ({
  id: 'test-song-id',
  title: 'Test Song',
  audioUrl: 'https://example.com/test.mp3',
  duration: 180,
  isPlaying: false,
  currentTime: 0,
  ...overrides,
});

export const createMockNotification = (overrides = {}) => ({
  id: 'test-notification-id',
  message: 'Test notification',
  type: 'info' as const,
  ...overrides,
});

// Mock des hooks personnalisés
export const mockUseI18n = () => ({
  t: vi.fn((key: string, params?: any) => {
    if (params) {
      return `${key}_with_${JSON.stringify(params)}`;
    }
    return key;
  }),
  plural: vi.fn((key: string, count: number) => `${key}_${count}`),
  formatDate: vi.fn((date: Date) => date.toLocaleDateString()),
  formatNumber: vi.fn((num: number) => num.toString()),
  formatCurrency: vi.fn((amount: number) => `€${amount}`),
  formatRelativeTime: vi.fn(() => '2 minutes ago'),
  currentLanguage: 'fr' as const,
  availableLanguages: [],
  changeLanguage: vi.fn(),
  isRTL: false,
  direction: 'ltr' as const,
  isLoading: false,
  preloadLanguage: vi.fn(),
  clearCache: vi.fn(),
});

// Mock des hooks de performance
export const mockUseRenderMonitor = () => ({
  renderCount: 1,
  logPerformance: vi.fn(),
});

export const mockUseMemoryMonitor = () => ({
  used: '10 MB',
  total: '100 MB',
  percentage: 10,
});

// ==========================================
// SETUP/TEARDOWN HELPERS
// ==========================================

// Setup avant chaque test
export const setupTest = () => {
  // Mock console pour éviter les logs pendant les tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Mock des APIs du navigateur
  mockIntersectionObserver();
  mockResizeObserver();
  mockMediaQuery(false);

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
  });

  // Mock fetch
  global.fetch = vi.fn();

  // Mock performance
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 10000000,
      },
    },
  });
};

// Cleanup après chaque test
export const cleanupTest = () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
};

// ==========================================
// ASSERTIONS PERSONNALISÉES
// ==========================================

// Vérifier qu'un élément a les classes CSS attendues
export const expectToHaveClasses = (element: HTMLElement, classes: string[]) => {
  classes.forEach(className => {
    expect(element.className.split(' ')).toContain(className);
  });
};

// Vérifier qu'un élément est accessible
export const expectToBeAccessible = (element: HTMLElement) => {
  // Vérifier les attributs ARIA basiques
  expect(element.getAttribute('role')).toBeTruthy();
  if (element.tagName === 'BUTTON') {
    expect(element.getAttribute('disabled')).toBeNull();
  }
};

// Vérifier les métriques de performance
export const expectPerformanceWithinLimits = (metrics: any) => {
  if (metrics.renderTime) {
    expect(metrics.renderTime).toBeLessThan(100); // moins de 100ms
  }
  if (metrics.memoryUsage) {
    expect(metrics.memoryUsage).toBeLessThan(50 * 1024 * 1024); // moins de 50MB
  }
};

// ==========================================
// EXPORTS
// ==========================================

export {
  customRender as render,
  fullRender,
  TestProviders,
  FullTestProviders
};

// Re-export tout de @testing-library/react
export * from '@testing-library/react';
export { vi } from 'vitest';