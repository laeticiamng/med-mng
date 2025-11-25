import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Trophy, Target, Calendar, History, TrendingUp, Users, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  useChallenges,
  useChallengeStats,
  useJoinChallenge,
  type ChallengeWithParticipants,
} from '@/hooks/useChallenges';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { addDays } from 'date-fns';

export default function ChallengesDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: challenges, isLoading: challengesLoading } = useChallenges();
  const { data: stats, isLoading: statsLoading } = useChallengeStats();
  const joinChallenge = useJoinChallenge();
  const [joiningChallengeId, setJoiningChallengeId] = useState<string | null>(null);

  const handleJoinChallenge = async (challenge: ChallengeWithParticipants, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour participer aux challenges.',
        variant: 'destructive',
      });
      return;
    }

    if (challenge.isJoined) {
      toast({
        title: 'Déjà inscrit',
        description: 'Vous participez déjà à ce challenge.',
      });
      return;
    }

    setJoiningChallengeId(challenge.id);

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
      setJoiningChallengeId(null);
    }
  };

  const challengeCategories = [
    {
      title: 'Challenges Quotidiens',
      description: 'Nouveaux challenges chaque jour',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      route: ROUTE_PATHS.challengesDaily,
      badge: "Aujourd'hui",
    },
    {
      title: 'Mon Historique',
      description: 'Voir mes challenges complétés',
      icon: History,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      route: ROUTE_PATHS.challengesHistory,
      badge: `${stats?.completedChallenges || 0} complétés`,
    },
  ];

  const isLoading = challengesLoading || statsLoading;

  return (
    <>
      <Helmet>
        <title>Challenges | Med-Mng</title>
        <meta
          name="description"
          content="Relevez les challenges et progressez dans votre apprentissage"
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8" role="banner">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" aria-hidden="true" />
            <h1 className="text-3xl font-bold" id="challenges-title">
              Challenges
            </h1>
          </div>
          <p className="text-muted-foreground" id="challenges-description">
            Relevez les défis quotidiens et gagnez des récompenses
          </p>
        </header>

        {/* Quick Access */}
        <nav
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          role="navigation"
          aria-labelledby="quick-access-heading"
        >
          <h2 id="quick-access-heading" className="sr-only">
            Accès rapide aux catégories de challenges
          </h2>
          {challengeCategories.map((category) => (
            <Card
              key={category.route}
              className="hover:shadow-lg transition-shadow"
              role="article"
              aria-labelledby={`category-${category.route}`}
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-3`}
                  aria-hidden="true"
                >
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle id={`category-${category.route}`}>{category.title}</CardTitle>
                  <Badge aria-label={`Badge: ${category.badge}`}>{category.badge}</Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={category.route}>
                  <Button
                    className="w-full"
                    aria-label={`Accéder aux ${category.title.toLowerCase()}`}
                  >
                    Voir les challenges
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </nav>

        {/* Stats Overview */}
        <section
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          role="region"
          aria-labelledby="stats-heading"
        >
          <h2 id="stats-heading" className="sr-only">
            Statistiques de vos challenges
          </h2>
          <Card role="article" aria-labelledby="stat-active">
            <CardHeader className="pb-3">
              <CardDescription id="stat-active">Challenges Actifs</CardDescription>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <CardTitle
                  className="text-2xl"
                  aria-label={`${stats?.activeChallenges || 0} challenges actifs`}
                >
                  {stats?.activeChallenges || 0}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
          <Card role="article" aria-labelledby="stat-completed">
            <CardHeader className="pb-3">
              <CardDescription id="stat-completed">Complétés</CardDescription>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <CardTitle
                  className="text-2xl text-green-600"
                  aria-label={`${stats?.completedChallenges || 0} challenges complétés`}
                >
                  {stats?.completedChallenges || 0}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
          <Card role="article" aria-labelledby="stat-success-rate">
            <CardHeader className="pb-3">
              <CardDescription id="stat-success-rate">Taux de Réussite</CardDescription>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <CardTitle
                  className="text-2xl flex items-center gap-2"
                  aria-label={`Taux de réussite de ${stats?.successRate || 0}%`}
                >
                  <TrendingUp className="w-5 h-5 text-blue-500" aria-hidden="true" />
                  {stats?.successRate || 0}%
                </CardTitle>
              )}
            </CardHeader>
          </Card>
          <Card role="article" aria-labelledby="stat-points">
            <CardHeader className="pb-3">
              <CardDescription id="stat-points">Points Gagnés</CardDescription>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <CardTitle
                  className="text-2xl flex items-center gap-2"
                  aria-label={`${stats?.totalPointsEarned?.toLocaleString() || 0} points gagnés`}
                >
                  <Star className="w-5 h-5 text-yellow-500" aria-hidden="true" />
                  {stats?.totalPointsEarned?.toLocaleString() || 0}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
        </section>

        {/* All Challenges */}
        <Card role="region" aria-labelledby="all-challenges-title">
          <CardHeader>
            <CardTitle id="all-challenges-title">Tous les Challenges</CardTitle>
            <CardDescription id="all-challenges-description">
              Explorez et participez aux challenges disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {challengesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-6 w-20 mb-2" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-2 w-full mb-4" />
                      <Skeleton className="h-8 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : challenges && challenges.length > 0 ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                role="list"
                aria-label="Liste des challenges disponibles"
              >
                {challenges.map((challenge) => {
                  const progressValue = Math.round(
                    ((challenge.userProgress || 0) / (challenge.target_value || 100)) * 100
                  );
                  const isJoining = joiningChallengeId === challenge.id;

                  return (
                    <Link
                      key={challenge.id}
                      to={`${ROUTE_PATHS.challenges}/${challenge.id}`}
                      aria-label={`Accéder au challenge: ${challenge.title}`}
                    >
                      <Card
                        className="hover:shadow-md transition-shadow h-full"
                        role="listitem"
                        aria-labelledby={`challenge-title-${challenge.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-2">
                            <Badge
                              variant={challenge.difficulty === 'hard' ? 'destructive' : 'default'}
                              aria-label={`Difficulté: ${challenge.difficulty || 'medium'}`}
                            >
                              {challenge.difficulty || 'medium'}
                            </Badge>
                            <div
                              className="flex items-center gap-1 text-sm text-muted-foreground"
                              aria-label={`${challenge.participantsCount} participants`}
                            >
                              <Users className="w-4 h-4" aria-hidden="true" />
                              {challenge.participantsCount}
                            </div>
                          </div>
                          <CardTitle
                            className="text-lg line-clamp-2"
                            id={`challenge-title-${challenge.id}`}
                          >
                            {challenge.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {challenge.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progression</span>
                              <span
                                className="font-semibold"
                                aria-label={`${progressValue}% complété`}
                              >
                                {challenge.isJoined ? `${progressValue}%` : '-'}
                              </span>
                            </div>
                            <Progress
                              value={challenge.isJoined ? progressValue : 0}
                              aria-label={`Progression du challenge: ${progressValue}%`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={progressValue}
                            />
                            <div className="flex items-center justify-between text-sm pt-2">
                              <div
                                className="flex items-center gap-1 text-yellow-600"
                                aria-label={`Récompense: ${challenge.points || 100} points`}
                              >
                                <Star className="w-4 h-4" aria-hidden="true" />
                                <span className="font-semibold">{challenge.points || 100} pts</span>
                              </div>
                              <Button
                                size="sm"
                                variant={challenge.isJoined ? 'secondary' : 'outline'}
                                onClick={(e) => handleJoinChallenge(challenge, e)}
                                disabled={isJoining || challenge.isJoined}
                                aria-label={
                                  challenge.isJoined
                                    ? `Déjà inscrit au challenge ${challenge.title}`
                                    : `Participer au challenge ${challenge.title}`
                                }
                              >
                                {isJoining ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ...
                                  </>
                                ) : challenge.isJoined ? (
                                  'Inscrit'
                                ) : (
                                  'Participer'
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Aucun challenge disponible pour le moment.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Revenez bientôt pour découvrir de nouveaux défis !
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
