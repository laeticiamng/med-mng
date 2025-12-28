
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, Flame, Star, GripVertical } from 'lucide-react';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  closestCenter
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

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

// Draggable Concept Component
const DraggableConcept = ({ id, concept, isUsed }: { id: string; concept: string; isUsed: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragging ? 'opacity-50 scale-105 shadow-xl' : ''}
        ${isUsed ? 'opacity-40 pointer-events-none bg-muted' : 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:from-primary/20 hover:to-accent/20'}
      `}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <span className="text-primary font-medium">{concept}</span>
      </div>
    </div>
  );
};

// Droppable Phrase Component
const DroppablePhrase = ({ 
  id, 
  phrase, 
  matchedConcept, 
  matchResult 
}: { 
  id: string; 
  phrase: string; 
  matchedConcept?: string;
  matchResult: 'correct' | 'incorrect' | null;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-lg transition-all duration-300 border-2 border-dashed
        ${isOver ? 'border-primary bg-primary/10 scale-102' : ''}
        ${matchResult === 'correct' ? 'bg-success/10 border-success border-solid shadow-lg' : ''}
        ${matchResult === 'incorrect' ? 'bg-destructive/10 border-destructive border-solid' : ''}
        ${!matchResult && matchedConcept ? 'bg-primary/10 border-primary border-solid' : ''}
        ${!matchResult && !matchedConcept && !isOver ? 'bg-background border-muted-foreground/30' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-foreground font-medium">{phrase}</span>
        {matchResult === 'correct' && <CheckCircle className="h-5 w-5 text-success" />}
        {matchResult === 'incorrect' && <XCircle className="h-5 w-5 text-destructive" />}
      </div>
      {matchedConcept && (
        <Badge variant="outline" className="mt-2">
          → {matchedConcept}
        </Badge>
      )}
    </div>
  );
};

export const InteractionDragDrop = ({ config }: InteractionDragDropProps) => {
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
  const hasTrackedRef = useRef(false);
  
  const [matches, setMatches] = useState<{ [phrase: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'interaction_drag_drop', action: 'view', type: config.type }
      });
    }
  }, [config.type, logActivity]);

  const phrases = config.exemples.map(ex => ex.phrase);
  const concepts = config.exemples.map(ex => ex.concept);

  // Memoized shuffled concepts (shuffle only once)
  const [shuffledConcepts] = useState(() => [...concepts].sort(() => Math.random() - 0.5));

  const usedConcepts = new Set(Object.values(matches));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    
    if (over && active) {
      const concept = active.id as string;
      const phrase = over.id as string;
      
      // Only allow dropping on phrases
      if (phrases.includes(phrase)) {
        // Remove concept from previous match if any
        const newMatches = { ...matches };
        Object.keys(newMatches).forEach(key => {
          if (newMatches[key] === concept) {
            delete newMatches[key];
          }
        });
        // Add new match
        newMatches[phrase] = concept;
        setMatches(newMatches);
      }
    }
  }, [matches, phrases]);

  const checkAnswers = useCallback(async () => {
    let correctCount = 0;
    config.exemples.forEach(ex => {
      if (matches[ex.phrase] === ex.concept) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    
    const scorePercentage = Math.round((correctCount / config.exemples.length) * 100);
    
    // Log activity avec score persisté
    logActivity({
      activity_type: 'study',
      count: 1,
      score: scorePercentage,
      metadata: { 
        component: 'interaction_drag_drop', 
        action: 'check_answers',
        correct: correctCount,
        total: config.exemples.length,
        matches: matches
      }
    });
    
    // Sauvegarder dans user_activities pour persistance
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: 'drag_drop_quiz',
        count: 1,
        score: scorePercentage,
        duration_seconds: 0,
        metadata: {
          correct: correctCount,
          total: config.exemples.length,
          type: config.type,
          matches: matches
        }
      });
      
      if (correctCount === config.exemples.length) {
        await addPoints(user.id, 'perfectExam');
      } else if (correctCount > 0) {
        await addPoints(user.id, 'itemReviewed');
      }
    }
  }, [matches, config.exemples, config.type, logActivity, addPoints]);

  const resetGame = useCallback(() => {
    setMatches({});
    setShowResults(false);
    setScore(0);
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'interaction_drag_drop', action: 'reset' }
    });
  }, [logActivity]);

  const getMatchResult = useCallback((phrase: string): 'correct' | 'incorrect' | null => {
    const correctConcept = config.exemples.find(ex => ex.phrase === phrase)?.concept;
    const userMatch = matches[phrase];
    
    if (!showResults || !userMatch) return null;
    
    return userMatch === correctConcept ? 'correct' : 'incorrect';
  }, [showResults, matches, config.exemples]);

  const activeConcept = activeDragId ? shuffledConcepts.find(c => c === activeDragId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-3xl font-serif text-warning-foreground">Interaction Pratique</h2>
            {stats && (
              <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
                <Flame className="h-4 w-4 text-warning" />
                <span className="text-sm font-bold text-warning">{stats.currentStreak}j</span>
                <Star className="h-4 w-4 text-primary ml-1" />
                <span className="text-sm font-bold text-primary">Nv.{stats.level}</span>
              </div>
            )}
          </div>
          <p className="text-warning-foreground/80 text-lg">{config.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Glissez les concepts vers les phrases correspondantes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Phrases (droppable zones) */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-warning-foreground mb-4">Phrases à associer</h3>
            {phrases.map((phrase, index) => (
              <DroppablePhrase
                key={index}
                id={phrase}
                phrase={phrase}
                matchedConcept={matches[phrase]}
                matchResult={getMatchResult(phrase)}
              />
            ))}
          </div>

          {/* Concepts (draggable items) */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-warning-foreground mb-4">Concepts à glisser</h3>
            {shuffledConcepts.map((concept, index) => (
              <DraggableConcept
                key={index}
                id={concept}
                concept={concept}
                isUsed={usedConcepts.has(concept)}
              />
            ))}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeConcept ? (
            <Card className="p-4 bg-primary text-primary-foreground shadow-2xl transform rotate-3">
              <span className="font-medium">{activeConcept}</span>
            </Card>
          ) : null}
        </DragOverlay>

        <div className="text-center space-y-4">
          {!showResults ? (
            <Button
              onClick={checkAnswers}
              disabled={Object.keys(matches).length < phrases.length}
              className="bg-warning hover:bg-warning/90 text-warning-foreground px-8 py-3"
              size="lg"
            >
              Vérifier mes réponses ({Object.keys(matches).length}/{phrases.length})
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
    </DndContext>
  );
};
