import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { History, ArrowLeft, CheckCircle2, Star, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

export default function ChallengesHistory() {
  const { user } = useAuth();

  const { data: userProgress, isLoading } = useQuery({
    queryKey: ['user-challenges-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_challenges_progress')
        .select('*, challenges(*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const completed = userProgress?.filter(p => p.completed) || [];
  const inProgress = userProgress?.filter(p => !p.completed && p.progress > 0) || [];
  const totalPoints = completed.reduce((sum, p) => sum + (p.challenges?.points || 0), 0);

  return (
    <>
      <Helmet>
        <title>Historique des Challenges | Med-Mng</title>
        <meta name="description" content="Consultez l'historique de vos challenges complétés" />
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
            <History className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Historique des Challenges</h1>
          </div>
          <p className="text-muted-foreground">
            Votre progression et challenges complétés
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Complétés</CardDescription>
              <CardTitle className="text-2xl text-green-600">{completed.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>En Cours</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{inProgress.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Points Gagnés</CardDescription>
              <CardTitle className="text-2xl text-yellow-600 flex items-center gap-2">
                <Star className="w-5 h-5" />
                {totalPoints}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Taux de Réussite</CardDescription>
              <CardTitle className="text-2xl">
                {userProgress?.length ? Math.round((completed.length / userProgress.length) * 100) : 0}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* History Tabs */}
        <Card>
          <Tabs defaultValue="completed">
            <CardHeader>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="completed">
                  Complétés ({completed.length})
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  En Cours ({inProgress.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="completed" className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : completed.length > 0 ? (
                  <div className="space-y-4">
                    {completed.map((progress) => (
                      <Link
                        key={progress.id}
                        to={`${ROUTE_PATHS.challenges}/${progress.challenge_id}`}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">
                                  {progress.challenges?.title || 'Challenge'}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {progress.challenges?.description || 'Description du challenge'}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1 text-yellow-600">
                                    <Star className="w-4 h-4" />
                                    <span>{progress.challenges?.points || 0} pts</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {new Date(progress.completed_at || progress.updated_at).toLocaleDateString('fr-FR')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="secondary">100%</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun challenge complété pour le moment</p>
                    <Link to={ROUTE_PATHS.challenges}>
                      <Button variant="outline" className="mt-4">
                        Explorer les challenges
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="in-progress" className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : inProgress.length > 0 ? (
                  <div className="space-y-4">
                    {inProgress.map((progress) => (
                      <Link
                        key={progress.id}
                        to={`${ROUTE_PATHS.challenges}/${progress.challenge_id}`}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-semibold text-blue-500">
                                  {Math.round(progress.progress || 0)}%
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">
                                  {progress.challenges?.title || 'Challenge'}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {progress.challenges?.description || 'Description du challenge'}
                                </p>
                                <div className="flex items-center gap-4 text-sm mb-2">
                                  <div className="flex items-center gap-1 text-yellow-600">
                                    <Star className="w-4 h-4" />
                                    <span>{progress.challenges?.points || 0} pts</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      Démarré le {new Date(progress.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm">Continuer</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun challenge en cours</p>
                    <Link to={ROUTE_PATHS.challenges}>
                      <Button variant="outline" className="mt-4">
                        Commencer un challenge
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
}
