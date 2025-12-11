import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface InteractionSectionProps {
  interactionConfig: any;
  itemCode: string;
}

export const InteractionSection: React.FC<InteractionSectionProps> = ({ 
  interactionConfig, 
  itemCode 
}) => {
  const { logActivity } = useActivityTracking();
  const { addPoints, unlockBadge } = useGamification();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string>('');
  const [completed, setCompleted] = useState(false);

  if (!interactionConfig) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">⚠️ Interaction - Contenu indisponible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">L'interaction n'est pas encore disponible dans Supabase.</p>
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

  const checkAnswers = async () => {
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
    
    // Track interaction completion
    await logActivity({
      activity_type: 'study',
      count: 1,
      score: percentage,
      metadata: { itemCode, type: 'interaction_drag_drop', correct, total }
    });
    
    // Award points for good performance
    if (percentage >= 80) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await addPoints(user.id, 'itemReviewed');
      }
    }
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
            <h3 className="font-semibold mb-4 text-primary">Concepts</h3>
            <div className="space-y-2">
              {concepts.map((concept: any) => (
                <div
                  key={concept.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, concept.id)}
                  className={`p-3 bg-primary/10 border-2 border-primary/30 rounded cursor-move transition-all ${
                    draggedItem === concept.id ? 'opacity-50' : 'hover:bg-primary/20'
                  } ${matches[concept.id] ? 'opacity-50' : ''}`}
                >
                  {concept.text}
                </div>
              ))}
            </div>
          </div>

          {/* Definitions */}
          <div>
            <h3 className="font-semibold mb-4 text-success">Définitions</h3>
            <div className="space-y-2">
              {definitions.map((definition: any) => (
                <div
                  key={definition.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, definition.id)}
                  className={`p-3 bg-success/10 border-2 border-dashed border-success/30 rounded min-h-[60px] transition-all ${
                    Object.values(matches).includes(definition.id) 
                      ? 'bg-success/20 border-solid border-success/50' 
                      : 'hover:bg-success/20'
                  }`}
                >
                  <div className="text-sm text-success mb-1">Zone de dépôt</div>
                  <div>{definition.text}</div>
                  {Object.values(matches).includes(definition.id) && (
                    <div className="mt-2 flex items-center gap-1 text-success">
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
            feedback.includes('100%') ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.includes('100%') ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning" />
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

        <div className="text-sm text-muted-foreground">
          <p>💡 Glissez les concepts vers les définitions correspondantes, puis cliquez sur "Vérifier les réponses".</p>
        </div>
      </CardContent>
    </Card>
  );
};
