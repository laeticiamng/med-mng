import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Brain, ArrowLeft, Medal, BookOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function LearningLeaderboard() {
  const { data: learningLeaderboard, isLoading } = useQuery({
    queryKey: ['learning-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  return (
    <>
      <Helmet>
        <title>Classement Apprentissage | Med-Mng</title>
        <meta name="description" content="Classement des meilleurs apprenants et performers" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={ROUTE_PATHS.leaderboard}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux classements
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Classement Apprentissage</h1>
          </div>
          <p className="text-muted-foreground">
            Les top performers en apprentissage et acquisition de connaissances
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Apprenants</CardDescription>
              <CardTitle className="text-2xl">{learningLeaderboard?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Points Maximum</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {learningLeaderboard?.[0]?.total_points || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Modules Complétés</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                1,234
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top 50 Apprentissage</CardTitle>
            <CardDescription>Basé sur les points totaux et la progression</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {learningLeaderboard?.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors border"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      {index < 3 ? (
                        <Medal className={`w-8 h-8 mx-auto ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-600'
                        }`} />
                      ) : (
                        <span className="text-xl font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{entry.user_id}</div>
                      <div className="text-sm text-muted-foreground">
                        Points: {entry.total_points}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-purple-600">
                        {entry.total_points} pts
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rang #{entry.rank || index + 1}
                      </div>
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
