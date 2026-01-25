import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Clock, Flame, Gift, Star, Target, Trophy, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target: number;
  current: number;
  xpReward: number;
  multiplier: number;
  endsAt: Date;
  category: 'review' | 'exam' | 'streak' | 'clinical' | 'social';
  isCompleted: boolean;
}

export function WeeklyChallenges() {
  const { _stats, _addPoints } = useGamification();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReward, setShowReward] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, [_stats]);

  const loadChallenges = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get current week boundaries
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Fetch activity counts for this week - optimized query
    const { data: activities } = await (supabase as any)
      .from('user_activity_log')
      .select('activity_type, count')
      .eq('user_id', user.id)
      .gte('activity_date', weekStart.toISOString().split('T')[0])
      .lte('activity_date', weekEnd.toISOString().split('T')[0]);

    // Also check gamification_activities for more accurate counts
    const { data: gamificationActivities } = await (supabase as any)
      .from('gamification_activities')
      .select('activity_type')
      .eq('user_id', user.id)
      .gte('created_at', weekStart.toISOString());

    const counts: Record<string, number> = {};
    (activities || []).forEach((a: any) => {
      counts[a.activity_type] = (counts[a.activity_type] || 0) + (a.count || 1);
    });
    (gamificationActivities || []).forEach((a: any) => {
      const type = a.activity_type?.replace('weekly_challenge_', '');
      if (type && !type.startsWith('weekly')) {
        counts[type] = (counts[type] || 0) + 1;
      }
    });

    const streak = _stats?.currentStreak || 0;

    // Define weekly challenges
    const weekChallenges: WeeklyChallenge[] = [
      {
        id: 'weekly_mastery',
        title: 'Maître de la semaine',
        description: 'Réviser 50 items cette semaine',
        icon: <Brain className="h-5 w-5 text-primary" />,
        target: 50,
        current: counts['review'] || counts['srs_review'] || 0,
        xpReward: 500,
        multiplier: 2,
        endsAt: weekEnd,
        category: 'review',
        isCompleted: (counts['review'] || counts['srs_review'] || 0) >= 50
      },
      {
        id: 'weekly_streak',
        title: 'Flamme éternelle',
        description: 'Maintenir votre streak pendant 7 jours',
        icon: <Flame className="h-5 w-5 text-warning" />,
        target: 7,
        current: Math.min(streak, 7),
        xpReward: 300,
        multiplier: 1.5,
        endsAt: weekEnd,
        category: 'streak',
        isCompleted: streak >= 7
      },
      {
        id: 'weekly_exams',
        title: 'Champion des examens',
        description: 'Compléter 5 examens cette semaine',
        icon: <Trophy className="h-5 w-5 text-accent" />,
        target: 5,
        current: counts['exam'] || 0,
        xpReward: 400,
        multiplier: 1.75,
        endsAt: weekEnd,
        category: 'exam',
        isCompleted: (counts['exam'] || 0) >= 5
      },
      {
        id: 'weekly_clinical',
        title: 'Clinicien aguerri',
        description: 'Résoudre 3 cas cliniques',
        icon: <Target className="h-5 w-5 text-success" />,
        target: 3,
        current: counts['clinical'] || 0,
        xpReward: 350,
        multiplier: 1.5,
        endsAt: weekEnd,
        category: 'clinical',
        isCompleted: (counts['clinical'] || 0) >= 3
      },
      {
        id: 'weekly_ai',
        title: 'Explorateur IA',
        description: 'Poser 20 questions à l\'IA',
        icon: <Zap className="h-5 w-5 text-purple-500" />,
        target: 20,
        current: counts['ai_question'] || 0,
        xpReward: 250,
        multiplier: 1.25,
        endsAt: weekEnd,
        category: 'review',
        isCompleted: (counts['ai_question'] || 0) >= 20
      }
    ];

    setChallenges(weekChallenges);
    setLoading(false);
  };

  const claimReward = async (challenge: WeeklyChallenge) => {
    if (!challenge.isCompleted) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if already claimed
    const { data: existing } = await (supabase as any)
      .from('gamification_activities')
      .select('id')
      .eq('user_id', user.id)
      .eq('activity_type', `weekly_challenge_${challenge.id}`)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .maybeSingle();

    if (existing) {
      return; // Already claimed this week
    }

    // Award points
    await _addPoints(user.id, 'examCompleted', Math.round(challenge.xpReward / 100));
    
    // Log the claim
    await (supabase as any).from('gamification_activities').insert({
      user_id: user.id,
      activity_type: `weekly_challenge_${challenge.id}`,
      activity_name: challenge.title,
      points_earned: challenge.xpReward,
    });

    // Show reward animation
    setShowReward(challenge.id);
    setTimeout(() => setShowReward(null), 2000);
  };

  const getTimeRemaining = (endsAt: Date): string => {
    const diff = endsAt.getTime() - Date.now();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    
    if (days > 0) return `${days}j ${hours}h restants`;
    return `${hours}h restantes`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = challenges.filter(c => c.isCompleted).length;

  return (
    <Card className="relative overflow-hidden">
      {/* Reward overlay */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Gift className="h-16 w-16 text-warning mx-auto mb-4" />
              </motion.div>
              <p className="text-2xl font-bold text-warning">Récompense obtenue !</p>
              <p className="text-lg">+{challenges.find(c => c.id === showReward)?.xpReward} XP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              Défis de la Semaine
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              {getTimeRemaining(challenges[0]?.endsAt || new Date())}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {completedCount}/{challenges.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Global progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression globale</span>
            <span className="text-muted-foreground">
              {Math.round((completedCount / challenges.length) * 100)}%
            </span>
          </div>
          <Progress value={(completedCount / challenges.length) * 100} className="h-2" />
        </div>

        {/* Challenges list */}
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border transition-all ${
                challenge.isCompleted 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-muted/30 border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${challenge.isCompleted ? 'bg-success/20' : 'bg-muted'}`}>
                  {challenge.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium truncate">{challenge.title}</h4>
                    <Badge variant={challenge.isCompleted ? 'default' : 'outline'} className="ml-2 shrink-0">
                      {challenge.isCompleted ? '✓ Terminé' : `${challenge.current}/${challenge.target}`}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Progress 
                      value={Math.min(100, (challenge.current / challenge.target) * 100)} 
                      className="h-1.5 flex-1 mr-4"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1 text-warning" />
                        {challenge.xpReward} XP
                      </Badge>
                      {challenge.multiplier > 1 && (
                        <Badge variant="outline" className="text-xs text-warning border-warning/30">
                          x{challenge.multiplier}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {challenge.isCompleted && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="shrink-0"
                    onClick={() => claimReward(challenge)}
                  >
                    <Gift className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bonus info */}
        <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg text-center">
          <p className="text-sm text-warning font-medium">
            🎯 Complétez tous les défis pour un bonus de 1000 XP !
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklyChallenges;
