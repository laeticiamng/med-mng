import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Brain,
  Lightbulb,
  Sparkles,
  Clock,
  Target,
  Flame,
  Trophy,
} from 'lucide-react';
import {
  useDueFlashcards,
  useReviewFlashcard,
  Flashcard,
  FlashcardReview,
} from '@/hooks/useFlashcards';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FlashcardDeckProps {
  className?: string;
  deckId?: string;
  onComplete?: (stats: ReviewSessionStats) => void;
}

interface ReviewSessionStats {
  totalReviewed: number;
  correct: number;
  incorrect: number;
  averageTime: number;
  xpEarned: number;
}

const qualityConfig = [
  { quality: 0, label: 'Blackout', color: 'bg-red-500', icon: X },
  { quality: 1, label: 'Difficile', color: 'bg-orange-500', icon: Brain },
  { quality: 2, label: 'Incorrect', color: 'bg-yellow-500', icon: Lightbulb },
  { quality: 3, label: 'Correct', color: 'bg-green-400', icon: Check },
  { quality: 4, label: 'Facile', color: 'bg-green-500', icon: Sparkles },
  { quality: 5, label: 'Parfait', color: 'bg-emerald-500', icon: Trophy },
];

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  className,
  deckId,
  onComplete,
}) => {
  const { data: dueCards, isLoading } = useDueFlashcards();
  const reviewMutation = useReviewFlashcard();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [sessionStats, setSessionStats] = useState<ReviewSessionStats>({
    totalReviewed: 0,
    correct: 0,
    incorrect: 0,
    averageTime: 0,
    xpEarned: 0,
  });
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [showResults, setShowResults] = useState(false);

  // Filter cards by deck if specified
  const cards = useMemo(() => {
    let filtered = dueCards || [];
    if (deckId) {
      filtered = filtered.filter((c) => c.deck_id === deckId);
    }
    return filtered.filter((c) => !reviewedCards.has(c.id));
  }, [dueCards, deckId, reviewedCards]);

  const currentCard = cards[currentIndex] as (Flashcard & { review?: FlashcardReview }) | undefined;
  const progress = dueCards?.length
    ? ((reviewedCards.size / dueCards.length) * 100)
    : 0;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    async (quality: number) => {
      if (!currentCard) return;

      const timeSpent = (Date.now() - cardStartTime) / 1000;

      try {
        await reviewMutation.mutateAsync({
          flashcardId: currentCard.id,
          quality,
          previousReview: currentCard.review,
        });

        // Update stats
        setSessionStats((prev) => ({
          totalReviewed: prev.totalReviewed + 1,
          correct: prev.correct + (quality >= 3 ? 1 : 0),
          incorrect: prev.incorrect + (quality < 3 ? 1 : 0),
          averageTime:
            (prev.averageTime * prev.totalReviewed + timeSpent) / (prev.totalReviewed + 1),
          xpEarned: prev.xpEarned + (quality >= 3 ? 10 : 5),
        }));

        // Mark as reviewed
        setReviewedCards((prev) => new Set([...prev, currentCard.id]));
        setIsFlipped(false);
        setCardStartTime(Date.now());

        // Check if we've reviewed all cards
        if (reviewedCards.size + 1 >= (dueCards?.length || 0)) {
          setShowResults(true);
          onComplete?.(sessionStats);
        } else if (currentIndex >= cards.length - 1) {
          setCurrentIndex(0);
        }
      } catch (error) {
        toast.error('Erreur lors de la sauvegarde');
      }
    },
    [currentCard, cardStartTime, reviewMutation, reviewedCards, dueCards, cards.length, currentIndex, sessionStats, onComplete]
  );

  const handlePrevious = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setCardStartTime(Date.now());
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
    setCardStartTime(Date.now());
  }, [cards.length]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCards(new Set());
    setSessionStats({
      totalReviewed: 0,
      correct: 0,
      incorrect: 0,
      averageTime: 0,
      xpEarned: 0,
    });
    setShowResults(false);
    setCardStartTime(Date.now());
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des flashcards...</p>
        </CardContent>
      </Card>
    );
  }

  // No cards state
  if (!dueCards || dueCards.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold mb-2">Toutes les cartes sont à jour !</h3>
          <p className="text-muted-foreground mb-4">
            Revenez plus tard pour réviser ou créez de nouvelles flashcards.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Rafraîchir
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Results state
  if (showResults) {
    const accuracy = sessionStats.totalReviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.totalReviewed) * 100)
      : 0;

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Session terminée !
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <p className="text-6xl font-bold text-primary mb-2">{accuracy}%</p>
            <p className="text-muted-foreground">Précision</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-center">
              <Check className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{sessionStats.correct}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-center">
              <X className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">{sessionStats.incorrect}</p>
              <p className="text-sm text-muted-foreground">À revoir</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{sessionStats.averageTime.toFixed(1)}s</p>
              <p className="text-xs text-muted-foreground">Temps moyen</p>
            </div>
            <div className="p-4 rounded-lg bg-muted text-center">
              <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <p className="text-lg font-bold">+{sessionStats.xpEarned}</p>
              <p className="text-xs text-muted-foreground">XP gagnés</p>
            </div>
          </div>

          <Button className="w-full" onClick={handleRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Nouvelle session
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Review state
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Révision
          </CardTitle>
          <Badge variant="outline">
            {reviewedCards.size}/{dueCards.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Flashcard */}
        <div
          className="relative h-64 cursor-pointer perspective-1000"
          onClick={handleFlip}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'absolute inset-0 rounded-xl border-2 p-6 flex flex-col items-center justify-center text-center',
                isFlipped
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
              )}
            >
              <Badge
                variant="outline"
                className={cn(
                  'absolute top-3 left-3',
                  isFlipped ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                )}
              >
                {isFlipped ? 'Réponse' : 'Question'}
              </Badge>

              <p className="text-lg font-medium">
                {currentCard ? (isFlipped ? currentCard.back : currentCard.front) : ''}
              </p>

              {!isFlipped && (
                <p className="text-sm text-muted-foreground mt-4">
                  Cliquez pour retourner
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <span className="text-sm text-muted-foreground">
            Carte {currentIndex + 1} sur {cards.length}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= cards.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Rating buttons (only shown when flipped) */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-center text-muted-foreground">
              Comment avez-vous répondu ?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { quality: 1, label: 'Difficile', color: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' },
                { quality: 3, label: 'Correct', color: 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' },
                { quality: 5, label: 'Facile', color: 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' },
              ].map(({ quality, label, color }) => (
                <Button
                  key={quality}
                  variant="outline"
                  className={cn('h-12', color)}
                  onClick={() => handleRate(quality)}
                  disabled={reviewMutation.isPending}
                >
                  {label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Difficulty badge */}
        {currentCard?.difficulty && (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={cn(
                currentCard.difficulty === 'easy' && 'bg-green-100 text-green-700',
                currentCard.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700',
                currentCard.difficulty === 'hard' && 'bg-red-100 text-red-700'
              )}
            >
              <Target className="w-3 h-3 mr-1" />
              {currentCard.difficulty === 'easy' && 'Facile'}
              {currentCard.difficulty === 'medium' && 'Moyen'}
              {currentCard.difficulty === 'hard' && 'Difficile'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashcardDeck;
