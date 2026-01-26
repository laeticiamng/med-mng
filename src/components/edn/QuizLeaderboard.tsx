import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, ChevronLeft, ChevronRight, Crown, Medal, Star, TrendingUp, Trophy, Users } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

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
  showItemFilter?: boolean;
}

type TimePeriod = 'week' | 'month' | 'all';

export const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({ 
  itemCode: initialItemCode,
  limit = 10,
  showItemFilter = true
}) => {
  const [itemCode, setItemCode] = useState<string | undefined>(initialItemCode);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [_entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [allEntries, setAllEntries] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<{ rank: number; avgScore: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch available items for filter
  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from('quiz_results')
        .select('item_code')
        .order('item_code');
      
      if (data) {
        const uniqueItems = [...new Set(data.map(d => d.item_code))].sort() as string[];
        setAvailableItems(uniqueItems);
      }
    };
    if (showItemFilter) fetchItems();
  }, [showItemFilter]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch quiz results with aggregation
        let query = supabase
          .from('quiz_results')
          .select('user_id, score, item_code, created_at');

        if (itemCode) {
          query = query.eq('item_code', itemCode);
        }

        // Time period filter
        if (timePeriod !== 'all') {
          const now = new Date();
          let startDate: Date;
          if (timePeriod === 'week') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          } else {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          }
          query = query.gte('created_at', startDate.toISOString());
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
          .sort((a, b) => {
            // Tri stable: score moyen > nombre de quiz > ID utilisateur
            if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
            if (b.quizCount !== a.quizCount) return b.quizCount - a.quizCount;
            return a.userId.localeCompare(b.userId); // Stabilité par ID
          })
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));

        setAllEntries(leaderboard);
        setEntries(leaderboard.slice(0, limit));

        // Find current user stats
        if (user && userScores[user.id]) {
          const userRank = leaderboard.findIndex(u => u.userId === user.id) + 1;
          const userData = userScores[user.id];
          
          setUserStats({
            rank: userRank,
            avgScore: Math.round(userData.total / userData.count),
            total: leaderboard.length
          });
        }
      } catch {
        // Silent error handling
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [itemCode, limit, timePeriod]);

  // Pagination
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return allEntries.slice(start, end);
  }, [allEntries, currentPage]);

  const totalPages = Math.ceil(allEntries.length / itemsPerPage);

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

  const getTimePeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'all': return 'Tout le temps';
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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              Classement Quiz
            </CardTitle>
            <CardDescription>
              {itemCode ? `Classement pour ${itemCode}` : 'Classement global de tous les items EDN'}
            </CardDescription>
          </div>
          <Select value={timePeriod} onValueChange={(v) => { setTimePeriod(v as TimePeriod); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="all">Tout le temps</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Item Filter */}
          {showItemFilter && availableItems.length > 1 && (
            <Select value={itemCode || 'all'} onValueChange={(v) => { setItemCode(v === 'all' ? undefined : v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tous les items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {availableItems.map(item => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
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

        {/* Period badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {getTimePeriodLabel(timePeriod)}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {allEntries.length} participants
          </Badge>
        </div>

        {/* Leaderboard list */}
        <div className="space-y-2">
          {paginatedEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun résultat de quiz disponible</p>
              <p className="text-sm">Soyez le premier à faire un quiz !</p>
            </div>
          ) : (
            paginatedEntries.map((entry) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
