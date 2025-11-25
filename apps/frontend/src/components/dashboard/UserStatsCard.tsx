import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  Music,
  BookOpen,
  Award,
  Flame,
  Star,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';
import logger from '@/lib/logger';

interface UserStats {
  // Learning stats
  totalItemsViewed: number;
  totalItemsCompleted: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  totalStudyTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  // Music stats
  totalSongsGenerated: number;
  totalSongsListened: number;
  totalPlaylistsCreated: number;
  // Engagement stats
  totalBadgesEarned: number;
  totalPointsEarned: number;
  levelProgress: number;
  currentLevel: number;
  // Activity
  lastActivityDate: string | null;
  memberSinceDays: number;
}

const useUserStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async (): Promise<UserStats> => {
      if (!userId) throw new Error('User ID required');

      // Fetch multiple stats in parallel
      const [
        viewingHistory,
        progress,
        quizSessions,
        musicStats,
        badges,
        profile,
        streaks,
      ] = await Promise.all([
        // Viewing history
        (supabase as any)
          .from('user_viewing_history')
          .select('item_id', { count: 'exact' })
          .eq('user_id', userId),
        // Progress
        (supabase as any)
          .from('user_edn_progress')
          .select('status, time_spent_minutes')
          .eq('user_id', userId),
        // Quiz sessions
        (supabase as any)
          .from('quiz_sessions')
          .select('score_percentage, time_spent_seconds')
          .eq('user_id', userId),
        // Music stats
        Promise.all([
          (supabase as any)
            .from('med_mng_user_songs')
            .select('id', { count: 'exact' })
            .eq('user_id', userId),
          (supabase as any)
            .from('med_mng_playlists')
            .select('id', { count: 'exact' })
            .eq('user_id', userId),
        ]),
        // Badges
        (supabase as any)
          .from('user_badges')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        // Profile
        (supabase as any)
          .from('profiles')
          .select('created_at, points, level')
          .eq('id', userId)
          .single(),
        // Streaks
        (supabase as any)
          .from('user_streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', userId)
          .single(),
      ]);

      // Calculate stats
      const completedItems = progress.data?.filter(
        (p: any) => p.status === 'completed' || p.status === 'mastered'
      ).length || 0;

      const totalStudyTime = progress.data?.reduce(
        (sum: number, p: any) => sum + (p.time_spent_minutes || 0),
        0
      ) || 0;

      const quizScores = quizSessions.data?.map((q: any) => q.score_percentage) || [];
      const averageScore = quizScores.length > 0
        ? quizScores.reduce((a: number, b: number) => a + b, 0) / quizScores.length
        : 0;

      const [userSongs, playlists] = musicStats;

      const memberSince = profile.data?.created_at
        ? Math.floor((Date.now() - new Date(profile.data.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const currentLevel = profile.data?.level || 1;
      const points = profile.data?.points || 0;
      const pointsForNextLevel = currentLevel * 1000;
      const levelProgress = Math.min(100, (points % 1000) / 10);

      return {
        totalItemsViewed: viewingHistory.count || 0,
        totalItemsCompleted: completedItems,
        totalQuizzesTaken: quizSessions.data?.length || 0,
        averageQuizScore: Math.round(averageScore * 10) / 10,
        totalStudyTimeMinutes: totalStudyTime,
        currentStreak: streaks.data?.current_streak || 0,
        longestStreak: streaks.data?.longest_streak || 0,
        totalSongsGenerated: userSongs.count || 0,
        totalSongsListened: 0, // Would need listening history
        totalPlaylistsCreated: playlists.count || 0,
        totalBadgesEarned: badges.count || 0,
        totalPointsEarned: points,
        levelProgress,
        currentLevel,
        lastActivityDate: null,
        memberSinceDays: memberSince,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}j ${remainingHours}h`;
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, subValue, color = 'text-primary' }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
    <div className={cn('p-2 rounded-lg bg-background', color)}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-muted-foreground truncate">{label}</p>
      <p className="text-lg font-bold">{value}</p>
      {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </div>
  </div>
);

interface UserStatsCardProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({
  className,
  variant = 'full',
}) => {
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useUserStats(user?.id);

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Connectez-vous pour voir vos statistiques
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Impossible de charger les statistiques
          </p>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Niveau {stats.currentLevel}</p>
                <p className="text-xs text-muted-foreground">{stats.totalPointsEarned} pts</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold">{stats.currentStreak}</span>
            </div>
          </div>
          <Progress value={stats.levelProgress} className="h-2" />
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div>
              <p className="text-lg font-bold">{stats.totalItemsCompleted}</p>
              <p className="text-xs text-muted-foreground">Complétés</p>
            </div>
            <div>
              <p className="text-lg font-bold">{stats.totalQuizzesTaken}</p>
              <p className="text-xs text-muted-foreground">Quiz</p>
            </div>
            <div>
              <p className="text-lg font-bold">{stats.totalBadgesEarned}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Vos Statistiques
            </CardTitle>
            <CardDescription>
              Membre depuis {stats.memberSinceDays} jours
            </CardDescription>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Niveau {stats.currentLevel}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalPointsEarned} points
            </p>
          </div>
        </div>
        <Progress value={stats.levelProgress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Learning Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Apprentissage
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatItem
                icon={<Target className="w-4 h-4" />}
                label="Items consultés"
                value={stats.totalItemsViewed}
              />
              <StatItem
                icon={<Award className="w-4 h-4" />}
                label="Items complétés"
                value={stats.totalItemsCompleted}
                color="text-green-600"
              />
              <StatItem
                icon={<Clock className="w-4 h-4" />}
                label="Temps d'étude"
                value={formatTime(stats.totalStudyTimeMinutes)}
              />
            </div>
          </div>

          {/* Quiz Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Quiz & Évaluations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatItem
                icon={<Target className="w-4 h-4" />}
                label="Quiz passés"
                value={stats.totalQuizzesTaken}
              />
              <StatItem
                icon={<TrendingUp className="w-4 h-4" />}
                label="Score moyen"
                value={`${stats.averageQuizScore}%`}
                color={stats.averageQuizScore >= 70 ? 'text-green-600' : 'text-yellow-600'}
              />
              <StatItem
                icon={<Trophy className="w-4 h-4" />}
                label="Badges gagnés"
                value={stats.totalBadgesEarned}
                color="text-purple-600"
              />
            </div>
          </div>

          {/* Music Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Musique
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatItem
                icon={<Music className="w-4 h-4" />}
                label="Chansons générées"
                value={stats.totalSongsGenerated}
                color="text-blue-600"
              />
              <StatItem
                icon={<Calendar className="w-4 h-4" />}
                label="Playlists créées"
                value={stats.totalPlaylistsCreated}
              />
            </div>
          </div>

          {/* Streak Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Régularité
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatItem
                icon={<Flame className="w-4 h-4 text-orange-500" />}
                label="Série actuelle"
                value={`${stats.currentStreak} jours`}
                color="text-orange-600"
              />
              <StatItem
                icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                label="Meilleure série"
                value={`${stats.longestStreak} jours`}
                color="text-yellow-600"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
