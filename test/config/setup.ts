import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

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
vi.mock('react-router-dom', () => ({
  useParams: () => ({ slug: 'test-slug' }),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/test' }),
}));

// Mock des toasts
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock de Sentry
vi.mock('@/utils/monitoring/sentry', () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});