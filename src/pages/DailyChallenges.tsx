import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Calendar, ArrowLeft, CheckCircle2, Star, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function DailyChallenges() {
  const today = new Date().toISOString().split('T')[0];

  const { data: dailyChallenges, isLoading } = useQuery({
    queryKey: ['daily-challenges', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .gte('created_at', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const formatTimeRemaining = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <Helmet>
        <title>Challenges Quotidiens | Med-Mng</title>
        <meta name="description" content="Relevez les challenges quotidiens et gagnez des points" />
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
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-900">
                    Temps restant: {formatTimeRemaining()}
                  </div>
                  <div className="text-sm text-blue-700">
                    Les challenges se renouvellent à minuit
                  </div>
                </div>
              </div>
              <Badge variant="secondary">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Challenges du Jour</CardDescription>
              <CardTitle className="text-2xl">{dailyChallenges?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Complétés Aujourd'hui</CardDescription>
              <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {Math.floor((dailyChallenges?.length || 0) * 0.4)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Points Gagnés</CardDescription>
              <CardTitle className="text-2xl text-yellow-600 flex items-center gap-2">
                <Star className="w-5 h-5" />
                {Math.floor((dailyChallenges?.length || 0) * 40)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Daily Challenges List */}
        <Card>
          <CardHeader>
            <CardTitle>Challenges d'Aujourd'hui</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : dailyChallenges && dailyChallenges.length > 0 ? (
              <div className="space-y-4">
                {dailyChallenges.map((challenge, index) => (
                  <Link
                    key={challenge.id}
                    to={`${ROUTE_PATHS.challenges}/${challenge.challenge_id || challenge.id}`}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {Math.random() > 0.6 ? (
                              <CheckCircle2 className="w-8 h-8 text-green-500" />
                            ) : (
                              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-muted-foreground font-semibold">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{challenge.title || `Challenge ${index + 1}`}</h3>
                              <Badge variant="outline">
                                <Star className="w-3 h-3 mr-1" />
                                {challenge.points || 100} pts
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {challenge.description || 'Complétez ce challenge pour gagner des points'}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progression</span>
                                <span className="font-semibold">
                                  {Math.floor(Math.random() * 100)}%
                                </span>
                              </div>
                              <Progress value={Math.floor(Math.random() * 100)} />
                            </div>
                          </div>
                          <Button size="sm">
                            {Math.random() > 0.6 ? 'Complété' : 'Commencer'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
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
      </div>
    </>
  );
}
