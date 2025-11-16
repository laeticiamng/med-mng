import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEdnModal } from '@/hooks/useEdnModal';
import type { EdnItem } from '@/types/edn';

describe('useEdnModal', () => {
  const mockItem: EdnItem = { 
    id: '1', 
    item_code: 'IC-001', 
    title: 'Test Item',
    slug: 'test-item'
  } as EdnItem;

  const mockItem2: EdnItem = { 
    id: '2', 
    item_code: 'IC-002', 
    title: 'Second Item',
    slug: 'second-item'
  } as EdnItem;

  describe('État initial', () => {
    it('devrait avoir un état initial fermé', () => {
      const { result } = renderHook(() => useEdnModal());
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.item).toBe(null);
      expect(result.current.activeTab).toBe('overview');
    });

    it('devrait exposer modalState complet', () => {
      const { result } = renderHook(() => useEdnModal());
      
      expect(result.current.modalState).toEqual({
        isOpen: false,
        item: null,
        activeTab: 'overview'
      });
    });
  });

  describe('Ouverture du modal', () => {
    it('devrait ouvrir le modal avec un item', () => {
      const { result } = renderHook(() => useEdnModal());
      
      act(() => {
        result.current.openModal(mockItem);
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.item).toBe(mockItem);
      expect(result.current.activeTab).toBe('overview');
    });

    it('devrait ouvrir le modal avec un tab spécifique', () => {
      const { result } = renderHook(() => useEdnModal());
      
      act(() => {
        result.current.openModal(mockItem, 'rang-a');
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.item).toBe(mockItem);
      expect(result.current.activeTab).toBe('rang-a');
    });

    it('devrait gérer différents tabs', () => {
      const { result } = renderHook(() => useEdnModal());
      
      const tabs = ['overview', 'rang-a', 'rang-b', 'music', 'scene', 'quiz'];
      
      tabs.forEach(tab => {
        act(() => {
          result.current.openModal(mockItem, tab);
        });
        
        expect(result.current.activeTab).toBe(tab);
      });
    });

    it('devrait remplacer un item existant lors d\'une nouvelle ouverture', () => {
      const { result } = renderHook(() => useEdnModal());
      
      act(() => {
        result.current.openModal(mockItem);
      });
      
      expect(result.current.item?.id).toBe('1');
      
      act(() => {
        result.current.openModal(mockItem2);
      });
      
      expect(result.current.item?.id).toBe('2');
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('Fermeture du modal', () => {
    it('devrait fermer le modal', () => {
      const { result } = renderHook(() => useEdnModal());
      
      act(() => {
        result.current.openModal(mockItem);
        result.current.closeModal();
      });
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.item).toBe(null);
      expect(result.current.activeTab).toBe('overview');
    });

    it('devrait réinitialiser complètement l\'état', () => {
      const { result } = renderHook(() => useEdnModal());
      
      act(() => {
        result.current.openModal(mockItem, 'rang-a');
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.activeTab).toBe('rang-a');
      
      act(() => {
        result.current.closeModal();
      });
      
      expect(result.current.modalState).toEqual({
        isOpen: false,
        item: null,
        activeTab: 'overview'
      });
    });

    it('devrait être idempotent (fermer plusieurs fois)', () => {
      const { result } = renderHook(() => useEdnModal());
      
      act(() => {
        result.current.openModal(mockItem);
        result.current.closeModal();
        result.current.closeModal();
        result.current.closeModal();
      });
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.item).toBe(null);
    });
  });

  describe('Changement de tab', () => {
    it('devrait changer le tab actif', () => {
      const { result } = renderHook(() => useEdnModal());
      
      act(() => {
        result.current.openModal(mockItem);
      });
      
      expect(result.current.activeTab).toBe('overview');
      
      act(() => {
        result.current.setActiveTab('rang-a');
      });
      
      expect(result.current.activeTab).toBe('rang-a');
    });

    it('devrait changer le tab sans affecter l\'item', () => {
      const { result } = renderHook(() => useEdnModal());
      
      act(() => {
        result.current.openModal(mockItem);
        result.current.setActiveTab('music');
      });
      
      expect(result.current.item).toBe(mockItem);
      expect(result.current.isOpen).toBe(true);
      expect(result.current.activeTab).toBe('music');
    });

    it('devrait permettre de changer plusieurs fois de tab', () => {
      const { result } = renderHook(() => useEdnModal());
      
      act(() => {
        result.current.openModal(mockItem);
      });
      
      const tabs = ['rang-a', 'rang-b', 'music', 'overview'];
      
      tabs.forEach(tab => {
        act(() => {
          result.current.setActiveTab(tab);
        });
        expect(result.current.activeTab).toBe(tab);
      });
    });
  });

  describe('Scénarios complexes', () => {
    it('devrait gérer un workflow complet', () => {
      const { result } = renderHook(() => useEdnModal());
      
      // Ouvrir
      act(() => {
        result.current.openModal(mockItem, 'overview');
      });
      expect(result.current.isOpen).toBe(true);
      
      // Changer de tab
      act(() => {
        result.current.setActiveTab('rang-a');
      });
      expect(result.current.activeTab).toBe('rang-a');
      
      // Changer d'item
      act(() => {
        result.current.openModal(mockItem2, 'music');
      });
      expect(result.current.item?.id).toBe('2');
      expect(result.current.activeTab).toBe('music');
      
      // Fermer
      act(() => {
        result.current.closeModal();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('devrait gérer le changement de tab sur modal fermé', () => {
      const { result } = renderHook(() => useEdnModal());
      
      act(() => {
        result.current.setActiveTab('rang-a');
      });
      
      expect(result.current.activeTab).toBe('rang-a');
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Stabilité des références', () => {
    it('les fonctions devraient être stables entre re-renders', () => {
      const { result, rerender } = renderHook(() => useEdnModal());
      
      const openModal1 = result.current.openModal;
      const closeModal1 = result.current.closeModal;
      const setActiveTab1 = result.current.setActiveTab;
      
      rerender();
      
      expect(result.current.openModal).toBe(openModal1);
      expect(result.current.closeModal).toBe(closeModal1);
      expect(result.current.setActiveTab).toBe(setActiveTab1);
    });
  });
});
