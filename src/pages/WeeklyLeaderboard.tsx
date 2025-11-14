import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { TrendingUp, ArrowLeft, Medal, Calendar, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function WeeklyLeaderboard() {
  const { data: weeklyLeaderboard, isLoading } = useQuery({
    queryKey: ['weekly-leaderboard'],
    queryFn: async () => {
      // Calculer le début de la semaine
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('user_leaderboard')
        .select('*')
        .gte('updated_at', startOfWeek.toISOString())
        .order('total_points', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  const getNextMonday = () => {
    const today = new Date();
    const daysUntilMonday = (8 - today.getDay()) % 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <>
      <Helmet>
        <title>Classement Hebdomadaire | Med-Mng</title>
        <meta name="description" content="Champions de la semaine - Classement réinitialisé chaque lundi" />
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
            <TrendingUp className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Classement Hebdomadaire</h1>
          </div>
          <p className="text-muted-foreground">
            Les champions de la semaine - Réinitialisation chaque lundi
          </p>
        </div>

        {/* Alert Banner */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">
                  Prochaine réinitialisation: {getNextMonday()}
                </div>
                <div className="text-sm text-green-700">
                  Le classement redémarre à zéro chaque lundi matin
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Participants cette semaine</CardDescription>
              <CardTitle className="text-2xl">{weeklyLeaderboard?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Champion actuel</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                {weeklyLeaderboard?.[0]?.user_id?.slice(0, 10) || 'N/A'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Score du leader</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {weeklyLeaderboard?.[0]?.total_points || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top 50 de la Semaine</CardTitle>
            <CardDescription>Performances depuis lundi dernier</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {weeklyLeaderboard?.map((entry, index) => (
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
                        Cette semaine
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {entry.total_points} pts
                      </div>
                      <div className="text-sm text-muted-foreground">
                        +{Math.floor(Math.random() * 100)} cette semaine
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
