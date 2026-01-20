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

export const useFlashcards = () => {
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const { toast } = useToast();

  // Load decks from Supabase
  const loadDecks = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mappedDecks: FlashcardDeck[] = (data || []).map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        name: d.name,
        description: d.description || '',
        category: d.item_codes?.[0] || 'general',
        cardCount: d.card_count || 0,
        isPublic: d.is_public || false,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        color: 'hsl(var(--primary))',
        icon: '📚'
      }));

      setDecks(mappedDecks);
      return mappedDecks;
    } catch (error) {
      console.error('Error loading decks:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les decks de flashcards. Veuillez réessayer.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create a new deck in Supabase
  const createDeck = useCallback(async (
    userId: string,
    name: string,
    description: string,
    category: string,
    color: string = 'hsl(var(--primary))',
    icon: string = '📚'
  ): Promise<FlashcardDeck | null> => {
    try {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .insert({
          user_id: userId,
          name,
          description,
          item_codes: [category],
          card_count: 0,
          is_public: false,
        } as any)
        .select()
        .maybeSingle();

      if (error) throw error;

      const newDeck: FlashcardDeck = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description || '',
        category,
        cardCount: 0,
        isPublic: false,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        color,
        icon
      };

      setDecks(prev => [newDeck, ...prev]);
      
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

  // Delete deck from Supabase
  const deleteDeck = useCallback(async (deckId: string) => {
    try {
      // Delete all cards first
      await supabase
        .from('flashcards')
        .delete()
        .eq('deck_id', deckId);

      // Then delete deck
      const { error } = await supabase
        .from('flashcard_decks')
        .delete()
        .eq('id', deckId);

      if (error) throw error;

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

  // Load cards for a deck from Supabase
  const loadCards = useCallback(async (deckId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedCards: Flashcard[] = (data || []).map((c: any) => ({
        id: c.id,
        deckId: c.deck_id,
        front: c.front_content,
        back: c.back_content,
        tags: c.tags || [],
        itemCode: c.item_code,
        difficulty: (c.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        createdAt: c.created_at,
        lastReviewed: c.last_reviewed,
        reviewCount: c.review_count || 0,
        correctCount: c.correct_count || 0
      }));

      setCards(mappedCards);
      
      // Load current deck info
      const deck = decks.find(d => d.id === deckId);
      setCurrentDeck(deck || null);
      
      return mappedCards;
    } catch (error) {
      console.error('Error loading cards:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [decks]);

  // Add a card to Supabase
  const addCard = useCallback(async (
    deckId: string,
    front: string,
    back: string,
    tags: string[] = [],
    itemCode?: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<Flashcard | null> => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          deck_id: deckId,
          front_content: front,
          back_content: back,
          tags,
          item_code: itemCode,
          difficulty,
          review_count: 0,
          correct_count: 0,
        } as any)
        .select()
        .maybeSingle();

      if (error) throw error;

      // Update deck card count - fixed operator precedence bug
      const currentCount = decks.find(d => d.id === deckId)?.cardCount || 0;
      await supabase
        .from('flashcard_decks')
        .update({
          card_count: currentCount + 1,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', deckId);

      const newCard: Flashcard = {
        id: data.id,
        deckId: data.deck_id,
        front: data.front_content,
        back: data.back_content,
        tags: data.tags || [],
        itemCode: data.item_code,
        difficulty: (data.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        createdAt: data.created_at,
        reviewCount: 0,
        correctCount: 0
      };

      setCards(prev => [newCard, ...prev]);
      return newCard;
    } catch (error) {
      console.error('Error adding card:', error);
      return null;
    }
  }, [decks]);

  // Delete card from Supabase
  const deleteCard = useCallback(async (cardId: string) => {
    try {
      const card = cards.find(c => c.id === cardId);
      
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      // Update deck card count
      if (card) {
        const deck = decks.find(d => d.id === card.deckId);
        if (deck) {
          await supabase
            .from('flashcard_decks')
            .update({ 
              card_count: Math.max(0, deck.cardCount - 1),
              updated_at: new Date().toISOString() 
            } as any)
            .eq('id', card.deckId);
        }
      }

      setCards(prev => prev.filter(c => c.id !== cardId));
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  }, [cards, decks]);

  // Generate AI flashcards from an item
  const generateFromItem = useCallback(async (
    deckId: string,
    itemCode: string
  ): Promise<Flashcard[]> => {
    setLoading(true);
    try {
      // Use edn_items_complete which is properly typed (not edn_items_immersive)
      const { data: item } = await supabase
        .from('edn_items_complete')
        .select('item_code, title, tableau_rang_a, tableau_rang_b')
        .eq('item_code', itemCode)
        .maybeSingle();

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

  // Record review in Supabase
  const recordReview = useCallback(async (
    cardId: string,
    wasCorrect: boolean
  ) => {
    try {
      const card = cards.find(c => c.id === cardId);
      if (!card) return false;

      const { error } = await supabase
        .from('flashcards')
        .update({
          review_count: card.reviewCount + 1,
          correct_count: wasCorrect ? card.correctCount + 1 : card.correctCount,
          last_reviewed: new Date().toISOString(),
        } as any)
        .eq('id', cardId);

      if (error) throw error;

      // Also log to flashcard_reviews
      await supabase.from('flashcard_reviews').insert({
        flashcard_id: cardId,
        was_correct: wasCorrect,
        reviewed_at: new Date().toISOString(),
      } as any);

      // Update local state
      setCards(prev => prev.map(c => 
        c.id === cardId 
          ? { 
              ...c, 
              reviewCount: c.reviewCount + 1,
              correctCount: wasCorrect ? c.correctCount + 1 : c.correctCount,
              lastReviewed: new Date().toISOString()
            }
          : c
      ));

      return true;
    } catch (error) {
      console.error('Error recording review:', error);
      return false;
    }
  }, [cards]);

  // Get statistics from Supabase
  const getStats = useCallback(async (userId: string): Promise<FlashcardStats> => {
    try {
      // Get deck count
      const { count: deckCount } = await supabase
        .from('flashcard_decks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get total cards
      const { data: userDecks } = await supabase
        .from('flashcard_decks')
        .select('id')
        .eq('user_id', userId);

      const deckIds = userDecks?.map(d => d.id) || [];
      
      let totalCards = 0;
      let totalReviews = 0;
      let correctReviews = 0;

      if (deckIds.length > 0) {
        const { data: cardsData } = await supabase
          .from('flashcards')
          .select('review_count, correct_count')
          .in('deck_id', deckIds);

        cardsData?.forEach(c => {
          totalCards++;
          totalReviews += c.review_count || 0;
          correctReviews += c.correct_count || 0;
        });
      }

      // Today's reviews
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('flashcard_reviews')
        .select('*', { count: 'exact', head: true })
        .gte('reviewed_at', today);

      // Calculate streak days from flashcard_reviews
      let streakDays = 0;
      const { data: recentReviews } = await supabase
        .from('flashcard_reviews')
        .select('reviewed_at')
        .order('reviewed_at', { ascending: false })
        .limit(30);
      
      if (recentReviews && recentReviews.length > 0) {
        const uniqueDays = new Set(
          recentReviews.map((r: any) => new Date(r.reviewed_at).toDateString())
        );
        const sortedDays = Array.from(uniqueDays).sort((a, b) => 
          new Date(b).getTime() - new Date(a).getTime()
        );
        
        let currentDate = new Date();
        for (const day of sortedDays) {
          if (new Date(day).toDateString() === currentDate.toDateString() ||
              new Date(day).toDateString() === new Date(currentDate.getTime() - 86400000).toDateString()) {
            streakDays++;
            currentDate = new Date(currentDate.getTime() - 86400000);
          } else break;
        }
      }

      // Calculate weekly progress
      const weeklyProgress: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date();
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        const { count: dayCount } = await supabase
          .from('flashcard_reviews')
          .select('*', { count: 'exact', head: true })
          .gte('reviewed_at', dayStart.toISOString())
          .lte('reviewed_at', dayEnd.toISOString());
        
        weeklyProgress.push(dayCount || 0);
      }

      return {
        totalDecks: deckCount || 0,
        totalCards,
        cardsReviewed: totalReviews,
        accuracy: totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0,
        streakDays,
        todayReviewed: todayCount || 0,
        weeklyProgress
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalDecks: 0,
        totalCards: 0,
        cardsReviewed: 0,
        accuracy: 0,
        streakDays: 0,
        todayReviewed: 0,
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
      };
    }
  }, []);

  // Update an existing card
  const updateCard = useCallback(async (
    cardId: string,
    updates: Partial<Pick<Flashcard, 'front' | 'back' | 'tags' | 'difficulty'>>
  ): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (updates.front) updateData.front_content = updates.front;
      if (updates.back) updateData.back_content = updates.back;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.difficulty) updateData.difficulty = updates.difficulty;

      const { error } = await supabase
        .from('flashcards')
        .update(updateData)
        .eq('id', cardId);

      if (error) throw error;

      setCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, ...updates } : c
      ));

      toast({
        title: "Carte mise à jour",
        description: "Les modifications ont été enregistrées"
      });

      return true;
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la carte",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Duplicate a deck with all its cards
  const duplicateDeck = useCallback(async (
    deckId: string,
    userId: string,
    newName?: string
  ): Promise<FlashcardDeck | null> => {
    try {
      const originalDeck = decks.find(d => d.id === deckId);
      if (!originalDeck) return null;

      // Create new deck
      const newDeck = await createDeck(
        userId,
        newName || `${originalDeck.name} (copie)`,
        originalDeck.description,
        originalDeck.category,
        originalDeck.color,
        originalDeck.icon
      );

      if (!newDeck) return null;

      // Copy all cards
      const originalCards = await loadCards(deckId);
      for (const card of originalCards) {
        await addCard(
          newDeck.id,
          card.front,
          card.back,
          card.tags,
          card.itemCode,
          card.difficulty
        );
      }

      toast({
        title: "Deck dupliqué",
        description: `${originalCards.length} cartes copiées`
      });

      return newDeck;
    } catch (error) {
      console.error('Error duplicating deck:', error);
      return null;
    }
  }, [decks, createDeck, loadCards, addCard, toast]);

  // Export deck to JSON
  const exportDeck = useCallback(async (deckId: string): Promise<string | null> => {
    try {
      const deck = decks.find(d => d.id === deckId);
      if (!deck) return null;

      const deckCards = await loadCards(deckId);

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        deck: {
          name: deck.name,
          description: deck.description,
          category: deck.category,
          color: deck.color,
          icon: deck.icon
        },
        cards: deckCards.map(c => ({
          front: c.front,
          back: c.back,
          tags: c.tags,
          difficulty: c.difficulty
        }))
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting deck:', error);
      return null;
    }
  }, [decks, loadCards]);

  // Import deck from JSON
  const importDeck = useCallback(async (
    userId: string,
    jsonData: string
  ): Promise<FlashcardDeck | null> => {
    try {
      const data = JSON.parse(jsonData);

      if (!data.deck || !data.cards) {
        throw new Error('Format de fichier invalide');
      }

      const newDeck = await createDeck(
        userId,
        data.deck.name,
        data.deck.description || '',
        data.deck.category || 'general',
        data.deck.color,
        data.deck.icon
      );

      if (!newDeck) return null;

      for (const card of data.cards) {
        await addCard(
          newDeck.id,
          card.front,
          card.back,
          card.tags || [],
          undefined,
          card.difficulty || 'medium'
        );
      }

      toast({
        title: "Deck importé",
        description: `${data.cards.length} cartes importées`
      });

      return newDeck;
    } catch (error) {
      console.error('Error importing deck:', error);
      toast({
        title: "Erreur d'import",
        description: "Le fichier n'est pas valide",
        variant: "destructive"
      });
      return null;
    }
  }, [createDeck, addCard, toast]);

  // Search cards in current deck
  const searchCards = useCallback((query: string): Flashcard[] => {
    if (!query.trim()) return cards;

    const queryLower = query.toLowerCase();
    return cards.filter(c =>
      c.front.toLowerCase().includes(queryLower) ||
      c.back.toLowerCase().includes(queryLower) ||
      c.tags.some(t => t.toLowerCase().includes(queryLower))
    );
  }, [cards]);

  // Get cards due for review (SRS logic)
  const getDueCards = useCallback((deckId?: string): Flashcard[] => {
    const targetCards = deckId ? cards.filter(c => c.deckId === deckId) : cards;
    const now = new Date();

    return targetCards.filter(card => {
      if (!card.lastReviewed) return true; // Never reviewed

      const lastReview = new Date(card.lastReviewed);
      const accuracy = card.reviewCount > 0
        ? card.correctCount / card.reviewCount
        : 0.5;

      // Calculate interval based on accuracy and difficulty
      let intervalDays = 1;
      if (accuracy >= 0.9) intervalDays = card.difficulty === 'easy' ? 7 : card.difficulty === 'medium' ? 5 : 3;
      else if (accuracy >= 0.7) intervalDays = card.difficulty === 'easy' ? 4 : card.difficulty === 'medium' ? 3 : 2;
      else intervalDays = 1;

      const dueDate = new Date(lastReview);
      dueDate.setDate(dueDate.getDate() + intervalDays);

      return now >= dueDate;
    });
  }, [cards]);

  // Shuffle cards for review
  const shuffleCards = useCallback((cardsToShuffle: Flashcard[]): Flashcard[] => {
    const shuffled = [...cardsToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Get card accuracy
  const getCardAccuracy = useCallback((cardId: string): number => {
    const card = cards.find(c => c.id === cardId);
    if (!card || card.reviewCount === 0) return 0;
    return Math.round((card.correctCount / card.reviewCount) * 100);
  }, [cards]);

  // Get deck progress
  const getDeckProgress = useCallback((deckId: string): {
    totalCards: number;
    masteredCards: number;
    dueCards: number;
    averageAccuracy: number;
  } => {
    const deckCards = cards.filter(c => c.deckId === deckId);
    const dueCards = getDueCards(deckId);

    const masteredCards = deckCards.filter(c =>
      c.reviewCount >= 3 && (c.correctCount / c.reviewCount) >= 0.8
    );

    const totalReviews = deckCards.reduce((sum, c) => sum + c.reviewCount, 0);
    const totalCorrect = deckCards.reduce((sum, c) => sum + c.correctCount, 0);
    const avgAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    return {
      totalCards: deckCards.length,
      masteredCards: masteredCards.length,
      dueCards: dueCards.length,
      averageAccuracy: avgAccuracy
    };
  }, [cards, getDueCards]);

  // Bulk add cards
  const bulkAddCards = useCallback(async (
    deckId: string,
    cardsData: Array<{ front: string; back: string; tags?: string[]; difficulty?: 'easy' | 'medium' | 'hard' }>
  ): Promise<Flashcard[]> => {
    const addedCards: Flashcard[] = [];

    for (const cardData of cardsData) {
      const card = await addCard(
        deckId,
        cardData.front,
        cardData.back,
        cardData.tags || [],
        undefined,
        cardData.difficulty || 'medium'
      );
      if (card) addedCards.push(card);
    }

    toast({
      title: "Cartes ajoutées",
      description: `${addedCards.length} cartes créées`
    });

    return addedCards;
  }, [addCard, toast]);

  // Get review history for a card
  const getReviewHistory = useCallback(async (cardId: string): Promise<{
    date: string;
    wasCorrect: boolean;
  }[]> => {
    try {
      const { data, error } = await supabase
        .from('flashcard_reviews')
        .select('reviewed_at, quality')
        .eq('flashcard_id', cardId)
        .order('reviewed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(r => ({
        date: r.reviewed_at,
        wasCorrect: (r.quality || 0) >= 3 // quality >= 3 means correct
      }));
    } catch (error) {
      console.error('Error getting review history:', error);
      return [];
    }
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
    updateCard,
    generateFromItem,
    recordReview,
    getStats,
    duplicateDeck,
    exportDeck,
    importDeck,
    searchCards,
    getDueCards,
    shuffleCards,
    getCardAccuracy,
    getDeckProgress,
    bulkAddCards,
    getReviewHistory
  };
};