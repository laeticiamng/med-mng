import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { server } from './mocks/server';

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

// 🌐 MSW Server Setup
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
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

// Mock de Supabase client pour les tests avec chaîne de méthodes complète
const createMockQueryBuilder = () => {
  const mockBuilder: any = {
    select: vi.fn(() => mockBuilder),
    insert: vi.fn(() => mockBuilder),
    update: vi.fn(() => mockBuilder),
    delete: vi.fn(() => mockBuilder),
    upsert: vi.fn(() => mockBuilder),
    eq: vi.fn(() => mockBuilder),
    neq: vi.fn(() => mockBuilder),
    gt: vi.fn(() => mockBuilder),
    gte: vi.fn(() => mockBuilder),
    lt: vi.fn(() => mockBuilder),
    lte: vi.fn(() => mockBuilder),
    like: vi.fn(() => mockBuilder),
    ilike: vi.fn(() => mockBuilder),
    is: vi.fn(() => mockBuilder),
    in: vi.fn(() => mockBuilder),
    contains: vi.fn(() => mockBuilder),
    containedBy: vi.fn(() => mockBuilder),
    range: vi.fn(() => mockBuilder),
    textSearch: vi.fn(() => mockBuilder),
    filter: vi.fn(() => mockBuilder),
    or: vi.fn(() => mockBuilder),
    and: vi.fn(() => mockBuilder),
    not: vi.fn(() => mockBuilder),
    match: vi.fn(() => mockBuilder),
    order: vi.fn(() => mockBuilder),
    limit: vi.fn(() => mockBuilder),
    offset: vi.fn(() => mockBuilder),
    single: vi.fn(() => mockBuilder),
    maybeSingle: vi.fn(() => mockBuilder),
    csv: vi.fn(() => mockBuilder),
    then: vi.fn((resolve) => resolve({ data: [], error: null })),
  };
  return mockBuilder;
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => createMockQueryBuilder()),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
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
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));