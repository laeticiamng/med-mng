import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Music, Brain, Play, CheckCircle, Clock, Flame, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface RevisionGuideProps {
  onStartRevision?: () => void;
}

export const RevisionGuide: React.FC<RevisionGuideProps> = ({ onStartRevision }) => {
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
  const hasTrackedRef = useRef(false);

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
        metadata: { component: 'revision_guide', action: 'view' }
      });
    }
  }, []);

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
              <span className="text-sm font-bold text-warning">{stats.currentStreak}j</span>
              <Star className="h-4 w-4 text-primary ml-1" />
              <span className="text-sm font-bold text-primary">Nv.{stats.level}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground">
          Méthode recommandée pour réviser efficacement chaque item
        </p>
      </div>

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
              const Icon = step.icon;
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
