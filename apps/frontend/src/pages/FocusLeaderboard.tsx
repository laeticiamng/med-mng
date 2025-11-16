import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Target, ArrowLeft, Medal, Clock, Flame } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function FocusLeaderboard() {
  const { data: focusLeaderboard, isLoading } = useQuery({
    queryKey: ['focus-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('focus_leaderboard')
        .select('*')
        .order('focus_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  return (
    <>
      <Helmet>
        <title>Classement Focus | Med-Mng</title>
        <meta name="description" content="Classement des meilleurs scores de concentration et de focus" />
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
            <Target className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Classement Focus</h1>
          </div>
          <p className="text-muted-foreground">
            Les meilleurs scores de concentration et de productivité
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Participants</CardDescription>
              <CardTitle className="text-2xl">{focusLeaderboard?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Meilleur Score</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                {focusLeaderboard?.[0]?.focus_score || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Temps Moyen</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                2h 34m
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top 50 Focus</CardTitle>
            <CardDescription>Classement mis à jour en temps réel</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {focusLeaderboard?.map((entry, index) => (
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
                        Score: {entry.focus_score}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">
                        {entry.focus_score} pts
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
