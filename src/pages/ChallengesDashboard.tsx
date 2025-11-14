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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Challenges</h1>
          </div>
          <p className="text-muted-foreground">
            Relevez les défis quotidiens et gagnez des récompenses
          </p>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {challengeCategories.map((category) => (
            <Card key={category.route} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-3`}>
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle>{category.title}</CardTitle>
                  <Badge>{category.badge}</Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={category.route}>
                  <Button className="w-full">
                    Voir les challenges
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Challenges Actifs</CardDescription>
              <CardTitle className="text-2xl">8</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Complétés</CardDescription>
              <CardTitle className="text-2xl text-green-600">24</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Taux de Réussite</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                75%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Points Gagnés</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                1,240
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* All Challenges */}
        <Card>
          <CardHeader>
            <CardTitle>Tous les Challenges</CardTitle>
            <CardDescription>Explorez et participez aux challenges disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenges?.map((challenge) => (
                  <Link
                    key={challenge.id}
                    to={`${ROUTE_PATHS.challenges}/${challenge.id}`}
                  >
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant={challenge.difficulty === 'hard' ? 'destructive' : 'default'}>
                            {challenge.difficulty || 'medium'}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {Math.floor(Math.random() * 100)}
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{challenge.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {challenge.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-semibold">
                              {Math.floor(Math.random() * 100)}%
                            </span>
                          </div>
                          <Progress value={Math.floor(Math.random() * 100)} />
                          <div className="flex items-center justify-between text-sm pt-2">
                            <div className="flex items-center gap-1 text-yellow-600">
                              <Star className="w-4 h-4" />
                              <span className="font-semibold">{challenge.points || 100} pts</span>
                            </div>
                            <Button size="sm" variant="outline">
                              Participer
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
