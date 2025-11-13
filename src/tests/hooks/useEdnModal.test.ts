import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEdnModal } from '@/hooks/useEdnModal';
import type { EdnItem } from '@/types/edn';

describe('useEdnModal', () => {
  const mockItem = { id: '1', item_code: 'IC-001', title: 'Test' } as EdnItem;

  it('devrait ouvrir le modal avec un item', () => {
    const { result } = renderHook(() => useEdnModal());
    
    act(() => {
      result.current.openModal(mockItem, 'rang-a');
    });
    
    expect(result.current.isOpen).toBe(true);
    expect(result.current.item).toBe(mockItem);
    expect(result.current.activeTab).toBe('rang-a');
  });

  it('devrait fermer le modal', () => {
    const { result } = renderHook(() => useEdnModal());
    
    act(() => {
      result.current.openModal(mockItem);
      result.current.closeModal();
    });
    
    expect(result.current.isOpen).toBe(false);
    expect(result.current.item).toBe(null);
  });
});
