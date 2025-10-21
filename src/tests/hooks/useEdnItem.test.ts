import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEdnItem } from '@/hooks/useEdnItem';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn()
      }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/hooks/useEdnItemV2Process', () => ({
  useEdnItemV2Process: (item: any) => item
}));

describe('useEdnItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useEdnItem('test-slug'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.item).toBeNull();
  });

  it('should fetch and return EDN item data', async () => {
    const mockItem = {
      id: '1',
      item_code: 'IC-1',
      title: 'Test Item',
      slug: 'test-slug',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: mockItem,
            error: null
          })
        }))
      }))
    });

    const { result } = renderHook(() => useEdnItem('test-slug'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.item).toEqual(expect.objectContaining({
      item_code: 'IC-1',
      title: 'Test Item'
    }));
  });

  it('should handle fetch errors gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' }
          })
        }))
      }))
    });

    const { result } = renderHook(() => useEdnItem('invalid-slug'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.item).toBeNull();
  });

  it('should not fetch if slug is undefined', () => {
    const { result } = renderHook(() => useEdnItem(undefined));
    
    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });
});
