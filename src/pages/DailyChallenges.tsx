import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDailyChallenges } from '@/hooks/useDailyChallenges';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Gift, 
  Loader2,
  Music, 
  Sparkles, 
  Target, 
  Timer, 
  Trophy,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const DailyChallenges = () => {
  const { challenges, isLoading, claimReward, isClaimingReward } = useDailyChallenges();
  const { stats, loadStats } = useGamification();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Charger le streak dynamiquement depuis gamification
  useEffect(() => {
    const loadUserStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
      }
    };
    loadUserStats();
  }, [loadStats]);

  const streak = stats?.currentStreak || 0;

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'study': return <BookOpen className="h-5 w-5" />;
      case 'quiz': return <Brain className="h-5 w-5" />;
      case 'music': return <Music className="h-5 w-5" />;
      case 'streak': return <Flame className="h-5 w-5" />;
      case 'time': return <Clock className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Badge variant="secondary" className="bg-success/20 text-success">Facile</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-warning/20 text-warning">Moyen</Badge>;
      case 'hard': return <Badge variant="secondary" className="bg-destructive/20 text-destructive">Difficile</Badge>;
      default: return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const filteredChallenges = challenges.filter(c => 
    selectedDifficulty === 'all' || c.difficulty === selectedDifficulty
  );

  const completedCount = challenges.filter(c => c.is_completed).length;
  const totalCount = challenges.length;

  return (
    <>
      <Helmet>
        <title>Défis du jour | MED-MNG</title>
        <meta name="description" content="Relevez des défis quotidiens et gagnez des XP. Maintenez votre série et débloquez des récompenses en révisant chaque jour." />
        <meta name="keywords" content="défis, challenges, gamification, XP, révisions, médecine" />
        <link rel="canonical" href="/challenges" />
      </Helmet>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Défis du jour</h1>
          </div>
          <p className="text-muted-foreground">
            Complétez des défis quotidiens pour gagner des récompenses
          </p>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Série actuelle</p>
                <p className="text-2xl font-bold">{streak} jours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Complétés</p>
                <p className="text-2xl font-bold">{completedCount}/{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                <Timer className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temps restant</p>
                <p className="text-2xl font-bold">
                  {challenges[0] ? getTimeRemaining(challenges[0].expires_at) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression quotidienne</span>
              <span>{completedCount}/{totalCount} défis</span>
            </div>
            <Progress value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0} className="h-3" />
            {completedCount === totalCount && totalCount > 0 && (
              <div className="flex items-center gap-2 text-success text-sm mt-2">
                <Trophy className="h-4 w-4" />
                <span>Tous les défis complétés ! Bonus XP x2 demain</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'easy', 'medium', 'hard'].map((diff) => (
          <Button
            key={diff}
            variant={selectedDifficulty === diff ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty(diff)}
          >
            {diff === 'all' ? 'Tous' : diff === 'easy' ? 'Facile' : diff === 'medium' ? 'Moyen' : 'Difficile'}
          </Button>
        ))}
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredChallenges.length > 0 ? (
          filteredChallenges.map((challenge) => (
            <Card 
              key={challenge.id}
              className={`transition-all ${
                challenge.is_completed 
                  ? 'bg-success/5 border-success/50' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    challenge.is_completed ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                  }`}>
                    {challenge.is_completed ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      getChallengeIcon(challenge.challenge_type)
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      {getDifficultyBadge(challenge.difficulty)}
                      {challenge.is_completed && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/50">
                          Complété
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    
                    {!challenge.is_completed && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progression</span>
                          <span>{challenge.current_value}/{challenge.target_value}</span>
                        </div>
                        <Progress 
                          value={(challenge.current_value / challenge.target_value) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-primary">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-bold">+{challenge.reward_xp} XP</span>
                    </div>
                    
                    {challenge.current_value >= challenge.target_value && !challenge.is_completed ? (
                      <Button 
                        size="sm" 
                        onClick={() => claimReward(challenge.id)}
                        className="gap-2"
                        disabled={isClaimingReward}
                      >
                        {isClaimingReward ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Gift className="h-4 w-4" />
                        )}
                        Réclamer
                      </Button>
                    ) : !challenge.is_completed ? (
                      <Button size="sm" variant="outline" className="gap-2">
                        <Target className="h-4 w-4" />
                        En cours
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucun défi disponible pour le moment.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Les nouveaux défis arrivent chaque jour à minuit !
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
};

export default DailyChallenges;
