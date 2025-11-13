/**
 * Tests d'intégration pour le système de prefetch
 * Vérifie que les items sont préchargés au survol
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePrefetchFullItem } from '@/hooks/useEdnItems';
import type { EdnItem } from '@/types/edn';

// Mock Supabase
const mockSupabaseResponse = {
  data: {
    id: '1',
    item_code: 'IC-001',
    title: 'Test Item',
    slug: 'test-item',
    tableau_rang_a: [{ title: 'Test' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as EdnItem,
  error: null,
};

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve(mockSupabaseResponse)),
      })),
    })),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Système de prefetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePrefetchFullItem', () => {
    it('devrait précharger un item', async () => {
      const { result } = renderHook(() => usePrefetchFullItem(), {
        wrapper: createWrapper(),
      });

      result.current('IC-001');

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('edn_items_immersive');
      }, { timeout: 1000 });
    });

    it('devrait mettre l\'item en cache', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 10000,
          },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => usePrefetchFullItem(), { wrapper });

      result.current('IC-001');

      await waitFor(() => {
        const cachedData = queryClient.getQueryData(['edn-items', 'full', 'IC-001']);
        expect(cachedData).toBeDefined();
      });
    });

    it('devrait précharger plusieurs items différents', async () => {
      const { result } = renderHook(() => usePrefetchFullItem(), {
        wrapper: createWrapper(),
      });

      result.current('IC-001');
      result.current('IC-002');
      result.current('IC-003');

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalled();
      });
    });
  });

  describe('Performance', () => {
    it('devrait prefetch rapidement', async () => {
      const startTime = Date.now();
      
      const { result } = renderHook(() => usePrefetchFullItem(), {
        wrapper: createWrapper(),
      });

      result.current('IC-001');

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalled();
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000);
    });
  });
});
