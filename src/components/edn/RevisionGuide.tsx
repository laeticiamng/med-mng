import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, BookOpen, Brain, CheckCircle, Clock, Flame, Music, Play, Star, Target } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface RevisionGuideProps {
  onStartRevision?: () => void;
  onOpenItem?: (itemCode: string) => void;
}

interface WeakItem {
  item_code: string;
  avg_score: number;
  attempts: number;
  recent_score?: number;
  last_attempt?: string;
  priority?: number;
}

export const RevisionGuide: React.FC<RevisionGuideProps> = ({ onStartRevision, onOpenItem }) => {
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
  const hasTrackedRef = useRef(false);
  const [weakItems, setWeakItems] = useState<WeakItem[]>([]);
  const [totalQuizzes, setTotalQuizzes] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
        
        // Fetch weak items (lowest scores) with intelligent analysis
        const { data: quizData } = await supabase
          .from('quiz_results')
          .select('item_code, score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (quizData && quizData.length > 0) {
          setTotalQuizzes(quizData.length);
          
          // Group by item and calculate weighted averages (recent scores weighted higher)
          const itemScores: Record<string, { total: number; count: number; recentScore?: number; lastAttempt?: string }> = {};
          quizData.forEach((q, idx) => {
            if (!itemScores[q.item_code]) {
              itemScores[q.item_code] = { total: 0, count: 0 };
            }
            // Weight recent scores higher
            const weight = Math.max(0.5, 1 - (idx * 0.02));
            itemScores[q.item_code].total += q.score * weight;
            itemScores[q.item_code].count += weight;
            
            // Track most recent score
            if (!itemScores[q.item_code].recentScore) {
              itemScores[q.item_code].recentScore = q.score;
              itemScores[q.item_code].lastAttempt = q.created_at;
            }
          });
          
          // Find items with avg < 70% OR recent score < 60% (smart prioritization)
          const weak = Object.entries(itemScores)
            .map(([item_code, data]) => ({
              item_code,
              avg_score: Math.round(data.total / data.count),
              attempts: Math.round(data.count),
              recent_score: data.recentScore,
              last_attempt: data.lastAttempt,
              // Priority score: lower avg + declining trend = higher priority
              priority: (100 - (data.total / data.count)) + 
                (data.recentScore && data.recentScore < (data.total / data.count) ? 10 : 0)
            }))
            .filter(item => item.avg_score < 70 || (item.recent_score && item.recent_score < 60))
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 5);
          
          setWeakItems(weak);
        }
      }
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'revision_guide', action: 'view' }
      });
    }
  }, [logActivity]);

  const handleStartRevision = async () => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'revision_guide', action: 'start_revision' }
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await addPoints(user.id, 'itemReviewed');
    }
    
    onStartRevision?.();
  };

  const revisionSteps = [
    {
      id: 1,
      icon: BookOpen,
      title: '📖 Lire le contenu',
      description: 'Commencez par lire le Rang A et le Rang B',
      duration: '15-30 min',
      color: 'text-primary'
    },
    {
      id: 2,
      icon: Music,
      title: '🎵 Écouter la musique',
      description: 'Mémorisez avec les musiques mnémotechniques',
      duration: '5-10 min',
      color: 'text-accent'
    },
    {
      id: 3,
      icon: Play,
      title: '🎬 Voir la scène 3D',
      description: 'Visualisez le contenu en immersif (si disponible)',
      duration: '10-15 min',
      color: 'text-success'
    },
    {
      id: 4,
      icon: Brain,
      title: '✅ Tester vos connaissances',
      description: 'Faites le quiz pour valider votre apprentissage',
      duration: '10-15 min',
      color: 'text-warning'
    }
  ];

  const revisionModes = [
    {
      title: 'Révision Express',
      duration: '30 min',
      description: 'Idéal pour une révision rapide avant l\'examen',
      steps: ['Lire le résumé', 'Quiz rapide'],
      badge: 'Rapide'
    },
    {
      title: 'Révision Complète',
      duration: '1-2h',
      description: 'Pour une maîtrise approfondie du sujet',
      steps: ['Contenu complet', 'Musique', 'Scène 3D', 'Quiz complet'],
      badge: 'Recommandé'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Titre avec stats gamification */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">🎓 Guide de Révision EDN</h2>
          {stats && (
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
              <Flame className="h-4 w-4 text-warning" />
              <span className="text-sm font-bold text-warning">{stats.currentStreak ?? 0}j</span>
              <Star className="h-4 w-4 text-primary ml-1" />
              <span className="text-sm font-bold text-primary">Nv.{stats.level ?? 1}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground">
          Méthode recommandée pour réviser efficacement chaque item
        </p>
      </div>

      {/* Personalized Weak Items Alert with smart analysis */}
      {weakItems.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              Items à réviser en priorité ({weakItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakItems.map((item) => (
              <div 
                key={item.item_code} 
                className={`flex items-center justify-between p-2 bg-background rounded-lg ${onOpenItem ? 'cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary' : ''}`}
                onClick={() => onOpenItem?.(item.item_code)}
                role={onOpenItem ? 'button' : undefined}
                tabIndex={onOpenItem ? 0 : undefined}
                aria-label={onOpenItem ? `Ouvrir ${item.item_code} - Score moyen: ${item.avg_score}%` : undefined}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenItem?.(item.item_code)}
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-warning" />
                  <span className="font-medium">{item.item_code}</span>
                  {item.recent_score && item.recent_score < item.avg_score && (
                    <Badge variant="destructive" className="text-xs">
                      ↓ En baisse
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={item.avg_score} className="w-20 h-2" />
                  <Badge variant="outline" className="text-xs">
                    {item.avg_score}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({item.attempts}x)
                  </span>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">
              Basé sur vos {totalQuizzes} quiz effectués (pondération récence)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modes de révision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {revisionModes.map((mode, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{mode.title}</CardTitle>
                <Badge variant={mode.badge === 'Recommandé' ? 'default' : 'secondary'}>
                  {mode.badge}
                </Badge>
              </div>
              <CardDescription>{mode.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{mode.duration}</span>
              </div>
              <ul className="space-y-1 text-sm">
                {mode.steps.map((step, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    {step}
                  </li>
                ))}
              </ul>
              {onStartRevision && (
                <Button 
                  onClick={handleStartRevision}
                  variant={mode.badge === 'Recommandé' ? 'default' : 'outline'}
                  className="w-full mt-2"
                >
                  Commencer
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Étapes détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Parcours de Révision Détaillé</CardTitle>
          <CardDescription>
            Suivez ces étapes dans l'ordre pour une révision optimale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revisionSteps.map((step) => {
              return (
                <div 
                  key={step.id} 
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                    <span className="font-bold text-primary">{step.id}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${step.color}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{step.duration}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Conseils */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 border-primary/20 dark:border-primary/30">
        <CardHeader>
          <CardTitle className="text-primary dark:text-primary">💡 Conseils pour réviser efficacement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-primary/80 dark:text-primary/90">
          <div>✅ Commencez par les items que vous maîtrisez le moins</div>
          <div>✅ Révisez régulièrement (répétition espacée)</div>
          <div>✅ Utilisez la musique pour mémoriser les concepts difficiles</div>
          <div>✅ Faites les quiz plusieurs fois pour valider votre maîtrise</div>
          <div>✅ Prenez des pauses toutes les 45-60 minutes</div>
        </CardContent>
      </Card>
    </div>
  );
};
