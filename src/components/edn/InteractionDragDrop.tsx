
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
        <h2 className="text-3xl font-serif text-amber-900 mb-4">Interaction Pratique</h2>
        <p className="text-amber-700 text-lg">{config.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phrases */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-amber-800 mb-4">Phrases à associer</h3>
          {phrases.map((phrase, index) => {
            const matchResult = getMatchResult(phrase);
            return (
              <Card
                key={index}
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  matchResult === 'correct'
                    ? 'bg-green-50 border-green-300 shadow-lg'
                    : matchResult === 'incorrect'
                    ? 'bg-red-50 border-red-300'
                    : matches[phrase]
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-amber-200 hover:bg-amber-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-amber-900 font-medium">{phrase}</span>
                  {matchResult === 'correct' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {matchResult === 'incorrect' && <XCircle className="h-5 w-5 text-red-600" />}
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
          <h3 className="text-xl font-semibold text-amber-800 mb-4">Concepts</h3>
          {concepts.map((concept, index) => (
            <Card
              key={index}
              className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 cursor-pointer transition-all duration-300"
              onClick={() => {
                // Simple matching logic for demo
                const availablePhrase = phrases.find(p => !matches[p]);
                if (availablePhrase) {
                  handleMatch(availablePhrase, concept);
                }
              }}
            >
              <span className="text-blue-900 font-medium">{concept}</span>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center space-y-4">
        {!showResults ? (
          <Button
            onClick={checkAnswers}
            disabled={Object.keys(matches).length < phrases.length}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
            size="lg"
          >
            Vérifier mes réponses
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-2xl font-bold text-amber-900">
              Score: {score}/{config.exemples.length}
            </div>
            {score === config.exemples.length && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 font-medium">
                  🎉 Parfait ! {config.feedback}
                </div>
              </div>
            )}
            <Button
              onClick={resetGame}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
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
