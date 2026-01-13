import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Medal, Crown, TrendingUp, Flame, Star, 
  Calendar, Loader2, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  streak: number;
  badges: number;
  change?: number; // Position change from last week
}

type Period = 'daily' | 'weekly' | 'monthly' | 'allTime';

export function LeaderboardPersistent() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('weekly');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'daily':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'allTime':
          startDate = new Date(0);
          break;
      }

      // Fetch activities with points
      let query = supabase
        .from('gamification_activities')
        .select('user_id, points_earned');
      
      if (period !== 'allTime') {
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data: activities, error } = await query;
      if (error) throw error;

      // Aggregate by user
      const userPoints: Record<string, number> = {};
      activities?.forEach((a: any) => {
        userPoints[a.user_id] = (userPoints[a.user_id] || 0) + (a.points_earned || 0);
      });

      // Get user profiles and badges
      const userIds = Object.keys(userPoints);
      if (userIds.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      const [profilesResult, badgesResult, streaksResult] = await Promise.all([
        supabase.from('profiles').select('id, name, email').in('id', userIds),
        supabase.from('user_badges').select('user_id').in('user_id', userIds).eq('unlocked', true),
        supabase.from('user_gamification_stats').select('user_id, longest_streak').in('user_id', userIds)
      ]);

      const profiles = profilesResult.data || [];
      const badges = badgesResult.data || [];
      const streaks = streaksResult.data || [];

      // Count badges per user
      const badgeCounts: Record<string, number> = {};
      badges.forEach((b: any) => {
        badgeCounts[b.user_id] = (badgeCounts[b.user_id] || 0) + 1;
      });

      // Get streaks
      const streakMap: Record<string, number> = {};
      streaks.forEach((s: any) => {
        streakMap[s.user_id] = s.longest_streak || 0;
      });

      // Build leaderboard
      const entries: LeaderboardEntry[] = Object.entries(userPoints)
        .map(([userId, points]) => {
          const profile = profiles.find((p: any) => p.id === userId);
          return {
            rank: 0,
            userId,
            name: profile?.name || profile?.email?.split('@')[0] || 'Utilisateur',
            points,
            streak: streakMap[userId] || 0,
            badges: badgeCounts[userId] || 0,
          };
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, 50)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

      setLeaderboard(entries);

      // Find current user rank
      if (user) {
        const userEntry = entries.find(e => e.userId === user.id);
        setUserRank(userEntry?.rank || null);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-600/5 border-amber-600/30';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              Classement
            </CardTitle>
            <CardDescription>
              Comparez-vous aux autres étudiants
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={loadLeaderboard} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period selector */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="daily">Jour</TabsTrigger>
            <TabsTrigger value="weekly">Semaine</TabsTrigger>
            <TabsTrigger value="monthly">Mois</TabsTrigger>
            <TabsTrigger value="allTime">Total</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Current user rank */}
        {userRank && (
          <div className="p-3 bg-primary/10 rounded-lg flex items-center justify-between">
            <span className="text-sm">Votre position</span>
            <Badge variant="default" className="text-lg">
              #{userRank}
            </Badge>
          </div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune donnée pour cette période</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  getRankStyle(entry.rank),
                  entry.userId === currentUserId && "ring-2 ring-primary"
                )}
              >
                <div className="w-8 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10">
                    {entry.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {entry.name}
                    {entry.userId === currentUserId && (
                      <span className="text-xs text-primary ml-2">(vous)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {entry.streak}j
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {entry.badges}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-primary">{entry.points.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
