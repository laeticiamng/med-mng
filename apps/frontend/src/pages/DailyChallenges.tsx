import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Calendar, ArrowLeft, CheckCircle2, Star, Clock, Loader2, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  useDailyChallenges,
  useCompleteDailyChallenge,
  useUpdateDailyChallengeProgress,
} from '@/hooks/useChallenges';
import { useAuth } from '@/components/med-mng/AuthProvider';

interface DailyChallengeWithProgress {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  type: string;
  points: number;
  target_value: number;
  date: string;
  is_active: boolean;
  created_at: string;
  userProgress: {
    id: string;
    progress: Record<string, any>;
    completed: boolean | null;
    completed_at: string | null;
    streak_days: number | null;
  } | null;
}

export default function DailyChallenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: dailyChallenges, isLoading } = useDailyChallenges();
  const completeChallenge = useCompleteDailyChallenge();
  const updateProgress = useUpdateDailyChallengeProgress();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Update time remaining every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleStartChallenge = async (challenge: DailyChallengeWithProgress) => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour participer aux challenges.',
        variant: 'destructive',
      });
      return;
    }

    setCompletingId(challenge.id);

    try {
      // Initialize progress if not started
      if (!challenge.userProgress) {
        await updateProgress.mutateAsync({
          challengeId: challenge.id,
          progress: { started: true, startedAt: new Date().toISOString(), value: 0 },
        });

        toast({
          title: 'Challenge commencé !',
          description: `Vous avez commencé "${challenge.title}".`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de démarrer le challenge.',
        variant: 'destructive',
      });
    } finally {
      setCompletingId(null);
    }
  };

  const handleCompleteChallenge = async (challenge: DailyChallengeWithProgress) => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour compléter les challenges.',
        variant: 'destructive',
      });
      return;
    }

    setCompletingId(challenge.id);

    try {
      await completeChallenge.mutateAsync(challenge.id);

      toast({
        title: 'Challenge complété ! 🎉',
        description: `Vous avez gagné ${challenge.points} points !`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de compléter le challenge.',
        variant: 'destructive',
      });
    } finally {
      setCompletingId(null);
    }
  };

  // Calculate stats from real data
  const stats = {
    totalChallenges: dailyChallenges?.length || 0,
    completedToday: dailyChallenges?.filter(
      (c: DailyChallengeWithProgress) => c.userProgress?.completed
    ).length || 0,
    pointsEarned: dailyChallenges
      ?.filter((c: DailyChallengeWithProgress) => c.userProgress?.completed)
      .reduce((sum: number, c: DailyChallengeWithProgress) => sum + (c.points || 0), 0) || 0,
  };

  const getProgressValue = (challenge: DailyChallengeWithProgress): number => {
    if (!challenge.userProgress) return 0;
    if (challenge.userProgress.completed) return 100;

    const progress = challenge.userProgress.progress;
    if (typeof progress?.value === 'number') {
      return Math.round((progress.value / (challenge.target_value || 100)) * 100);
    }

    return progress?.started ? 10 : 0;
  };

  const getChallengeStatus = (challenge: DailyChallengeWithProgress): 'completed' | 'in_progress' | 'not_started' => {
    if (challenge.userProgress?.completed) return 'completed';
    if (challenge.userProgress?.progress?.started) return 'in_progress';
    return 'not_started';
  };

  return (
    <>
      <Helmet>
        <title>Challenges Quotidiens | Med-Mng</title>
        <meta
          name="description"
          content="Relevez les challenges quotidiens et gagnez des points"
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={ROUTE_PATHS.challenges}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux challenges
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Challenges Quotidiens</h1>
          </div>
          <p className="text-muted-foreground">
            Nouveaux challenges chaque jour - Complétez-les avant minuit!
          </p>
        </div>

        {/* Timer Alert */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-900 dark:text-blue-100">
                    Temps restant: {timeRemaining}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Les challenges se renouvellent à minuit
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Challenges du Jour</CardDescription>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <CardTitle className="text-2xl">{stats.totalChallenges}</CardTitle>
              )}
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Complétés Aujourd'hui</CardDescription>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {stats.completedToday}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Points Gagnés</CardDescription>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <CardTitle className="text-2xl text-yellow-600 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {stats.pointsEarned}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Daily Challenges List */}
        <Card>
          <CardHeader>
            <CardTitle>Challenges d'Aujourd'hui</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-full mb-3" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : dailyChallenges && dailyChallenges.length > 0 ? (
              <div className="space-y-4">
                {dailyChallenges.map((challenge: DailyChallengeWithProgress, index: number) => {
                  const status = getChallengeStatus(challenge);
                  const progressValue = getProgressValue(challenge);
                  const isLoading = completingId === challenge.id;

                  return (
                    <Card
                      key={challenge.id}
                      className={`transition-shadow ${status === 'completed' ? 'bg-green-50/50 dark:bg-green-950/20' : 'hover:shadow-md'}`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {status === 'completed' ? (
                              <CheckCircle2 className="w-8 h-8 text-green-500" />
                            ) : status === 'in_progress' ? (
                              <div className="w-8 h-8 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center">
                                <Play className="w-4 h-4 text-blue-600" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-muted-foreground font-semibold">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3
                                className={`font-semibold ${status === 'completed' ? 'text-green-700 dark:text-green-400' : ''}`}
                              >
                                {challenge.title || `Challenge ${index + 1}`}
                              </h3>
                              <Badge
                                variant={
                                  challenge.difficulty === 'hard'
                                    ? 'destructive'
                                    : challenge.difficulty === 'easy'
                                      ? 'secondary'
                                      : 'default'
                                }
                              >
                                {challenge.difficulty || 'medium'}
                              </Badge>
                              <Badge variant="outline">
                                <Star className="w-3 h-3 mr-1" />
                                {challenge.points || 100} pts
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {challenge.description ||
                                'Complétez ce challenge pour gagner des points'}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progression</span>
                                <span className="font-semibold">{progressValue}%</span>
                              </div>
                              <Progress
                                value={progressValue}
                                className={status === 'completed' ? '[&>div]:bg-green-500' : ''}
                              />
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {status === 'completed' ? (
                              <Button size="sm" variant="secondary" disabled>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Complété
                              </Button>
                            ) : status === 'in_progress' ? (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteChallenge(challenge)}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ...
                                  </>
                                ) : (
                                  'Terminer'
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartChallenge(challenge)}
                                disabled={isLoading || !user}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ...
                                  </>
                                ) : (
                                  'Commencer'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun challenge quotidien pour aujourd'hui</p>
                <p className="text-sm mt-2">Revenez demain pour de nouveaux challenges!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login prompt */}
        {!user && dailyChallenges && dailyChallenges.length > 0 && (
          <Card className="mt-6 bg-muted/50">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-3">
                Connectez-vous pour participer aux challenges quotidiens et gagner des points !
              </p>
              <Link to="/auth">
                <Button>Se connecter</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
