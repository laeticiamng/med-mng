import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Award, Crown, Medal, Sparkles, Star, Trophy, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  rank: number;
  total_xp: number;
  weekly_xp: number;
  monthly_xp: number;
  streak_days: number;
  display_name: string;
  avatar_url: string;
  level: number;
}

const Leaderboard = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .order('rank', { ascending: true })
        .limit(50);

      if (error) throw error;
      return (data || []) as LeaderboardEntry[];
    },
  });

  const { data: userRank } = useQuery({
    queryKey: ['user-rank', period],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as LeaderboardEntry | null;
    },
  });

  const getScore = (entry: LeaderboardEntry) => {
    switch (period) {
      case 'weekly':
        return entry.weekly_xp;
      case 'monthly':
        return entry.monthly_xp;
      default:
        return entry.total_xp;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-amber-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50';
      case 2:
        return 'bg-gradient-to-r from-slate-400/20 to-gray-400/20 border-slate-400/50';
      case 3:
        return 'bg-gradient-to-r from-orange-600/20 to-amber-600/20 border-orange-600/50';
      default:
        return 'bg-card';
    }
  };

  // Calculer la distribution des scores dynamiquement
  const scoreDistribution = useMemo(() => {
    if (!leaderboardData || leaderboardData.length === 0) {
      return [
        { label: 'Top 10%', value: 0, color: 'bg-success' },
        { label: 'Top 25%', value: 0, color: 'bg-primary' },
        { label: 'Top 50%', value: 0, color: 'bg-warning' },
        { label: 'Autres', value: 0, color: 'bg-muted' },
      ];
    }
    
    const total = leaderboardData.length;
    const top10Threshold = Math.max(1, Math.floor(total * 0.1));
    const top25Threshold = Math.max(1, Math.floor(total * 0.25));
    const top50Threshold = Math.max(1, Math.floor(total * 0.5));
    
    const top10Avg = leaderboardData.slice(0, top10Threshold).reduce((acc, e) => acc + getScore(e), 0) / top10Threshold;
    const top25Avg = leaderboardData.slice(0, top25Threshold).reduce((acc, e) => acc + getScore(e), 0) / top25Threshold;
    const top50Avg = leaderboardData.slice(0, top50Threshold).reduce((acc, e) => acc + getScore(e), 0) / top50Threshold;
    const allAvg = leaderboardData.reduce((acc, e) => acc + getScore(e), 0) / total;
    
    const maxScore = leaderboardData[0] ? getScore(leaderboardData[0]) : 1;
    
    return [
      { label: 'Top 10%', value: Math.round((top10Avg / maxScore) * 100), color: 'bg-success' },
      { label: 'Top 25%', value: Math.round((top25Avg / maxScore) * 100), color: 'bg-primary' },
      { label: 'Top 50%', value: Math.round((top50Avg / maxScore) * 100), color: 'bg-warning' },
      { label: 'Moyenne', value: Math.round((allAvg / maxScore) * 100), color: 'bg-muted' },
    ];
  }, [leaderboardData, period]);

  return (
    <>
      <Helmet>
        <title>Classement | MED-MNG</title>
        <meta name="description" content="Comparez vos performances avec la communauté MED-MNG. Classement hebdomadaire, mensuel et général." />
        <meta name="keywords" content="classement, leaderboard, compétition, XP, médecine" />
        <link rel="canonical" href="/leaderboard" />
      </Helmet>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Classement</h1>
          </div>
          <p className="text-muted-foreground">
            Comparez vos performances avec la communauté MED-MNG
          </p>
        </div>

      {/* User Rank Card */}
      {userRank && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Votre classement</p>
                  <p className="text-2xl font-bold text-primary">#{userRank.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{getScore(userRank).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Cette semaine</SelectItem>
            <SelectItem value="monthly">Ce mois</SelectItem>
            <SelectItem value="all_time">Tout temps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="ranking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ranking" className="gap-2">
            <Trophy className="h-4 w-4" />
            Classement
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : leaderboardData && leaderboardData.length > 0 ? (
            leaderboardData.map((entry) => (
              <Card
                key={entry.id}
                className={`transition-all hover:shadow-md ${getRankStyle(entry.rank)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {entry.display_name || `Utilisateur ${entry.rank}`}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Sparkles className="h-3 w-3" />
                          <span>{entry.streak_days} jours de série</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{getScore(entry).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucun classement disponible pour cette période.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Commencez à étudier pour apparaître au classement !
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {leaderboardData?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">XP moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <span className="text-2xl font-bold">
                    {leaderboardData && leaderboardData.length > 0
                      ? Math.round(
                          leaderboardData.reduce((acc, e) => acc + getScore(e), 0) /
                            leaderboardData.length
                        ).toLocaleString()
                      : 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-warning" />
                  <span className="text-2xl font-bold">
                    {leaderboardData?.[0] ? getScore(leaderboardData[0]).toLocaleString() : 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribution des scores</CardTitle>
              <CardDescription>
                Répartition des XP par tranche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scoreDistribution.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
};

export default Leaderboard;
