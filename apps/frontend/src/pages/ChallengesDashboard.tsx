import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Trophy, Target, Calendar, History, TrendingUp, Users, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ChallengesDashboard() {
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['challenges-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    }
  });

  const challengeCategories = [
    {
      title: 'Challenges Quotidiens',
      description: 'Nouveaux challenges chaque jour',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      route: ROUTE_PATHS.challengesDaily,
      badge: 'Aujourd\'hui'
    },
    {
      title: 'Mon Historique',
      description: 'Voir mes challenges complétés',
      icon: History,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      route: ROUTE_PATHS.challengesHistory,
      badge: '24 complétés'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Challenges | Med-Mng</title>
        <meta name="description" content="Relevez les challenges et progressez dans votre apprentissage" />
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
                  <CardTitle id={`category-${category.route}`}>
                    {category.title}
                  </CardTitle>
                  <Badge aria-label={`Badge: ${category.badge}`}>
                    {category.badge}
                  </Badge>
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
              <CardTitle className="text-2xl" aria-label="8 challenges actifs">
                8
              </CardTitle>
            </CardHeader>
          </Card>
          <Card role="article" aria-labelledby="stat-completed">
            <CardHeader className="pb-3">
              <CardDescription id="stat-completed">Complétés</CardDescription>
              <CardTitle className="text-2xl text-green-600" aria-label="24 challenges complétés">
                24
              </CardTitle>
            </CardHeader>
          </Card>
          <Card role="article" aria-labelledby="stat-success-rate">
            <CardHeader className="pb-3">
              <CardDescription id="stat-success-rate">Taux de Réussite</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2" aria-label="Taux de réussite de 75%">
                <TrendingUp className="w-5 h-5 text-blue-500" aria-hidden="true" />
                75%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card role="article" aria-labelledby="stat-points">
            <CardHeader className="pb-3">
              <CardDescription id="stat-points">Points Gagnés</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2" aria-label="1240 points gagnés">
                <Star className="w-5 h-5 text-yellow-500" aria-hidden="true" />
                1,240
              </CardTitle>
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
            {isLoading ? (
              <div
                className="flex justify-center py-8"
                role="status"
                aria-live="polite"
                aria-label="Chargement des challenges"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-hidden="true"></div>
                <span className="sr-only">Chargement des challenges en cours...</span>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                role="list"
                aria-label="Liste des challenges disponibles"
              >
                {challenges?.map((challenge) => {
                  const progressValue = Math.floor(Math.random() * 100);
                  const participantsCount = Math.floor(Math.random() * 100);

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
                              aria-label={`${participantsCount} participants`}
                            >
                              <Users className="w-4 h-4" aria-hidden="true" />
                              {participantsCount}
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
                              <span className="font-semibold" aria-label={`${progressValue}% complété`}>
                                {progressValue}%
                              </span>
                            </div>
                            <Progress
                              value={progressValue}
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
                                variant="outline"
                                aria-label={`Participer au challenge ${challenge.title}`}
                              >
                                Participer
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
