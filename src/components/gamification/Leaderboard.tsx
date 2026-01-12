import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  weeklyXP: number;
  streak: number;
  badges: number;
  quizScore: number;
  studyHours: number;
}

interface LeaderboardProps {
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category?: 'xp' | 'streak' | 'quizzes' | 'study';
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  timeframe = 'weekly',
  category = 'xp'
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [selectedCategory, setSelectedCategory] = useState(category);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTimeframe, selectedCategory]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Simulation de données - remplacer par vraie requête
      const mockEntries: LeaderboardEntry[] = [
        {
          id: '1',
          rank: 1,
          previousRank: 1,
          userId: 'user1',
          userName: 'Dr. Sophie Martin',
          level: 42,
          totalXP: 125600,
          weeklyXP: 4520,
          streak: 67,
          badges: 24,
          quizScore: 94,
          studyHours: 156
        },
        {
          id: '2',
          rank: 2,
          previousRank: 3,
          userId: 'user2',
          userName: 'Thomas Leroy',
          level: 38,
          totalXP: 98500,
          weeklyXP: 3890,
          streak: 45,
          badges: 19,
          quizScore: 91,
          studyHours: 134
        },
        {
          id: '3',
          rank: 3,
          previousRank: 2,
          userId: 'user3',
          userName: 'Marie Dubois',
          level: 36,
          totalXP: 89200,
          weeklyXP: 3210,
          streak: 32,
          badges: 17,
          quizScore: 88,
          studyHours: 128
        },
        {
          id: '4',
          rank: 4,
          previousRank: 5,
          userId: 'user4',
          userName: 'Lucas Bernard',
          level: 34,
          totalXP: 78400,
          weeklyXP: 2980,
          streak: 28,
          badges: 15,
          quizScore: 85,
          studyHours: 112
        },
        {
          id: '5',
          rank: 5,
          previousRank: 4,
          userId: 'user5',
          userName: 'Emma Petit',
          level: 32,
          totalXP: 71200,
          weeklyXP: 2650,
          streak: 21,
          badges: 14,
          quizScore: 82,
          studyHours: 98
        },
        ...Array.from({ length: 15 }, (_, i) => ({
          id: `${i + 6}`,
          rank: i + 6,
          previousRank: i + 6 + (Math.random() > 0.5 ? 1 : -1),
          userId: `user${i + 6}`,
          userName: `Étudiant ${i + 6}`,
          level: 30 - i,
          totalXP: 65000 - i * 3000,
          weeklyXP: 2400 - i * 100,
          streak: 18 - i,
          badges: 12 - Math.floor(i / 2),
          quizScore: 80 - i,
          studyHours: 90 - i * 4
        }))
      ];

      setEntries(mockEntries);

      // Simuler l'utilisateur actuel
      if (user) {
        setCurrentUser({
          id: 'current',
          rank: 12,
          previousRank: 15,
          userId: user.id,
          userName: 'Vous',
          level: 28,
          totalXP: 52400,
          weeklyXP: 1890,
          streak: 14,
          badges: 11,
          quizScore: 76,
          studyHours: 67
        });
      }
    } catch (error) {
      console.error('Erreur chargement leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous: number) => {
    const diff = previous - current;
    if (diff > 0) {
      return (
        <span className="flex items-center text-success text-xs">
          <TrendingUp className="h-3 w-3 mr-0.5" />
          +{diff}
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center text-destructive text-xs">
          <TrendingDown className="h-3 w-3 mr-0.5" />
          {diff}
        </span>
      );
    }
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getCategoryValue = (entry: LeaderboardEntry) => {
    switch (selectedCategory) {
      case 'xp': return selectedTimeframe === 'weekly' ? entry.weeklyXP : entry.totalXP;
      case 'streak': return entry.streak;
      case 'quizzes': return entry.quizScore;
      case 'study': return entry.studyHours;
      default: return entry.totalXP;
    }
  };

  const getCategoryLabel = () => {
    switch (selectedCategory) {
      case 'xp': return 'XP';
      case 'streak': return 'jours';
      case 'quizzes': return '%';
      case 'study': return 'h';
      default: return 'XP';
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
      default: return '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Classement
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {entries.length} participants
          </Badge>
        </div>

        {/* Timeframe Tabs */}
        <Tabs value={selectedTimeframe} onValueChange={(v) => setSelectedTimeframe(v as any)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="daily">Jour</TabsTrigger>
            <TabsTrigger value="weekly">Semaine</TabsTrigger>
            <TabsTrigger value="monthly">Mois</TabsTrigger>
            <TabsTrigger value="all-time">Total</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Category Tabs */}
        <div className="flex gap-2 mt-2">
          <Button
            variant={selectedCategory === 'xp' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('xp')}
            className="gap-1"
          >
            <Star className="h-3 w-3" />
            XP
          </Button>
          <Button
            variant={selectedCategory === 'streak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('streak')}
            className="gap-1"
          >
            <Flame className="h-3 w-3" />
            Série
          </Button>
          <Button
            variant={selectedCategory === 'quizzes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('quizzes')}
            className="gap-1"
          >
            <Target className="h-3 w-3" />
            Quiz
          </Button>
          <Button
            variant={selectedCategory === 'study' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('study')}
            className="gap-1"
          >
            <Calendar className="h-3 w-3" />
            Étude
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-4 mb-6 py-4">
          {entries.slice(0, 3).map((entry, index) => {
            const order = index === 0 ? 1 : index === 1 ? 0 : 2;
            const heights = ['h-24', 'h-20', 'h-16'];
            
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: order * 0.1 }}
                className="flex flex-col items-center"
                style={{ order }}
              >
                <Avatar className={cn(
                  "border-4 mb-2",
                  index === 0 ? "h-16 w-16 border-yellow-500" :
                  index === 1 ? "h-14 w-14 border-gray-400" :
                  "h-12 w-12 border-amber-600"
                )}>
                  <AvatarImage src={entry.avatarUrl} />
                  <AvatarFallback>{entry.userName[0]}</AvatarFallback>
                </Avatar>
                {getRankIcon(entry.rank)}
                <p className="text-sm font-medium mt-1 text-center max-w-[80px] truncate">
                  {entry.userName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Nv.{entry.level}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {getCategoryValue(entry).toLocaleString()} {getCategoryLabel()}
                </Badge>
                <div className={cn(
                  "w-16 mt-2 rounded-t-lg",
                  heights[index],
                  index === 0 ? "bg-yellow-500" :
                  index === 1 ? "bg-gray-400" :
                  "bg-amber-600"
                )} />
              </motion.div>
            );
          })}
        </div>

        {/* Full Leaderboard */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {entries.slice(3).map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50",
                  currentUser?.userId === entry.userId && "bg-primary/10 border-primary"
                )}
              >
                <div className="w-10 text-center">
                  {getRankIcon(entry.rank)}
                  {getRankChange(entry.rank, entry.previousRank)}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatarUrl} />
                  <AvatarFallback>{entry.userName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.userName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3" />
                      Nv.{entry.level}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Flame className="h-3 w-3 text-warning" />
                      {entry.streak}j
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Award className="h-3 w-3" />
                      {entry.badges}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-primary">
                    {getCategoryValue(entry).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{getCategoryLabel()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Current User Position */}
        {currentUser && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Votre position</p>
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary"
            )}>
              <div className="w-10 text-center">
                {getRankIcon(currentUser.rank)}
                {getRankChange(currentUser.rank, currentUser.previousRank)}
              </div>

              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarFallback>Vous</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium">Vous</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3" />
                    Nv.{currentUser.level}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Flame className="h-3 w-3 text-warning" />
                    {currentUser.streak}j
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Award className="h-3 w-3" />
                    {currentUser.badges}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-primary">
                  {getCategoryValue(currentUser).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{getCategoryLabel()}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
