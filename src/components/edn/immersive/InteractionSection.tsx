import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Flame, Star } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface InteractionItem {
  id: string;
  text: string;
  category: 'concept' | 'definition';
}

interface InteractionPair {
  concept: string;
  definition: string;
}

interface InteractionConfig {
  title?: string;
  items?: InteractionItem[];
  pairs?: InteractionPair[];
}

interface InteractionSectionProps {
  interactionConfig: InteractionConfig | null;
  itemCode: string;
}

export const InteractionSection: React.FC<InteractionSectionProps> = ({ 
  interactionConfig, 
  itemCode 
}) => {
  const { logActivity } = useActivityTracking();
  const { addPoints, stats, loadStats } = useGamification();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string>('');
  const [_completed, setCompleted] = useState(false);

  const loadUserStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) loadStats(user.id);
  }, [loadStats]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

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
    if (!interactionConfig.pairs || interactionConfig.pairs.length === 0) return;
    
    let correct = 0;
    const total = interactionConfig.pairs.length;
    
    interactionConfig.pairs.forEach((pair) => {
      if (matches[pair.concept] === pair.definition) {
        correct++;
      }
    });
    
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    setFeedback(`${correct}/${total} bonnes réponses (${percentage}%)`);
    setCompleted(true);
    
    await logActivity({
      activity_type: 'study',
      count: 1,
      score: percentage,
      metadata: { itemCode, type: 'interaction_drag_drop', correct, total }
    });
    
    if (percentage >= 80) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await addPoints(user.id, POINTS_CONFIG.itemReviewed, 'itemReviewed');
      }
    }
  };

  const resetInteraction = () => {
    setMatches({});
    setFeedback('');
    setCompleted(false);
  };

  const concepts = interactionConfig.items?.filter((item) => item.category === 'concept') || [];
  const definitions = interactionConfig.items?.filter((item) => item.category === 'definition') || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>{interactionConfig.title || `Interaction ${itemCode}`}</span>
            {stats && (
              <div className="flex items-center gap-2 px-2 py-0.5 bg-muted/30 rounded-full text-xs">
                <Flame className="h-3 w-3 text-warning" />
                <span className="font-bold text-warning">{stats.currentStreak ?? 0}</span>
                <Star className="h-3 w-3 text-primary ml-1" />
                <span className="font-bold text-primary">Nv.{stats.level ?? 1}</span>
              </div>
            )}
          </div>
          <Badge variant="outline">Glisser-Déposer</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Concepts */}
          <div>
            <h3 className="font-semibold mb-4 text-primary">Concepts</h3>
            <div className="space-y-2">
              {concepts.map((concept) => (
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
              {definitions.map((definition) => (
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
