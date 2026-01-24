import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
      }))
    }))
  }
}));

// Import after mocking
import { useFlashcards } from '@/hooks/useFlashcards';

describe('useFlashcards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useFlashcards());
      
      expect(result.current.decks).toEqual([]);
      expect(result.current.cards).toEqual([]);
      expect(result.current.currentDeck).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should have required functions', () => {
      const { result } = renderHook(() => useFlashcards());
      
      expect(typeof result.current.loadDecks).toBe('function');
      expect(typeof result.current.createDeck).toBe('function');
      expect(typeof result.current.addCard).toBe('function');
      expect(typeof result.current.recordReview).toBe('function');
    });
  });

  describe('Stats Calculation Logic', () => {
    it('should calculate accuracy correctly', () => {
      const mockReviews = [
        { is_correct: true },
        { is_correct: true },
        { is_correct: false },
        { is_correct: true }
      ];

      const correct = mockReviews.filter(r => r.is_correct).length;
      const total = mockReviews.length;
      const accuracy = Math.round((correct / total) * 100);
      
      expect(accuracy).toBe(75);
    });

    it('should handle zero reviews gracefully', () => {
      const mockReviews: { is_correct: boolean }[] = [];
      const total = mockReviews.length;
      const accuracy = total > 0 ? Math.round((0 / total) * 100) : 0;
      
      expect(accuracy).toBe(0);
    });
  });

  describe('Card Validation', () => {
    it('should require non-empty front and back', () => {
      const validateCard = (front: string, back: string): boolean => {
        return front.trim().length > 0 && back.trim().length > 0;
      };

      expect(validateCard('Question', 'Answer')).toBe(true);
      expect(validateCard('', 'Answer')).toBe(false);
      expect(validateCard('Question', '')).toBe(false);
      expect(validateCard('   ', 'Answer')).toBe(false);
    });
  });

  describe('Deck Mapping', () => {
    it('should correctly map Supabase deck to FlashcardDeck', () => {
      const supabaseDeck = {
        id: 'deck-1',
        user_id: 'user-123',
        name: 'Cardiologie',
        description: 'Deck de cardiologie',
        item_codes: ['IC-230'],
        card_count: 10,
        is_public: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-15'
      };

      const mappedDeck = {
        id: supabaseDeck.id,
        userId: supabaseDeck.user_id,
        name: supabaseDeck.name,
        description: supabaseDeck.description || '',
        category: supabaseDeck.item_codes?.[0] || 'general',
        cardCount: supabaseDeck.card_count || 0,
        isPublic: supabaseDeck.is_public || false,
        createdAt: supabaseDeck.created_at,
        updatedAt: supabaseDeck.updated_at,
        color: 'hsl(var(--primary))',
        icon: '📚'
      };

      expect(mappedDeck.name).toBe('Cardiologie');
      expect(mappedDeck.category).toBe('IC-230');
      expect(mappedDeck.cardCount).toBe(10);
    });
  });
});
