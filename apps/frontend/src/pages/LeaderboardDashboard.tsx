import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Trophy, Target, Brain, TrendingUp, Medal, Crown, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function LeaderboardDashboard() {
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });

  const leaderboardCategories = [
    {
      title: 'Classement Focus',
      description: 'Meilleurs scores de concentration',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      route: ROUTE_PATHS.leaderboardFocus,
      stat: '1,234 participants'
    },
    {
      title: 'Classement Apprentissage',
      description: 'Top performers en apprentissage',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      route: ROUTE_PATHS.leaderboardLearning,
      stat: '2,156 participants'
    },
    {
      title: 'Classement Hebdomadaire',
      description: 'Champions de la semaine',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      route: ROUTE_PATHS.leaderboardWeekly,
      stat: 'Réinitialise lundi'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Classements | Med-Mng</title>
        <meta name="description" content="Classements et leaderboards de la communauté Med-Mng" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Classements</h1>
          </div>
          <p className="text-muted-foreground">
            Suivez les meilleurs performers et mesurez-vous à la communauté
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {leaderboardCategories.map((category) => (
            <Card key={category.route} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-3`}>
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{category.stat}</span>
                  <Link to={category.route}>
                    <Button variant="outline" size="sm">
                      Voir classement
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top 10 Global */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Top 10 Global
                </CardTitle>
                <CardDescription>Les meilleurs performers toutes catégories</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboardData?.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 text-center">
                      {index < 3 ? (
                        <Medal className={`w-8 h-8 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-600'
                        }`} />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{user.user_id}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.total_points} points
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {user.rank || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
