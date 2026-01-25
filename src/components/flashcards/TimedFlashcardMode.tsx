import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flashcard } from '@/hooks/useFlashcards';
import { useTimedFlashcards } from '@/hooks/useTimedFlashcards';
import { cn } from '@/lib/utils';
import {
    CheckCircle,
    Flame,
    Pause, Play,
    RotateCcw,
    Target,
    Timer,
    Trophy,
    XCircle,
    Zap
} from 'lucide-react';
import React, { useEffect } from 'react';

interface TimedFlashcardModeProps {
  cards: Flashcard[];
  onComplete: (stats: any) => void;
  onExit: () => void;
  difficulty?: 'easy' | 'normal' | 'hard' | 'extreme';
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  easy: { label: 'Facile', color: 'text-success', icon: <CheckCircle className="h-4 w-4" /> },
  normal: { label: 'Normal', color: 'text-primary', icon: <Target className="h-4 w-4" /> },
  hard: { label: 'Difficile', color: 'text-warning', icon: <Flame className="h-4 w-4" /> },
  extreme: { label: 'Extrême', color: 'text-destructive', icon: <Zap className="h-4 w-4" /> },
};

export function TimedFlashcardMode({ 
  cards, 
  onComplete, 
  onExit, 
  difficulty = 'normal' 
}: TimedFlashcardModeProps) {
  const {
    isActive,
    isPaused,
    currentCard,
    currentCardIndex,
    timeRemaining,
    config,
    stats,
    progress,
    timePercentage,
    totalCards,
    startSession,
    answerCard,
    togglePause,
    endSession,
  } = useTimedFlashcards();

  // Start session on mount
  useEffect(() => {
    if (cards.length > 0 && !isActive) {
      startSession(cards, { difficulty });
    }
  }, [cards, difficulty, startSession, isActive]);

  // Handle session end
  useEffect(() => {
    if (!isActive && stats.totalCards > 0) {
      onComplete(stats);
    }
  }, [isActive, stats, onComplete]);

  const handleAnswer = (isCorrect: boolean) => {
    answerCard(isCorrect);
  };

  const handleExit = () => {
    endSession();
    onExit();
  };

  const difficultyInfo = DIFFICULTY_LABELS[config.difficulty];

  // Timer color based on time remaining
  const timerColor = timePercentage > 50 
    ? 'text-success' 
    : timePercentage > 25 
      ? 'text-warning' 
      : 'text-destructive';

  if (!isActive && stats.totalCards === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  // Results screen
  if (!isActive && stats.totalCards > 0) {
    const accuracy = Math.round((stats.correctCards / stats.totalCards) * 100);
    
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <Trophy className="h-16 w-16 mx-auto text-warning" />
          <h2 className="text-2xl font-bold">Session terminée !</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-success/10 rounded-lg">
              <p className="text-3xl font-bold text-success">{stats.correctCards}</p>
              <p className="text-sm text-muted-foreground">Correctes</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-3xl font-bold text-destructive">{stats.wrongCards}</p>
              <p className="text-sm text-muted-foreground">Incorrectes</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Précision</span>
              <span className="font-bold">{accuracy}%</span>
            </div>
            <Progress value={accuracy} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 bg-muted rounded">
              <p className="font-bold">{stats.score}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <p className="font-bold">{stats.averageTime}s</p>
              <p className="text-xs text-muted-foreground">Temps moy.</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <p className="font-bold">{stats.timeouts}</p>
              <p className="text-xs text-muted-foreground">Timeouts</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onExit} className="flex-1">
              Quitter
            </Button>
            <Button onClick={() => startSession(cards, { difficulty })} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Rejouer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleExit}>
          <XCircle className="h-4 w-4 mr-2" />
          Quitter
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("gap-1", difficultyInfo.color)}>
            {difficultyInfo.icon}
            {difficultyInfo.label}
          </Badge>
          <Badge variant="secondary">
            {currentCardIndex + 1} / {totalCards}
          </Badge>
        </div>

        <Button variant="ghost" size="sm" onClick={togglePause}>
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Timer */}
      <div className="flex justify-center">
        <div className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-full bg-muted",
          timerColor
        )}>
          <Timer className="h-6 w-6" />
          <span className="text-3xl font-mono font-bold">{timeRemaining}s</span>
        </div>
      </div>

      {/* Card */}
      {currentCard && (
        <Card className={cn(
          "min-h-[300px] transition-all",
          isPaused && "opacity-50"
        )}>
          <CardContent className="flex flex-col items-center justify-center p-8 min-h-[300px]">
            {isPaused ? (
              <div className="text-center">
                <Pause className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">En pause</p>
                <Button onClick={togglePause} className="mt-4">
                  <Play className="h-4 w-4 mr-2" />
                  Reprendre
                </Button>
              </div>
            ) : (
              <>
                <p className="text-xl text-center mb-8 font-medium">
                  {currentCard.front}
                </p>
                
                <div className="w-full h-px bg-border my-4" />
                
                <p className="text-sm text-muted-foreground mb-2">Réponse attendue :</p>
                <p className="text-lg text-center text-muted-foreground/70 mb-8">
                  {currentCard.back}
                </p>

                <div className="flex gap-4">
                  <Button 
                    variant="destructive" 
                    size="lg"
                    onClick={() => handleAnswer(false)}
                    className="gap-2 min-w-[120px]"
                  >
                    <XCircle className="h-5 w-5" />
                    Faux
                  </Button>
                  <Button 
                    size="lg"
                    onClick={() => handleAnswer(true)}
                    className="gap-2 min-w-[120px] bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Correct
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats footer */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-1 text-success">
          <CheckCircle className="h-4 w-4" />
          {stats.correctCards}
        </div>
        <div className="flex items-center gap-1 text-destructive">
          <XCircle className="h-4 w-4" />
          {stats.wrongCards}
        </div>
        <div className="flex items-center gap-1 text-warning">
          <Zap className="h-4 w-4" />
          {stats.score} pts
        </div>
      </div>
    </div>
  );
}
