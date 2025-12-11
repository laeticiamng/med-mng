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
  Zap,
  Trophy,
  Flame
} from 'lucide-react';
import { usePersonalizedRevision, RevisionItem } from '@/hooks/usePersonalizedRevision';
import { useToast } from '@/hooks/use-toast';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';

interface TodayRevisionSessionProps {
  items: RevisionItem[];
}

export const TodayRevisionSession: React.FC<TodayRevisionSessionProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionResults, setSessionResults] = useState<Array<{item: RevisionItem, success: boolean}>>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [userId, setUserId] = useState<string | null>(null);
  
  const { markItemAsReviewed } = usePersonalizedRevision();
  const { toast } = useToast();
  const { addPoints, unlockBadge, stats: gamificationStats } = useGamification();
  const { logActivity } = useActivityTracking();

  // Get user on mount
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const currentItem = items[currentIndex];
  const progress = items.length > 0 ? ((currentIndex + (showAnswer ? 0.5 : 0)) / items.length) * 100 : 0;

  const handleAnswer = async (success: boolean) => {
    if (!currentItem) return;

    // Marquer l'item comme révisé
    markItemAsReviewed(currentItem.id, success);
    
    // Enregistrer le résultat de la session
    setSessionResults(prev => [...prev, { item: currentItem, success }]);

    // Award points for review
    if (userId) {
      await addPoints(userId, 'itemReviewed');
      await logActivity({ 
        activity_type: 'srs_review', 
        score: success ? 100 : 50,
        metadata: { item_code: currentItem.item_code, success }
      });
    }

    // Passer à l'item suivant ou terminer
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Session terminée
      setSessionComplete(true);
      
      const sessionDuration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60);
      const successCount = [...sessionResults, { item: currentItem, success }].filter(r => r.success).length;
      const successRate = successCount / items.length * 100;
      
      // Award bonus points for completion
      if (userId) {
        await addPoints(userId, 'dailyStreak');
        await logActivity({
          activity_type: 'srs_review',
          count: items.length,
          duration_seconds: sessionDuration * 60,
          score: successRate,
          metadata: { session_complete: true }
        });
        
        // Check for perfect session badge
        if (successRate === 100 && items.length >= 5) {
          await unlockBadge(userId, 'perfect_exam');
        }
      }
      
      toast({
        title: "🎉 Session terminée !",
        description: `${sessionDuration} min • ${Math.round(successRate)}% de réussite • +${POINTS_CONFIG.itemReviewed * items.length + POINTS_CONFIG.dailyStreak} XP`,
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
      <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-6 w-6" />
            Session de révision terminée !
          </CardTitle>
          <CardDescription className="text-success/80">
            Excellente session de révision personnalisée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Résultats de la session */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-background/60 rounded-lg p-3">
              <p className="text-2xl font-bold text-success">{Math.round(successRate)}%</p>
              <p className="text-sm text-success/80">Taux de réussite</p>
            </div>
            <div className="bg-background/60 rounded-lg p-3">
              <p className="text-2xl font-bold text-primary">{sessionDuration}min</p>
              <p className="text-sm text-primary/80">Durée</p>
            </div>
            <div className="bg-background/60 rounded-lg p-3">
              <p className="text-2xl font-bold text-accent">{items.length}</p>
              <p className="text-sm text-accent/80">Concepts</p>
            </div>
          </div>

          {/* Concepts à retravailler */}
          {strugglingConcepts.length > 0 && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <h4 className="font-medium text-warning mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Concepts à retravailler ({strugglingConcepts.length})
              </h4>
              <div className="space-y-2">
                {strugglingConcepts.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-warning">
                      {result.item.item_code}
                    </Badge>
                    <span className="text-warning/90">{result.item.concept}</span>
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
      <Card className="border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Aucun concept à réviser</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progression */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} sur {items.length}</span>
          <span>{Math.round(progress)}% complété</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Carte de révision actuelle */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
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
          <CardDescription className="text-primary/80">
            Erreurs: {currentItem.error_frequency} • Maîtrise: {currentItem.mastery_level}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question de révision */}
          <div className="bg-background/60 rounded-lg p-4 border border-primary/20">
            <p className="font-medium text-foreground mb-2">
              Pouvez-vous expliquer ce concept ?
            </p>
            <p className="text-foreground/80">{currentItem.concept}</p>
            
            {currentItem.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">Mots-clés:</span>
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
            <div className="bg-success/5 border border-success/20 rounded-lg p-4">
              <h4 className="font-medium text-success mb-2">Points clés à retenir:</h4>
              <ul className="space-y-1 text-success/90">
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
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Zap className="h-4 w-4 mr-2" />
                Révéler la réponse
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/5"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Difficile
                </Button>
                <Button 
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-success hover:bg-success/90"
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