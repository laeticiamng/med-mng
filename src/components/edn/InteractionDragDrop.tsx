
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface InteractionDragDropProps {
  config: {
    type: string;
    description: string;
    exemples: Array<{
      phrase: string;
      concept: string;
    }>;
    feedback: string;
  };
}

export const InteractionDragDrop = ({ config }: InteractionDragDropProps) => {
  const [matches, setMatches] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const phrases = config.exemples.map(ex => ex.phrase);
  const concepts = config.exemples.map(ex => ex.concept).sort(() => Math.random() - 0.5);

  const handleMatch = (phrase: string, concept: string) => {
    setMatches(prev => ({
      ...prev,
      [phrase]: concept
    }));
  };

  const checkAnswers = () => {
    let correctCount = 0;
    config.exemples.forEach(ex => {
      if (matches[ex.phrase] === ex.concept) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const resetGame = () => {
    setMatches({});
    setShowResults(false);
    setScore(0);
  };

  const getMatchResult = (phrase: string) => {
    const correctConcept = config.exemples.find(ex => ex.phrase === phrase)?.concept;
    const userMatch = matches[phrase];
    
    if (!showResults || !userMatch) return null;
    
    return userMatch === correctConcept ? 'correct' : 'incorrect';
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-warning-foreground mb-4">Interaction Pratique</h2>
        <p className="text-warning-foreground/80 text-lg">{config.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phrases */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-warning-foreground mb-4">Phrases à associer</h3>
          {phrases.map((phrase, index) => {
            const matchResult = getMatchResult(phrase);
            return (
              <Card
                key={index}
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  matchResult === 'correct'
                    ? 'bg-success/10 border-success shadow-lg'
                    : matchResult === 'incorrect'
                    ? 'bg-destructive/10 border-destructive'
                    : matches[phrase]
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background border-warning/20 hover:bg-warning/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">{phrase}</span>
                  {matchResult === 'correct' && <CheckCircle className="h-5 w-5 text-success" />}
                  {matchResult === 'incorrect' && <XCircle className="h-5 w-5 text-destructive" />}
                </div>
                {matches[phrase] && (
                  <Badge variant="outline" className="mt-2">
                    → {matches[phrase]}
                  </Badge>
                )}
              </Card>
            );
          })}
        </div>

        {/* Concepts */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-warning-foreground mb-4">Concepts</h3>
          {concepts.map((concept, index) => (
            <Card
              key={index}
              className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover:from-primary/10 hover:to-accent/10 cursor-pointer transition-all duration-300"
              onClick={() => {
                // Simple matching logic for demo
                const availablePhrase = phrases.find(p => !matches[p]);
                if (availablePhrase) {
                  handleMatch(availablePhrase, concept);
                }
              }}
            >
              <span className="text-primary font-medium">{concept}</span>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center space-y-4">
        {!showResults ? (
          <Button
            onClick={checkAnswers}
            disabled={Object.keys(matches).length < phrases.length}
            className="bg-warning hover:bg-warning/90 text-warning-foreground px-8 py-3"
            size="lg"
          >
            Vérifier mes réponses
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-2xl font-bold text-foreground">
              Score: {score}/{config.exemples.length}
            </div>
            {score === config.exemples.length && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="text-success font-medium">
                  🎉 Parfait ! {config.feedback}
                </div>
              </div>
            )}
            <Button
              onClick={resetGame}
              variant="outline"
              className="border-warning/30 text-warning hover:bg-warning/5"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Recommencer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
