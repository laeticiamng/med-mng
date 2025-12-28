import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, ChevronRight, RotateCcw, CheckCircle, 
  XCircle, Eye, EyeOff, Shuffle, BookOpen 
} from 'lucide-react';

interface Competence {
  intitule: string;
  description?: string;
  objectif_id?: string;
  rubrique?: string;
}

interface CompetenceFlashcardProps {
  competences: Competence[];
  rang: 'A' | 'B';
  itemCode: string;
  onClose?: () => void;
}

export const CompetenceFlashcard: React.FC<CompetenceFlashcardProps> = ({
  competences,
  rang,
  itemCode,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<number>>(new Set());
  const [shuffledIndices, setShuffledIndices] = useState<number[]>(
    competences.map((_, i) => i)
  );

  const currentCompetence = competences[shuffledIndices[currentIndex]];
  const progress = ((knownCards.size + unknownCards.size) / competences.length) * 100;

  const handleNext = () => {
    setShowAnswer(false);
    if (currentIndex < competences.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setShowAnswer(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleKnown = () => {
    setKnownCards(prev => new Set([...prev, shuffledIndices[currentIndex]]));
    setUnknownCards(prev => {
      const next = new Set(prev);
      next.delete(shuffledIndices[currentIndex]);
      return next;
    });
    handleNext();
  };

  const handleUnknown = () => {
    setUnknownCards(prev => new Set([...prev, shuffledIndices[currentIndex]]));
    setKnownCards(prev => {
      const next = new Set(prev);
      next.delete(shuffledIndices[currentIndex]);
      return next;
    });
    handleNext();
  };

  const handleShuffle = () => {
    const indices = [...shuffledIndices];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setShuffledIndices(competences.map((_, i) => i));
  };

  if (!currentCompetence) {
    return (
      <Card className="border-2 border-success/30 bg-success/5">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-success" />
          <h3 className="text-xl font-bold mb-2">Session terminée !</h3>
          <p className="text-muted-foreground mb-4">
            Maîtrisées: {knownCards.size} / {competences.length} ({Math.round((knownCards.size / competences.length) * 100)}%)
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Recommencer
            </Button>
            {onClose && (
              <Button onClick={onClose}>Fermer</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={rang === 'A' ? 'border-success/50' : 'border-accent/50'}>
          <BookOpen className="h-3 w-3 mr-1" />
          Flashcards Rang {rang} - {itemCode}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-success">{knownCards.size} ✓</span>
          <span className="text-destructive">{unknownCards.size} ✗</span>
          <span>| {currentIndex + 1}/{competences.length}</span>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Flashcard */}
      <Card 
        className={`min-h-[300px] cursor-pointer transition-all duration-300 ${
          showAnswer ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'
        }`}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          {!showAnswer ? (
            <>
              <Badge className="mb-4">{currentCompetence.objectif_id || `Comp. ${currentIndex + 1}`}</Badge>
              <h3 className="text-xl font-bold text-center mb-4">
                {currentCompetence.intitule}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Cliquez pour voir la description
              </p>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="mb-4">
                {currentCompetence.rubrique || 'Description'}
              </Badge>
              <p className="text-center text-muted-foreground leading-relaxed">
                {currentCompetence.description || 'Aucune description disponible pour cette compétence.'}
              </p>
              <p className="text-sm text-muted-foreground mt-4 flex items-center gap-1">
                <EyeOff className="h-4 w-4" />
                Cliquez pour masquer
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            title="Mélanger"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleUnknown}
            className="gap-1"
          >
            <XCircle className="h-4 w-4" />
            À revoir
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleKnown}
            className="gap-1 bg-success hover:bg-success/90"
          >
            <CheckCircle className="h-4 w-4" />
            Maîtrisée
          </Button>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNext}
          disabled={currentIndex >= competences.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
