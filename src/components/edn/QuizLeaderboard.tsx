import React, { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Users, Crown, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  quizCount: number;
  avgScore: number;
  isCurrentUser: boolean;
}

interface QuizLeaderboardProps {
  itemCode?: string;
  limit?: number;
}

export const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({ 
  itemCode,
  limit = 10 
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<{ rank: number; avgScore: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch quiz results with aggregation
        let query = supabase
          .from('quiz_results')
          .select('user_id, score, item_code');

        if (itemCode) {
          query = query.eq('item_code', itemCode);
        }

        const { data: results, error } = await query;
        if (error) throw error;

        // Aggregate by user
        const userScores: Record<string, { total: number; count: number; scores: number[] }> = {};
        
        results?.forEach(result => {
          if (!userScores[result.user_id]) {
            userScores[result.user_id] = { total: 0, count: 0, scores: [] };
          }
          userScores[result.user_id].total += result.score;
          userScores[result.user_id].count += 1;
          userScores[result.user_id].scores.push(result.score);
        });

        // Calculate rankings
        const leaderboard: LeaderboardEntry[] = Object.entries(userScores)
          .map(([userId, data]) => ({
            userId,
            displayName: `Étudiant ${userId.slice(0, 6)}`,
            score: data.total,
            quizCount: data.count,
            avgScore: Math.round(data.total / data.count),
            rank: 0,
            isCurrentUser: userId === user?.id
          }))
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, limit)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));

        setEntries(leaderboard);

        // Find current user stats
        if (user && userScores[user.id]) {
          const allUsers = Object.entries(userScores)
            .map(([id, data]) => ({ id, avg: data.total / data.count }))
            .sort((a, b) => b.avg - a.avg);
          
          const userRank = allUsers.findIndex(u => u.id === user.id) + 1;
          const userData = userScores[user.id];
          
          setUserStats({
            rank: userRank,
            avgScore: Math.round(userData.total / userData.count),
            total: allUsers.length
          });
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [itemCode, limit]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-primary/10 border-primary/30';
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gray-300/10 border-gray-400/30';
      case 3:
        return 'bg-amber-500/10 border-amber-500/30';
      default:
        return 'bg-muted/50 border-border';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          Classement Quiz
        </CardTitle>
        <CardDescription>
          {itemCode ? `Classement pour ${itemCode}` : 'Classement global des quiz EDN'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User position summary */}
        {userStats && (
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Votre position</p>
                  <p className="text-sm text-muted-foreground">
                    {userStats.rank}e sur {userStats.total} participants
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{userStats.avgScore}%</p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </div>
            </div>
            <Progress 
              value={(1 - (userStats.rank - 1) / userStats.total) * 100} 
              className="mt-3 h-2"
            />
          </div>
        )}

        {/* Leaderboard list */}
        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun résultat de quiz disponible</p>
              <p className="text-sm">Soyez le premier à faire un quiz !</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${getRankBg(entry.rank, entry.isCurrentUser)}`}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {entry.isCurrentUser ? 'Vous' : entry.displayName}
                    </span>
                    {entry.isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">Vous</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entry.quizCount} quiz effectué{entry.quizCount > 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg">{entry.avgScore}%</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Moy.
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
