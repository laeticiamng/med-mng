import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Users, Trophy, Star, Calendar, Target, TrendingUp, ArrowRight, Crown, Medal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  teamProgress: number;
  participants: number;
  goal: number;
}

export default function TeamChallenges() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'upcoming'>('active');

  // Fetch team challenges
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['team-challenges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // For now, return mock data since the team_challenges table might not exist yet
      // In production, replace with actual Supabase query
      const mockChallenges: TeamChallenge[] = [
        {
          id: '1',
          title: 'Marathon d\'Apprentissage Collectif',
          description: 'Complétez ensemble 1000 items EDN en équipe ce mois-ci',
          points: 500,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          teamProgress: 65,
          participants: 24,
          goal: 1000
        },
        {
          id: '2',
          title: 'Challenge Focus Hebdomadaire',
          description: 'Accumulez 100 heures de sessions focus en équipe cette semaine',
          points: 200,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          teamProgress: 42,
          participants: 18,
          goal: 100
        },
        {
          id: '3',
          title: 'Défi Collaboration',
          description: 'Créez 50 posts collaboratifs et aidez vos coéquipiers',
          points: 300,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          teamProgress: 28,
          participants: 32,
          goal: 50
        },
        {
          id: '4',
          title: 'Sprint d\'Examen Final',
          description: 'Préparez-vous ensemble pour l\'examen avec 500 items révisés',
          points: 400,
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          teamProgress: 0,
          participants: 45,
          goal: 500
        },
      ];

      return mockChallenges;
    },
    enabled: !!user?.id
  });

  // Fetch team leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['team-leaderboard'],
    queryFn: async () => {
      // Mock leaderboard data
      return [
        { id: '1', teamName: 'Les Warriors Médicaux', points: 15420, rank: 1, members: 28 },
        { id: '2', teamName: 'Team Excellence', points: 14850, rank: 2, members: 25 },
        { id: '3', teamName: 'Les Challengers', points: 13200, rank: 3, members: 22 },
        { id: '4', teamName: 'Squad Motivation', points: 12100, rank: 4, members: 30 },
        { id: '5', teamName: 'Équipe Réussite', points: 11500, rank: 5, members: 20 },
      ];
    }
  });

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const ChallengeCard = ({ challenge }: { challenge: TeamChallenge }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{challenge.title}</CardTitle>
            <CardDescription>{challenge.description}</CardDescription>
          </div>
          <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
            {challenge.status === 'active' ? 'En cours' :
             challenge.status === 'completed' ? 'Terminé' : 'À venir'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          {challenge.status !== 'upcoming' && (
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Progression d'équipe</span>
                <span className="font-semibold">{challenge.teamProgress}%</span>
              </div>
              <Progress value={challenge.teamProgress} className="h-2" />
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                {challenge.participants} participants
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{challenge.points} pts</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">
                {formatDate(challenge.startDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">
                Objectif: {challenge.goal}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button className="w-full" variant={challenge.status === 'upcoming' ? 'outline' : 'default'}>
            {challenge.status === 'active' ? 'Rejoindre le challenge' :
             challenge.status === 'completed' ? 'Voir les résultats' : 'S\'inscrire'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Veuillez vous connecter pour voir les challenges d'équipe</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Challenges d'Équipe | Med-Mng</title>
        <meta name="description" content="Participez aux challenges d'équipe et progressez ensemble" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-4xl font-bold">Challenges d'Équipe</h1>
                <p className="text-muted-foreground mt-1">
                  Relevez des défis ensemble et gagnez des récompenses
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Challenges Actifs</CardDescription>
                    <CardTitle className="text-2xl text-blue-600">{activeChallenges.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Complétés</CardDescription>
                    <CardTitle className="text-2xl text-green-600">{completedChallenges.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Points d'Équipe</CardDescription>
                    <CardTitle className="text-2xl text-yellow-600">2,450</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Challenges Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Actifs ({activeChallenges.length})</TabsTrigger>
                  <TabsTrigger value="upcoming">À venir ({upcomingChallenges.length})</TabsTrigger>
                  <TabsTrigger value="completed">Terminés ({completedChallenges.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i}>
                          <CardContent className="pt-6">
                            <Skeleton className="h-32 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : activeChallenges.length > 0 ? (
                    <div className="space-y-4">
                      {activeChallenges.map((challenge) => (
                        <ChallengeCard key={challenge.id} challenge={challenge} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Aucun challenge actif</h3>
                        <p className="text-muted-foreground">
                          Revenez bientôt pour de nouveaux challenges
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="mt-6">
                  {upcomingChallenges.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingChallenges.map((challenge) => (
                        <ChallengeCard key={challenge.id} challenge={challenge} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Aucun challenge à venir</h3>
                        <p className="text-muted-foreground">
                          De nouveaux challenges seront bientôt disponibles
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                  <Card>
                    <CardContent className="text-center py-12">
                      <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Aucun challenge terminé</h3>
                      <p className="text-muted-foreground">
                        Commencez à participer aux challenges pour voir vos succès ici
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div>
              {/* Team Leaderboard */}
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Classement des Équipes
                  </CardTitle>
                  <CardDescription>Top 5 cette semaine</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboardLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((team) => (
                        <div
                          key={team.id}
                          className={`p-3 rounded-lg border ${
                            team.rank <= 3 ? 'bg-primary/5 border-primary/20' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 flex justify-center">
                              {getRankIcon(team.rank)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">
                                {team.teamName}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{team.members} membres</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm">{team.points.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">points</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Liens Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to={ROUTE_PATHS.teamsDashboard}>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Voir mon équipe
                    </Button>
                  </Link>
                  <Link to={ROUTE_PATHS.challenges}>
                    <Button variant="outline" className="w-full justify-start">
                      <Trophy className="h-4 w-4 mr-2" />
                      Challenges individuels
                    </Button>
                  </Link>
                  <Link to={ROUTE_PATHS.leaderboard}>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Classement global
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
