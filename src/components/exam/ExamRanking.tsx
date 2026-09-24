import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Medal, Trophy, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RankingEntry {
  user_id: string;
  display_name: string;
  total_exams: number;
  average_score: number;
  best_score: number;
  rank_position: number;
}

interface UserRanking {
  position: number;
  totalUsers: number;
  percentile: number;
}

interface ExamRankingProps {
  userId: string;
}

export const ExamRanking: React.FC<ExamRankingProps> = ({ userId }) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [userRanking, setUserRanking] = useState<UserRanking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        // Fetch top 20 rankings
        const { data, error } = await (supabase as any)
          .from('exam_rankings')
          .select('*')
          .limit(20);

        if (error) {
          console.warn('Rankings not available:', error.message);
          setLoading(false);
          return;
        }

        if (data) {
          setRankings(data as RankingEntry[]);

          // Find user's position
          const userEntry = (data as RankingEntry[]).find((r) => r.user_id === userId);
          if (userEntry) {
            setUserRanking({
              position: (userEntry as any).rank_position,
              totalUsers: data.length,
              percentile: Math.round(((data.length - ((userEntry as any).rank_position || 0) + 1) / data.length) * 100),
            });
          }
        }
      } catch (err) {
        console.error('Error fetching rankings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [userId]);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1: return <Medal className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{position}</span>;
    }
  };

  const anonymizeName = (name: string, index: number) => {
    if (!name || name === 'Utilisateur anonyme') {
      return `Étudiant #${1000 + index}`;
    }
    // Show first letter + asterisks
    return `${name.charAt(0)}${'*'.repeat(Math.min(name.length - 1, 6))}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* User's position card */}
      {userRanking && (
        <Card className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">#{userRanking.position}</p>
                  <p className="text-sm text-muted-foreground">Votre classement</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{userRanking.totalUsers} participants</span>
                </div>
                <Badge variant="outline" className="mt-1">
                  Top {100 - userRanking.percentile}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Classement Anonymisé
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Pas encore de classement. Passez un examen pour apparaître !
            </p>
          ) : (
            <div className="space-y-2">
              {rankings.slice(0, 15).map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    entry.user_id === userId
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getMedalIcon(entry.rank_position)}
                    <div>
                      <p className="text-sm font-medium">
                        {entry.user_id === userId ? 'Vous' : anonymizeName(entry.display_name, index)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.total_exams} examen{entry.total_exams > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={entry.average_score >= 70 ? 'default' : entry.average_score >= 50 ? 'secondary' : 'destructive'}>
                      {entry.average_score}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Best: {entry.best_score}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
