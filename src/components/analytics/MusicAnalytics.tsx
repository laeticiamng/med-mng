import { useAuth } from '@/components/med-mng/AuthProvider';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    Activity,
    BarChart3,
    Clock,
    Flame,
    Heart,
    Music,
    Star,
    Trophy,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ListeningStats {
  totalListenTime: number;
  songsPlayed: number;
  favoriteSongs: string[];
  mostPlayedGenre: string;
  weeklyStats: Array<{ day: string; minutes: number }>;
  monthlyStats: Array<{ month: string; songs: number }>;
  topSongs: Array<{ id: string; title: string; playCount: number; totalTime: number }>;
  playlistsCreated: number;
  averageSessionLength: number;
  streakDays: number;
}

// Use the actual database types
type UserAnalytics = {
  user_id: string;
  song_id: string;
  play_count: number;
  total_listen_time: number;
  last_played: string;
  created_at: string;
  med_mng_songs?: {
    title: string;
  };
};

export const MusicAnalytics: React.FC = () => {
  const [stats, setStats] = useState<ListeningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { user } = useAuth();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats } = useGamification();

  useEffect(() => {
    if (user) {
      loadAnalytics();
      loadStats(user.id);
      logActivity({ activity_type: 'music_generation', metadata: { action: 'view_music_analytics' } });
    }
  }, [user, timeRange, loadStats, logActivity]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Récupérer les données d'écoute utilisateur sans la relation
      const { data: analyticsData, error } = await supabase
        .from('med_mng_user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('last_played', { ascending: false });

      if (error) throw error;

      const songIds = analyticsData?.map(item => item.song_id) || [];
      const { data: songsData } = await supabase
        .from('med_mng_songs')
        .select('id, title')
        .in('id', songIds);

      const analyticsWithSongs = analyticsData?.map(item => ({
        ...item,
        song_title: songsData?.find(song => song.id === item.song_id)?.title || 'Titre inconnu'
      })) || [];

      const { data: playlistsData, error: playlistsError } = await supabase
        .from('med_mng_playlists')
        .select('id, created_at')
        .eq('user_id', user.id);

      if (playlistsError) throw playlistsError;

      // Calculer les statistiques
      const calculatedStats = calculateStats(analyticsWithSongs, playlistsData || []);
      setStats(calculatedStats);

    } catch {
      // Erreur silencieuse
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (analytics: UserAnalytics[], playlists: any[]): ListeningStats => {
    const now = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Filtrer par période
    const filteredAnalytics = analytics.filter(item => 
      new Date(item.last_played) >= startDate
    );

    // Calculer statistiques générales
    const totalListenTime = filteredAnalytics.reduce((sum, item) => sum + item.total_listen_time, 0);
    const songsPlayed = filteredAnalytics.length;
    const totalPlayCount = filteredAnalytics.reduce((sum, item) => sum + item.play_count, 0);
    const averageSessionLength = totalPlayCount > 0 ? totalListenTime / totalPlayCount : 0;

    // Top chansons
    const topSongs = filteredAnalytics
      .sort((a, b) => b.play_count - a.play_count)
      .slice(0, 5)
      .map(item => ({
        id: item.song_id,
        title: (item as any).song_title || 'Titre inconnu',
        playCount: item.play_count,
        totalTime: item.total_listen_time
      }));

    // Statistiques hebdomadaires
    const weeklyStats = Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      day.setDate(now.getDate() - i);
      const dayStr = day.toLocaleDateString('fr-FR', { weekday: 'short' });
      
      const dayMinutes = filteredAnalytics
        .filter(item => {
          const itemDate = new Date(item.last_played);
          return itemDate.toDateString() === day.toDateString();
        })
        .reduce((sum, item) => sum + item.total_listen_time / 60, 0);

      return { day: dayStr, minutes: Math.round(dayMinutes) };
    }).reverse();

    // Statistiques mensuelles
    const monthlyStats = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(now.getMonth() - i);
      const monthStr = month.toLocaleDateString('fr-FR', { month: 'short' });
      
      const monthSongs = analytics
        .filter(item => {
          const itemDate = new Date(item.last_played);
          return itemDate.getMonth() === month.getMonth() && 
                 itemDate.getFullYear() === month.getFullYear();
        }).length;

      return { month: monthStr, songs: monthSongs };
    }).reverse();

    // Calcul streak (jours consécutifs d'écoute)
    let streakDays = 0;
    const checkDate = new Date();
    while (streakDays < 30) { // Max 30 jours
      const hasListeningThisDay = analytics.some(item => {
        const itemDate = new Date(item.last_played);
        return itemDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasListeningThisDay) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalListenTime: Math.round(totalListenTime / 60), // en minutes
      songsPlayed,
      favoriteSongs: topSongs.slice(0, 3).map(s => s.title),
      mostPlayedGenre: 'Médical', // À implémenter selon les tags
      weeklyStats,
      monthlyStats,
      topSongs,
      playlistsCreated: playlists.length,
      averageSessionLength: Math.round(averageSessionLength / 60), // en minutes
      streakDays
    };
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-12 text-center">
        <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          <TranslatedText text="Pas encore de données" />
        </h3>
        <p className="text-muted-foreground">
          <TranslatedText text="Commencez à écouter de la musique pour voir vos statistiques" />
        </p>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Gamification Stats Banner */}
      {gamificationStats && (
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-warning/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-warning" />
                  <span className="text-lg font-bold text-warning">{gamificationStats.currentStreak}</span>
                  <span className="text-sm text-muted-foreground">jours</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold text-primary">Niv. {gamificationStats.level}</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  <span className="text-lg font-bold text-success">{gamificationStats.badges?.length || 0}</span>
                  <span className="text-sm text-muted-foreground">badges</span>
                </div>
              </div>
              <Badge variant="outline">{gamificationStats.totalPoints} XP</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            <TranslatedText text="Vos Statistiques d'Écoute" />
          </h2>
          <p className="text-muted-foreground">
            <TranslatedText text="Analysez vos habitudes musicales et votre progression" />
          </p>
        </div>
        
        <Tabs value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <TabsList>
            <TabsTrigger value="week">
              <TranslatedText text="7j" />
            </TabsTrigger>
            <TabsTrigger value="month">
              <TranslatedText text="30j" />
            </TabsTrigger>
            <TabsTrigger value="year">
              <TranslatedText text="1an" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <TranslatedText text="Temps d'écoute" />
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatDuration(stats.totalListenTime)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <TranslatedText text="Chansons écoutées" />
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.songsPlayed}
                </p>
              </div>
              <Music className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <TranslatedText text="Playlists créées" />
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.playlistsCreated}
                </p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <TranslatedText text="Série d'écoute" />
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.streakDays}j
                </p>
              </div>
              <Activity className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité hebdomadaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <TranslatedText text="Activité de la semaine" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.weeklyStats.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{day.day}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (day.minutes / Math.max(...stats.weeklyStats.map(d => d.minutes))) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground min-w-[3rem]">
                      {day.minutes}min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top chansons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <TranslatedText text="Top chansons" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topSongs.map((song, index) => (
                <div key={song.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-foreground text-sm truncate max-w-40">
                        {song.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {song.playCount} écoute{song.playCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(Math.round(song.totalTime / 60))}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges de progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <TranslatedText text="Badges & Réalisations" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Badge temps d'écoute */}
            <div className={`p-4 rounded-lg border-2 text-center ${
              stats.totalListenTime >= 60 ? 'border-warning bg-warning/10' : 'border-border bg-muted/30'
            }`}>
              <Clock className={`h-8 w-8 mx-auto mb-2 ${
                stats.totalListenTime >= 60 ? 'text-warning' : 'text-muted-foreground'
              }`} />
              <p className="text-sm font-medium">
                <TranslatedText text="Mélomane" />
              </p>
              <p className="text-xs text-muted-foreground">1h d'écoute</p>
            </div>

            {/* Badge playlists */}
            <div className={`p-4 rounded-lg border-2 text-center ${
              stats.playlistsCreated >= 3 ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'
            }`}>
              <Users className={`h-8 w-8 mx-auto mb-2 ${
                stats.playlistsCreated >= 3 ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <p className="text-sm font-medium">
                <TranslatedText text="Organisateur" />
              </p>
              <p className="text-xs text-muted-foreground">3 playlists</p>
            </div>

            {/* Badge série */}
            <div className={`p-4 rounded-lg border-2 text-center ${
              stats.streakDays >= 7 ? 'border-success bg-success/10' : 'border-border bg-muted/30'
            }`}>
              <Activity className={`h-8 w-8 mx-auto mb-2 ${
                stats.streakDays >= 7 ? 'text-success' : 'text-muted-foreground'
              }`} />
              <p className="text-sm font-medium">
                <TranslatedText text="Assidu" />
              </p>
              <p className="text-xs text-muted-foreground">7 jours consécutifs</p>
            </div>

            {/* Badge diversité */}
            <div className={`p-4 rounded-lg border-2 text-center ${
              stats.songsPlayed >= 20 ? 'border-accent bg-accent/10' : 'border-border bg-muted/30'
            }`}>
              <Music className={`h-8 w-8 mx-auto mb-2 ${
                stats.songsPlayed >= 20 ? 'text-accent' : 'text-muted-foreground'
              }`} />
              <p className="text-sm font-medium">
                <TranslatedText text="Explorateur" />
              </p>
              <p className="text-xs text-muted-foreground">20 chansons</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};