import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: string[];
  itemCode?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  lastReviewed?: string;
  reviewCount: number;
  correctCount: number;
}

export interface FlashcardDeck {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  cardCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  color: string;
  icon: string;
}

export interface ReviewSession {
  deckId: string;
  cardsReviewed: number;
  correctAnswers: number;
  startedAt: string;
  completedAt?: string;
}

export interface FlashcardStats {
  totalDecks: number;
  totalCards: number;
  cardsReviewed: number;
  accuracy: number;
  streakDays: number;
  todayReviewed: number;
  weeklyProgress: number[];
}

const STORAGE_KEY = 'flashcard_data';

// Helper to get/set local storage
const getStoredData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { decks: [], cards: [], reviews: [] };
};

const setStoredData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const useFlashcards = () => {
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const { toast } = useToast();

  // Load decks
  const loadDecks = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const stored = getStoredData();
      const userDecks = stored.decks.filter((d: FlashcardDeck) => d.userId === userId);
      setDecks(userDecks);
      return userDecks;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new deck
  const createDeck = useCallback(async (
    userId: string,
    name: string,
    description: string,
    category: string,
    color: string = 'hsl(var(--primary))',
    icon: string = '📚'
  ): Promise<FlashcardDeck | null> => {
    try {
      const newDeck: FlashcardDeck = {
        id: crypto.randomUUID(),
        userId,
        name,
        description,
        category,
        cardCount: 0,
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color,
        icon
      };

      const stored = getStoredData();
      stored.decks.push(newDeck);
      setStoredData(stored);

      setDecks(prev => [...prev, newDeck]);
      
      toast({
        title: "Deck créé",
        description: `Le deck "${name}" a été créé avec succès`,
      });

      return newDeck;
    } catch (error) {
      console.error('Error creating deck:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le deck",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Delete deck
  const deleteDeck = useCallback(async (deckId: string) => {
    try {
      const stored = getStoredData();
      stored.decks = stored.decks.filter((d: FlashcardDeck) => d.id !== deckId);
      stored.cards = stored.cards.filter((c: Flashcard) => c.deckId !== deckId);
      setStoredData(stored);

      setDecks(prev => prev.filter(d => d.id !== deckId));
      
      toast({
        title: "Deck supprimé",
        description: "Le deck a été supprimé avec succès",
      });

      return true;
    } catch (error) {
      console.error('Error deleting deck:', error);
      return false;
    }
  }, [toast]);

  // Load cards for a deck
  const loadCards = useCallback(async (deckId: string) => {
    setLoading(true);
    try {
      const stored = getStoredData();
      const deckCards = stored.cards.filter((c: Flashcard) => c.deckId === deckId);
      setCards(deckCards);
      
      const deck = stored.decks.find((d: FlashcardDeck) => d.id === deckId);
      setCurrentDeck(deck || null);
      
      return deckCards;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a card
  const addCard = useCallback(async (
    deckId: string,
    front: string,
    back: string,
    tags: string[] = [],
    itemCode?: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<Flashcard | null> => {
    try {
      const newCard: Flashcard = {
        id: crypto.randomUUID(),
        deckId,
        front,
        back,
        tags,
        itemCode,
        difficulty,
        createdAt: new Date().toISOString(),
        reviewCount: 0,
        correctCount: 0
      };

      const stored = getStoredData();
      stored.cards.push(newCard);
      
      // Update deck card count
      const deckIndex = stored.decks.findIndex((d: FlashcardDeck) => d.id === deckId);
      if (deckIndex !== -1) {
        stored.decks[deckIndex].cardCount++;
        stored.decks[deckIndex].updatedAt = new Date().toISOString();
      }
      
      setStoredData(stored);
      setCards(prev => [...prev, newCard]);

      return newCard;
    } catch (error) {
      console.error('Error adding card:', error);
      return null;
    }
  }, []);

  // Delete card
  const deleteCard = useCallback(async (cardId: string) => {
    try {
      const stored = getStoredData();
      const card = stored.cards.find((c: Flashcard) => c.id === cardId);
      
      stored.cards = stored.cards.filter((c: Flashcard) => c.id !== cardId);
      
      // Update deck card count
      if (card) {
        const deckIndex = stored.decks.findIndex((d: FlashcardDeck) => d.id === card.deckId);
        if (deckIndex !== -1) {
          stored.decks[deckIndex].cardCount--;
          stored.decks[deckIndex].updatedAt = new Date().toISOString();
        }
      }
      
      setStoredData(stored);
      setCards(prev => prev.filter(c => c.id !== cardId));

      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  }, []);

  // Generate AI flashcards from an item
  const generateFromItem = useCallback(async (
    deckId: string,
    itemCode: string
  ): Promise<Flashcard[]> => {
    setLoading(true);
    try {
      // Fetch item details
      const { data: item } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, tableau_rang_a, tableau_rang_b')
        .eq('item_code', itemCode)
        .single();

      if (!item) {
        toast({
          title: "Item non trouvé",
          description: `L'item ${itemCode} n'existe pas`,
          variant: "destructive"
        });
        return [];
      }

      const generatedCards: Flashcard[] = [];

      // Generate card from title
      const titleCard = await addCard(
        deckId,
        `Quel est le titre de l'item ${itemCode} ?`,
        item.title,
        ['titre', itemCode],
        itemCode,
        'easy'
      );
      if (titleCard) generatedCards.push(titleCard);

      // Generate cards from competences
      const tableauA = item.tableau_rang_a as any;
      if (tableauA?.competences_cles) {
        const competences = tableauA.competences_cles;
        for (let i = 0; i < Math.min(competences.length, 5); i++) {
          const comp = competences[i];
          if (comp.intitule) {
            const card = await addCard(
              deckId,
              `Item ${itemCode}: Compétence clé #${i + 1}`,
              comp.intitule,
              ['competence', itemCode, 'rang-a'],
              itemCode,
              'medium'
            );
            if (card) generatedCards.push(card);
          }
        }
      }

      // Generate cards from rang B
      const tableauB = item.tableau_rang_b as any;
      if (tableauB?.competences_cles) {
        const competences = tableauB.competences_cles;
        for (let i = 0; i < Math.min(competences.length, 3); i++) {
          const comp = competences[i];
          if (comp.intitule) {
            const card = await addCard(
              deckId,
              `Item ${itemCode} (Rang B): Compétence #${i + 1}`,
              comp.intitule,
              ['competence', itemCode, 'rang-b'],
              itemCode,
              'hard'
            );
            if (card) generatedCards.push(card);
          }
        }
      }

      toast({
        title: "Flashcards générées",
        description: `${generatedCards.length} cartes créées pour l'item ${itemCode}`,
      });

      return generatedCards;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les flashcards",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [addCard, toast]);

  // Record review
  const recordReview = useCallback(async (
    cardId: string,
    wasCorrect: boolean
  ) => {
    try {
      const stored = getStoredData();
      const cardIndex = stored.cards.findIndex((c: Flashcard) => c.id === cardId);
      
      if (cardIndex !== -1) {
        stored.cards[cardIndex].reviewCount++;
        stored.cards[cardIndex].lastReviewed = new Date().toISOString();
        if (wasCorrect) {
          stored.cards[cardIndex].correctCount++;
        }
        setStoredData(stored);
      }

      // Record in reviews array
      stored.reviews.push({
        cardId,
        wasCorrect,
        reviewedAt: new Date().toISOString()
      });
      setStoredData(stored);

      return true;
    } catch (error) {
      console.error('Error recording review:', error);
      return false;
    }
  }, []);

  // Get statistics
  const getStats = useCallback((userId: string): FlashcardStats => {
    const stored = getStoredData();
    const userDecks = stored.decks.filter((d: FlashcardDeck) => d.userId === userId);
    const deckIds = userDecks.map((d: FlashcardDeck) => d.id);
    const userCards = stored.cards.filter((c: Flashcard) => deckIds.includes(c.deckId));
    const userReviews = stored.reviews.filter((r: any) => 
      userCards.some((c: Flashcard) => c.id === r.cardId)
    );

    const today = new Date().toDateString();
    const todayReviews = userReviews.filter((r: any) => 
      new Date(r.reviewedAt).toDateString() === today
    );

    const totalReviews = userReviews.length;
    const correctReviews = userReviews.filter((r: any) => r.wasCorrect).length;

    // Calculate weekly progress (last 7 days)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayReviews = userReviews.filter((r: any) => 
        new Date(r.reviewedAt).toDateString() === date.toDateString()
      );
      weeklyProgress.push(dayReviews.length);
    }

    // Calculate streak (consecutive days with reviews)
    let streakDays = 0;
    const checkDate = new Date();
    while (true) {
      const dayReviews = userReviews.filter((r: any) => 
        new Date(r.reviewedAt).toDateString() === checkDate.toDateString()
      );
      if (dayReviews.length === 0) break;
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      totalDecks: userDecks.length,
      totalCards: userCards.length,
      cardsReviewed: totalReviews,
      accuracy: totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0,
      streakDays,
      todayReviewed: todayReviews.length,
      weeklyProgress
    };
  }, []);

  return {
    loading,
    decks,
    currentDeck,
    cards,
    loadDecks,
    createDeck,
    deleteDeck,
    loadCards,
    addCard,
    deleteCard,
    generateFromItem,
    recordReview,
    getStats
  };
};
