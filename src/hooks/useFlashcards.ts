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
        .single();

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
        .single();

      if (error) throw error;

      // Update deck card count
      await supabase
        .from('flashcard_decks')
        .update({ 
          card_count: decks.find(d => d.id === deckId)?.cardCount || 0 + 1,
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

      return {
        totalDecks: deckCount || 0,
        totalCards,
        cardsReviewed: totalReviews,
        accuracy: totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0,
        streakDays: 0, // Would need more complex calculation
        todayReviewed: todayCount || 0,
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0] // Simplified
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
        weeklyProgress: []
      };
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
    generateFromItem,
    recordReview,
    getStats
  };
};