import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowLeft, Trophy, Star, Calendar, Award, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function UserPublicProfile() {
  const { userId } = useParams<{ userId: string }>();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('profiles_public')
        .select('*, user_achievements(*, achievements(*))')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Profil introuvable</p>
            <Link to={ROUTE_PATHS.users}>
              <Button variant="outline" className="mt-4">
                Retour à l'annuaire
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPoints = Math.floor(Math.random() * 5000);
  const achievementsCount = profile.user_achievements?.length || 0;

  return (
    <>
      <Helmet>
        <title>{profile.display_name || profile.username || 'Profil'} | Med-Mng</title>
        <meta name="description" content={profile.bio || 'Profil utilisateur'} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link to={ROUTE_PATHS.users}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'annuaire
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">
                    {profile.display_name || profile.username || 'Utilisateur'}
                  </h1>
                  {profile.is_pro && (
                    <Badge variant="secondary">PRO</Badge>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}

                <div className="flex gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Points</div>
                      <div className="font-semibold">{totalPoints}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Badges</div>
                      <div className="font-semibold">{achievementsCount}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Membre depuis</div>
                      <div className="font-semibold">
                        {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <Button>Suivre</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="achievements">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="achievements">Réalisations</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Réalisations Débloquées</CardTitle>
                <CardDescription>
                  {achievementsCount} badge{achievementsCount > 1 ? 's' : ''} débloqué{achievementsCount > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profile.user_achievements && profile.user_achievements.length > 0 ? (
                    profile.user_achievements.map((ua: any) => (
                      <div key={ua.id} className="flex flex-col items-center text-center p-4 border rounded-lg">
                        <Award className="w-12 h-12 text-yellow-500 mb-2" />
                        <div className="font-semibold text-sm mb-1">
                          {ua.achievements?.title || 'Badge'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(ua.earned_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      Aucun badge débloqué pour le moment
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
                <CardDescription>Les dernières actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <Target className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">
                          A complété un challenge
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Il y a {i} jour{i > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
                <CardDescription>Performance et progression</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                    <div className="text-sm text-muted-foreground">Points Total</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">24</div>
                    <div className="text-sm text-muted-foreground">Challenges Complétés</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-muted-foreground">Jours de Streak</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">#{Math.floor(Math.random() * 100)}</div>
                    <div className="text-sm text-muted-foreground">Rang Global</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
