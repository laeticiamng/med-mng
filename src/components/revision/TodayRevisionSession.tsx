import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Clock,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { usePersonalizedRevision, RevisionItem } from '@/hooks/usePersonalizedRevision';
import { useToast } from '@/hooks/use-toast';

interface TodayRevisionSessionProps {
  items: RevisionItem[];
}

export const TodayRevisionSession: React.FC<TodayRevisionSessionProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionResults, setSessionResults] = useState<Array<{item: RevisionItem, success: boolean}>>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStartTime] = useState(new Date());
  
  const { markItemAsReviewed } = usePersonalizedRevision();
  const { toast } = useToast();

  const currentItem = items[currentIndex];
  const progress = items.length > 0 ? ((currentIndex + (showAnswer ? 0.5 : 0)) / items.length) * 100 : 0;

  const handleAnswer = (success: boolean) => {
    if (!currentItem) return;

    // Marquer l'item comme révisé
    markItemAsReviewed(currentItem.id, success);
    
    // Enregistrer le résultat de la session
    setSessionResults(prev => [...prev, { item: currentItem, success }]);

    // Passer à l'item suivant ou terminer
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Session terminée
      setSessionComplete(true);
      
      const sessionDuration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60);
      const successRate = sessionResults.filter(r => r.success).length / items.length * 100;
      
      toast({
        title: "Session terminée !",
        description: `${sessionDuration} min • ${Math.round(successRate)}% de réussite`,
        variant: "default"
      });
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionResults([]);
    setSessionComplete(false);
  };

  if (sessionComplete) {
    const sessionDuration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60);
    const successRate = sessionResults.filter(r => r.success).length / items.length * 100;
    const strugglingConcepts = sessionResults.filter(r => !r.success);

    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-6 w-6" />
            Session de révision terminée !
          </CardTitle>
          <CardDescription className="text-green-700">
            Excellente session de révision personnalisée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Résultats de la session */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{Math.round(successRate)}%</p>
              <p className="text-sm text-green-700">Taux de réussite</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{sessionDuration}min</p>
              <p className="text-sm text-blue-700">Durée</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">{items.length}</p>
              <p className="text-sm text-purple-700">Concepts</p>
            </div>
          </div>

          {/* Concepts à retravailler */}
          {strugglingConcepts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Concepts à retravailler ({strugglingConcepts.length})
              </h4>
              <div className="space-y-2">
                {strugglingConcepts.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-orange-700">
                      {result.item.item_code}
                    </Badge>
                    <span className="text-orange-600">{result.item.concept}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={restartSession} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Nouvelle session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentItem) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Aucun concept à réviser</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progression */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Question {currentIndex + 1} sur {items.length}</span>
          <span>{Math.round(progress)}% complété</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Carte de révision actuelle */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Brain className="h-5 w-5" />
              {currentItem.concept}
            </CardTitle>
            <div className="flex gap-2">
              <Badge 
                variant={currentItem.difficulty_level === 'hard' ? 'destructive' : 
                        currentItem.difficulty_level === 'medium' ? 'default' : 'secondary'}
              >
                {currentItem.difficulty_level === 'hard' ? 'Difficile' :
                 currentItem.difficulty_level === 'medium' ? 'Moyen' : 'Facile'}
              </Badge>
              <Badge variant="outline">
                {currentItem.item_code}
              </Badge>
            </div>
          </div>
          <CardDescription className="text-blue-700">
            Erreurs: {currentItem.error_frequency} • Maîtrise: {currentItem.mastery_level}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question de révision */}
          <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
            <p className="font-medium text-gray-800 mb-2">
              Pouvez-vous expliquer ce concept ?
            </p>
            <p className="text-gray-700">{currentItem.concept}</p>
            
            {currentItem.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-xs text-gray-500">Mots-clés:</span>
                {currentItem.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Réponse (si révélée) */}
          {showAnswer && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Points clés à retenir:</h4>
              <ul className="space-y-1 text-green-700">
                <li>• Concept fondamental de {currentItem.item_code}</li>
                <li>• {currentItem.concept}</li>
                {currentItem.tags.map((tag, index) => (
                  <li key={index}>• {tag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!showAnswer ? (
              <Button 
                onClick={handleRevealAnswer}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Révéler la réponse
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Difficile
                </Button>
                <Button 
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Maîtrisé
                  {currentIndex < items.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};