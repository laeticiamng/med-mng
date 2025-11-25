import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import {
  Trophy,
  ArrowLeft,
  Star,
  Users,
  CheckCircle2,
  Target,
  Loader2,
  Clock,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useChallengeDetail,
  useJoinChallenge,
  useUpdateChallengeProgress,
  useLeaveChallenge,
} from '@/hooks/useChallenges';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { format, formatDistanceToNow, isPast, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ChallengeDetail() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const { data: challenge, isLoading, error } = useChallengeDetail(challengeId || '');
  const joinChallenge = useJoinChallenge();
  const updateProgress = useUpdateChallengeProgress();
  const leaveChallenge = useLeaveChallenge();

  const handleJoinChallenge = async () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour participer aux challenges.',
        variant: 'destructive',
      });
      return;
    }

    if (!challenge) return;

    setIsJoining(true);

    try {
      await joinChallenge.mutateAsync({
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        category: challenge.category,
        type: challenge.type,
        points: challenge.points,
        target_value: challenge.target_value,
        expires_at: challenge.expires_at || addDays(new Date(), 7).toISOString(),
      });

      toast({
        title: 'Inscription réussie !',
        description: `Vous participez maintenant au challenge "${challenge.title}".`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de rejoindre le challenge.',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveChallenge = async () => {
    if (!challenge || !challenge.isUserChallenge) return;

    setIsLeaving(true);

    try {
      await leaveChallenge.mutateAsync(challenge.id);

      toast({
        title: 'Challenge abandonné',
        description: 'Vous avez quitté ce challenge.',
      });

      navigate(ROUTE_PATHS.challenges);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de quitter le challenge.',
        variant: 'destructive',
      });
    } finally {
      setIsLeaving(false);
      setShowLeaveDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card role="alert" aria-live="polite">
          <CardContent className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
            <p className="text-muted-foreground">Challenge introuvable</p>
            <Link to={ROUTE_PATHS.challenges}>
              <Button
                variant="outline"
                className="mt-4"
                aria-label="Retourner à la liste des challenges"
              >
                Retour aux challenges
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = challenge.isJoined
    ? Math.round(((challenge.userProgress || 0) / (challenge.target_value || 100)) * 100)
    : 0;
  const isExpired = challenge.expires_at ? isPast(new Date(challenge.expires_at)) : false;
  const isCompleted = challenge.completed || progress >= 100;

  // Calculate success rate from leaderboard
  const completedCount = (challenge.leaderboard || []).filter(
    (p: any) => p.completed || (p.progress || 0) >= (challenge.target_value || 100)
  ).length;
  const successRate =
    challenge.participantsCount > 0
      ? Math.round((completedCount / challenge.participantsCount) * 100)
      : 0;

  // Generate objectives based on target_value
  const generateObjectives = () => {
    const targetValue = challenge.target_value || 100;
    const currentProgress = challenge.userProgress || 0;
    const steps = [25, 50, 75, 100];

    return steps.map((step) => ({
      text: `Atteindre ${Math.round((targetValue * step) / 100)} / ${targetValue}`,
      done: currentProgress >= (targetValue * step) / 100,
      percentage: step,
    }));
  };

  const objectives = generateObjectives();

  return (
    <>
      <Helmet>
        <title>{challenge.title} | Challenges | Med-Mng</title>
        <meta name="description" content={challenge.description} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <nav className="mb-6" aria-label="Navigation du challenge">
          <Link to={ROUTE_PATHS.challenges}>
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              aria-label="Retourner à la liste des challenges"
            >
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Retour aux challenges
            </Button>
          </Link>
        </nav>

        {/* Challenge Header */}
        <Card className="mb-6" role="region" aria-labelledby="challenge-header">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={challenge.difficulty === 'hard' ? 'destructive' : 'default'}
                  aria-label={`Difficulté: ${challenge.difficulty || 'medium'}`}
                >
                  {challenge.difficulty || 'medium'}
                </Badge>
                <Badge
                  variant="outline"
                  aria-label={`Catégorie: ${challenge.category || 'General'}`}
                >
                  {challenge.category || 'General'}
                </Badge>
                {isExpired && (
                  <Badge variant="secondary" aria-label="Challenge expiré">
                    Expiré
                  </Badge>
                )}
                {isCompleted && challenge.isJoined && (
                  <Badge
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    aria-label="Challenge complété"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complété
                  </Badge>
                )}
              </div>
              <div
                className="flex items-center gap-2 text-yellow-600"
                aria-label={`Récompense: ${challenge.points || 100} points`}
              >
                <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                <span className="font-bold">{challenge.points || 100} points</span>
              </div>
            </div>
            <CardTitle className="text-3xl" id="challenge-header">
              {challenge.title}
            </CardTitle>
            <CardDescription className="text-base mt-2">{challenge.description}</CardDescription>

            {challenge.expires_at && (
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {isExpired ? (
                  <span>
                    Expiré le {format(new Date(challenge.expires_at), 'dd MMM yyyy', { locale: fr })}
                  </span>
                ) : (
                  <span>
                    Expire{' '}
                    {formatDistanceToNow(new Date(challenge.expires_at), {
                      locale: fr,
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"
              role="list"
              aria-label="Statistiques du challenge"
            >
              <div className="flex items-center gap-2" role="listitem">
                <Users className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                  <div
                    className="font-semibold"
                    aria-label={`${challenge.participantsCount} participants`}
                  >
                    {challenge.participantsCount}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2" role="listitem">
                <TrendingUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <div className="text-sm text-muted-foreground">Taux de Réussite</div>
                  <div
                    className="font-semibold"
                    aria-label={`${successRate}% de taux de réussite`}
                  >
                    {successRate}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2" role="listitem">
                <Target className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <div className="text-sm text-muted-foreground">Objectif</div>
                  <div className="font-semibold" aria-label={`Objectif: ${challenge.target_value}`}>
                    {challenge.target_value}
                  </div>
                </div>
              </div>
            </div>

            {challenge.isJoined && (
              <div className="space-y-2 mb-6" role="region" aria-labelledby="progress-section">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground" id="progress-section">
                    Votre progression
                  </span>
                  <span className="font-semibold" aria-label={`${progress}% complété`}>
                    {challenge.userProgress || 0} / {challenge.target_value} ({progress}%)
                  </span>
                </div>
                <Progress
                  value={progress}
                  className="h-3"
                  aria-labelledby="progress-section"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                />
              </div>
            )}

            <div className="flex gap-3">
              {!challenge.isJoined && !isExpired && (
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleJoinChallenge}
                  disabled={isJoining || !user}
                  aria-label="Participer au challenge"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    'Participer au Challenge'
                  )}
                </Button>
              )}

              {challenge.isJoined && !isCompleted && !isExpired && (
                <Button
                  className="flex-1"
                  size="lg"
                  aria-label="Continuer le challenge"
                  onClick={() => {
                    toast({
                      title: 'Continuez !',
                      description: 'Progressez dans vos activités pour compléter ce challenge.',
                    });
                  }}
                >
                  Continuer le Challenge
                </Button>
              )}

              {challenge.isJoined && isCompleted && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                  disabled
                  aria-label="Challenge complété"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Challenge Complété !
                </Button>
              )}

              {challenge.isUserChallenge && !isCompleted && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowLeaveDialog(true)}
                  aria-label="Abandonner le challenge"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Abandonner
                </Button>
              )}
            </div>

            {!user && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                <Link to="/auth" className="text-primary hover:underline">
                  Connectez-vous
                </Link>{' '}
                pour participer à ce challenge.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Objectives */}
        {challenge.isJoined && (
          <Card className="mb-6" role="region" aria-labelledby="objectives-title">
            <CardHeader>
              <CardTitle id="objectives-title">Objectifs</CardTitle>
              <CardDescription id="objectives-description">
                Complétez tous les objectifs pour réussir le challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul
                className="space-y-3"
                role="list"
                aria-labelledby="objectives-title"
                aria-describedby="objectives-description"
              >
                {objectives.map((objective, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                    role="listitem"
                    aria-label={`${objective.text} - ${objective.done ? 'Complété' : 'Non complété'}`}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${objective.done ? 'text-green-500' : 'text-muted-foreground'}`}
                      aria-hidden="true"
                    />
                    <span className={objective.done ? 'line-through text-muted-foreground' : ''}>
                      {objective.text}
                    </span>
                    <Badge variant="outline" className="ml-auto">
                      {objective.percentage}%
                    </Badge>
                    {objective.done && <span className="sr-only">Complété</span>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        {challenge.leaderboard && challenge.leaderboard.length > 0 && (
          <Card className="mb-6" role="region" aria-labelledby="leaderboard-title">
            <CardHeader>
              <CardTitle id="leaderboard-title">Classement</CardTitle>
              <CardDescription>Les meilleurs participants</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {challenge.leaderboard.slice(0, 5).map((participant: any, index: number) => {
                  const partProgress = Math.round(
                    ((participant.progress || 0) / (challenge.target_value || 100)) * 100
                  );
                  const isCurrentUser = participant.user_id === user?.id;

                  return (
                    <li
                      key={participant.user_id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isCurrentUser ? 'bg-primary/5 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : index === 1
                                ? 'bg-gray-100 text-gray-700'
                                : index === 2
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className={isCurrentUser ? 'font-semibold' : ''}>
                          {isCurrentUser ? 'Vous' : `Participant ${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={partProgress} className="w-24 h-2" />
                        <span className="text-sm font-medium w-12 text-right">{partProgress}%</span>
                        {participant.completed && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Rewards */}
        <Card role="region" aria-labelledby="rewards-title">
          <CardHeader>
            <CardTitle id="rewards-title">Récompenses</CardTitle>
            <CardDescription id="rewards-description">
              Ce que vous gagnerez en complétant ce challenge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              role="list"
              aria-labelledby="rewards-title"
            >
              <div
                className="flex flex-col items-center text-center p-4 border rounded-lg"
                role="listitem"
                aria-label={`Récompense: ${challenge.points || 100} points d'expérience`}
              >
                <Star className="w-8 h-8 text-yellow-500 mb-2" aria-hidden="true" />
                <div className="font-semibold">{challenge.points || 100} Points</div>
                <div className="text-sm text-muted-foreground">XP</div>
              </div>
              <div
                className="flex flex-col items-center text-center p-4 border rounded-lg"
                role="listitem"
                aria-label="Récompense: Badge spécial de réalisation"
              >
                <Trophy className="w-8 h-8 text-orange-500 mb-2" aria-hidden="true" />
                <div className="font-semibold">Badge Spécial</div>
                <div className="text-sm text-muted-foreground">Réalisation</div>
              </div>
              <div
                className="flex flex-col items-center text-center p-4 border rounded-lg"
                role="listitem"
                aria-label="Récompense: Contribution au classement"
              >
                <TrendingUp className="w-8 h-8 text-blue-500 mb-2" aria-hidden="true" />
                <div className="font-semibold">Classement</div>
                <div className="text-sm text-muted-foreground">Top participants</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Challenge Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abandonner le challenge ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir abandonner ce challenge ? Votre progression sera perdue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveChallenge}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLeaving}
            >
              {isLeaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Abandon...
                </>
              ) : (
                'Abandonner'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
