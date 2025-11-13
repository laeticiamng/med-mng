import { vi, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// 🎭 MOCK DATA
export const mockAuth = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  },
  session: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn()
};

export const mockAudio = {
  play: vi.fn(),
  pause: vi.fn(),
  currentTime: 0,
  duration: 180,
  volume: 1,
  ended: false,
  paused: true
};

export const mockLanguage = {
  currentLanguage: 'fr',
  setLanguage: vi.fn(),
  t: vi.fn((key: string) => key)
};

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// 🎭 Global Mocks
global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

global.HTMLAudioElement = vi.fn().mockImplementation(() => ({
  ...mockAudio,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  load: vi.fn(),
  canPlayType: vi.fn(() => 'maybe'),
}));

Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
});

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
  },
});

global.fetch = vi.fn();

// Mock de Supabase client pour les tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock des hooks React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: 'test-slug' }),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/test' }),
  };
});

// Mock des toasts
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));