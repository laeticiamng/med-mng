
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface InteractionSectionProps {
  interactionConfig: any;
  itemCode: string;
}

export const InteractionSection: React.FC<InteractionSectionProps> = ({ 
  interactionConfig, 
  itemCode 
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string>('');
  const [completed, setCompleted] = useState(false);

  if (!interactionConfig) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">⚠️ Interaction - Contenu indisponible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">L'interaction n'est pas encore disponible dans Supabase.</p>
        </CardContent>
      </Card>
    );
  }

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem) {
      setMatches(prev => ({
        ...prev,
        [draggedItem]: targetId
      }));
      setDraggedItem(null);
    }
  };

  const checkAnswers = () => {
    if (!interactionConfig.pairs) return;
    
    let correct = 0;
    const total = interactionConfig.pairs.length;
    
    interactionConfig.pairs.forEach((pair: any) => {
      if (matches[pair.concept] === pair.definition) {
        correct++;
      }
    });
    
    const percentage = Math.round((correct / total) * 100);
    setFeedback(`${correct}/${total} bonnes réponses (${percentage}%)`);
    setCompleted(true);
  };

  const resetInteraction = () => {
    setMatches({});
    setFeedback('');
    setCompleted(false);
  };

  const concepts = interactionConfig.items?.filter((item: any) => item.category === 'concept') || [];
  const definitions = interactionConfig.items?.filter((item: any) => item.category === 'definition') || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{interactionConfig.title || `Interaction ${itemCode}`}</span>
          <Badge variant="outline">Glisser-Déposer</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Concepts */}
          <div>
            <h3 className="font-semibold mb-4 text-blue-800">Concepts</h3>
            <div className="space-y-2">
              {concepts.map((concept: any) => (
                <div
                  key={concept.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, concept.id)}
                  className={`p-3 bg-blue-100 border-2 border-blue-300 rounded cursor-move transition-all ${
                    draggedItem === concept.id ? 'opacity-50' : 'hover:bg-blue-200'
                  } ${matches[concept.id] ? 'opacity-50' : ''}`}
                >
                  {concept.text}
                </div>
              ))}
            </div>
          </div>

          {/* Definitions */}
          <div>
            <h3 className="font-semibold mb-4 text-green-800">Définitions</h3>
            <div className="space-y-2">
              {definitions.map((definition: any) => (
                <div
                  key={definition.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, definition.id)}
                  className={`p-3 bg-green-100 border-2 border-dashed border-green-300 rounded min-h-[60px] transition-all ${
                    Object.values(matches).includes(definition.id) 
                      ? 'bg-green-200 border-solid border-green-400' 
                      : 'hover:bg-green-200'
                  }`}
                >
                  <div className="text-sm text-green-700 mb-1">Zone de dépôt</div>
                  <div>{definition.text}</div>
                  {Object.values(matches).includes(definition.id) && (
                    <div className="mt-2 flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">Association créée</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {feedback && (
          <div className={`p-4 rounded border-l-4 ${
            feedback.includes('100%') ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.includes('100%') ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <span className="font-medium">{feedback}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={checkAnswers}
            disabled={Object.keys(matches).length === 0}
            variant="default"
          >
            Vérifier les réponses
          </Button>
          <Button 
            onClick={resetInteraction}
            variant="outline"
          >
            Recommencer
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          <p>💡 Glissez les concepts vers les définitions correspondantes, puis cliquez sur "Vérifier les réponses".</p>
        </div>
      </CardContent>
    </Card>
  );
};
