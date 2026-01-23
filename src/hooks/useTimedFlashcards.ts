import { useState, useCallback, useRef, useEffect } from 'react';
import { Flashcard } from './useFlashcards';
import { supabase } from '@/integrations/supabase/client';

export interface TimedSessionConfig {
  timePerCard: number; // seconds per card
  totalTime?: number; // optional total session time limit
  penaltyOnTimeout: boolean; // count timeout as wrong answer
  showTimer: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
}

export interface TimedSessionStats {
  totalCards: number;
  correctCards: number;
  wrongCards: number;
  timeouts: number;
  averageTime: number;
  fastestAnswer: number;
  slowestAnswer: number;
  totalTime: number;
  score: number;
}

const DIFFICULTY_SETTINGS: Record<string, { timePerCard: number; bonusMultiplier: number }> = {
  easy: { timePerCard: 30, bonusMultiplier: 1 },
  normal: { timePerCard: 15, bonusMultiplier: 1.5 },
  hard: { timePerCard: 10, bonusMultiplier: 2 },
  extreme: { timePerCard: 5, bonusMultiplier: 3 },
};

export const useTimedFlashcards = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [config, setConfig] = useState<TimedSessionConfig>({
    timePerCard: 15,
    penaltyOnTimeout: true,
    showTimer: true,
    difficulty: 'normal',
  });
  const [stats, setStats] = useState<TimedSessionStats>({
    totalCards: 0,
    correctCards: 0,
    wrongCards: 0,
    timeouts: 0,
    averageTime: 0,
    fastestAnswer: Infinity,
    slowestAnswer: 0,
    totalTime: 0,
    score: 0,
  });

  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const cardStartTimeRef = useRef<number>(0);
  const answerTimesRef = useRef<number[]>([]);

  // Start a timed session
  const startSession = useCallback((cards: Flashcard[], sessionConfig?: Partial<TimedSessionConfig>) => {
    const difficulty = sessionConfig?.difficulty || 'normal';
    const settings = DIFFICULTY_SETTINGS[difficulty];
    
    const finalConfig: TimedSessionConfig = {
      timePerCard: settings.timePerCard,
      penaltyOnTimeout: true,
      showTimer: true,
      difficulty,
      ...sessionConfig,
    };

    setConfig(finalConfig);
    setSessionCards(cards);
    setCurrentCardIndex(0);
    setTimeRemaining(finalConfig.timePerCard);
    setIsActive(true);
    setIsPaused(false);
    cardStartTimeRef.current = Date.now();
    lastTickRef.current = Date.now();
    answerTimesRef.current = [];
    
    setStats({
      totalCards: cards.length,
      correctCards: 0,
      wrongCards: 0,
      timeouts: 0,
      averageTime: 0,
      fastestAnswer: Infinity,
      slowestAnswer: 0,
      totalTime: 0,
      score: 0,
    });
  }, []);

  // Handle timeout - moved before useEffect to avoid dependency issues
  const handleTimeoutRef = useRef<() => void>(() => {});
  const nextCardRef = useRef<() => void>(() => {});

  // Timer effect using requestAnimationFrame for precision
  useEffect(() => {
    if (!isActive || isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const tick = (timestamp: number) => {
      if (!lastTickRef.current) {
        lastTickRef.current = timestamp;
      }

      const elapsed = timestamp - lastTickRef.current;
      
      // Update every ~100ms for smooth display, but calculate precise time
      if (elapsed >= 100) {
        const now = Date.now();
        const cardElapsed = (now - cardStartTimeRef.current) / 1000;
        const remaining = Math.max(0, config.timePerCard - cardElapsed);
        
        setTimeRemaining(Math.ceil(remaining));
        lastTickRef.current = timestamp;

        // Check for timeout
        if (remaining <= 0) {
          handleTimeoutRef.current();
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, isPaused, config.timePerCard]);

  // End the session
  const endSession = useCallback(async () => {
    setIsActive(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    const totalTime = answerTimesRef.current.reduce((a, b) => a + b, 0);
    const avgTime = answerTimesRef.current.length > 0 
      ? totalTime / answerTimesRef.current.length 
      : 0;

    setStats(prev => ({
      ...prev,
      totalTime: Math.round(totalTime),
      averageTime: Math.round(avgTime * 10) / 10,
      fastestAnswer: prev.fastestAnswer === Infinity ? 0 : Math.round(prev.fastestAnswer * 10) / 10,
      slowestAnswer: Math.round(prev.slowestAnswer * 10) / 10,
    }));

    // Save session to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_activity_log').insert({
          user_id: user.id,
          activity_type: 'timed_flashcard_session',
          score: stats.score,
          metadata: {
            difficulty: config.difficulty,
            totalCards: sessionCards.length,
            correctCards: stats.correctCards,
            averageTime: avgTime,
          }
        });
      }
    } catch {
      // Silent fail
    }
  }, [stats, config, sessionCards.length]);

  // Move to next card
  const nextCard = useCallback(() => {
    if (currentCardIndex >= sessionCards.length - 1) {
      endSession();
    } else {
      setCurrentCardIndex(prev => prev + 1);
      setTimeRemaining(config.timePerCard);
      cardStartTimeRef.current = Date.now();
      lastTickRef.current = Date.now();
    }
  }, [currentCardIndex, sessionCards.length, config.timePerCard, endSession]);

  // Update refs
  nextCardRef.current = nextCard;

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (config.penaltyOnTimeout) {
      setStats(prev => ({
        ...prev,
        wrongCards: prev.wrongCards + 1,
        timeouts: prev.timeouts + 1,
      }));
    }
    nextCardRef.current();
  }, [config.penaltyOnTimeout]);

  // Update ref
  handleTimeoutRef.current = handleTimeout;

  // Answer a card
  const answerCard = useCallback((isCorrect: boolean) => {
    const answerTime = (Date.now() - cardStartTimeRef.current) / 1000;
    answerTimesRef.current.push(answerTime);

    setStats(prev => {
      const newCorrect = isCorrect ? prev.correctCards + 1 : prev.correctCards;
      const newWrong = isCorrect ? prev.wrongCards : prev.wrongCards + 1;
      const bonusMultiplier = DIFFICULTY_SETTINGS[config.difficulty].bonusMultiplier;
      
      // Calculate score with time bonus
      const timeBonus = isCorrect ? Math.max(0, (config.timePerCard - answerTime) * 10) : 0;
      const basePoints = isCorrect ? 100 : 0;
      const newScore = prev.score + (basePoints + timeBonus) * bonusMultiplier;

      return {
        ...prev,
        correctCards: newCorrect,
        wrongCards: newWrong,
        fastestAnswer: Math.min(prev.fastestAnswer, answerTime),
        slowestAnswer: Math.max(prev.slowestAnswer, answerTime),
        score: Math.round(newScore),
      };
    });

    nextCard();
  }, [config.timePerCard, config.difficulty, nextCard]);

  // Pause/Resume
  const togglePause = useCallback(() => {
    if (isPaused) {
      // Resuming - adjust card start time to account for pause
      const pauseDuration = Date.now() - lastTickRef.current;
      cardStartTimeRef.current += pauseDuration;
    }
    setIsPaused(prev => !prev);
    lastTickRef.current = Date.now();
  }, [isPaused]);

  // Get current card
  const currentCard = sessionCards[currentCardIndex] || null;

  // Progress percentage
  const progress = sessionCards.length > 0 
    ? ((currentCardIndex + 1) / sessionCards.length) * 100 
    : 0;

  // Time percentage for visual indicator
  const timePercentage = (timeRemaining / config.timePerCard) * 100;

  return {
    // State
    isActive,
    isPaused,
    currentCard,
    currentCardIndex,
    timeRemaining,
    config,
    stats,
    progress,
    timePercentage,
    totalCards: sessionCards.length,

    // Actions
    startSession,
    answerCard,
    togglePause,
    endSession,
  };
};