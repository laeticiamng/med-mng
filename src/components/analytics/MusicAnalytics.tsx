import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  Music, 
  Heart, 
  Play, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Download
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

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

interface UserAnalytics {
  user_id: string;
  song_id: string;
  play_count: number;
  total_listen_time: number;
  last_played: string;
  created_at: string;
  song_title?: string;
}

export const MusicAnalytics: React.FC = () => {
  const [stats, setStats] = useState<ListeningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Récupérer les données d'écoute utilisateur
      const { data: analyticsData, error } = await supabase
        .from('med_mng_user_analytics')
        .select(`
          *,
          med_mng_songs(title)
        `)
        .eq('user_id', user.id)
        .order('last_played', { ascending: false });

      if (error) throw error;

      // Récupérer les statistiques de playlists
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('med_mng_playlists')
        .select('id, created_at')
        .eq('user_id', user.id);

      if (playlistsError) throw playlistsError;

      // Calculer les statistiques
      const calculatedStats = calculateStats(analyticsData || [], playlistsData || []);
      setStats(calculatedStats);

    } catch (error) {
      console.error('Erreur chargement analytics:', error);
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
        title: (item as any).med_mng_songs?.title || 'Titre inconnu',
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
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-12 text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          <TranslatedText text="Pas encore de données" />
        </h3>
        <p className="text-gray-600">
          <TranslatedText text="Commencez à écouter de la musique pour voir vos statistiques" />
        </p>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            <TranslatedText text="Vos Statistiques d'Écoute" />
          </h2>
          <p className="text-gray-600">
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
                <p className="text-sm font-medium text-gray-600">
                  <TranslatedText text="Temps d'écoute" />
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(stats.totalListenTime)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <TranslatedText text="Chansons écoutées" />
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.songsPlayed}
                </p>
              </div>
              <Music className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <TranslatedText text="Playlists créées" />
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.playlistsCreated}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <TranslatedText text="Série d'écoute" />
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.streakDays}j
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
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
                  <span className="text-sm text-gray-600">{day.day}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (day.minutes / Math.max(...stats.weeklyStats.map(d => d.minutes))) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
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
                      <p className="font-medium text-gray-900 text-sm truncate max-w-40">
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {song.playCount} écoute{song.playCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
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
              stats.totalListenTime >= 60 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <Clock className={`h-8 w-8 mx-auto mb-2 ${
                stats.totalListenTime >= 60 ? 'text-yellow-600' : 'text-gray-400'
              }`} />
              <p className="text-sm font-medium">
                <TranslatedText text="Mélomane" />
              </p>
              <p className="text-xs text-gray-600">1h d'écoute</p>
            </div>

            {/* Badge playlists */}
            <div className={`p-4 rounded-lg border-2 text-center ${
              stats.playlistsCreated >= 3 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <Users className={`h-8 w-8 mx-auto mb-2 ${
                stats.playlistsCreated >= 3 ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <p className="text-sm font-medium">
                <TranslatedText text="Organisateur" />
              </p>
              <p className="text-xs text-gray-600">3 playlists</p>
            </div>

            {/* Badge série */}
            <div className={`p-4 rounded-lg border-2 text-center ${
              stats.streakDays >= 7 ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <Activity className={`h-8 w-8 mx-auto mb-2 ${
                stats.streakDays >= 7 ? 'text-green-600' : 'text-gray-400'
              }`} />
              <p className="text-sm font-medium">
                <TranslatedText text="Assidu" />
              </p>
              <p className="text-xs text-gray-600">7 jours consécutifs</p>
            </div>

            {/* Badge diversité */}
            <div className={`p-4 rounded-lg border-2 text-center ${
              stats.songsPlayed >= 20 ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <Music className={`h-8 w-8 mx-auto mb-2 ${
                stats.songsPlayed >= 20 ? 'text-purple-600' : 'text-gray-400'
              }`} />
              <p className="text-sm font-medium">
                <TranslatedText text="Explorateur" />
              </p>
              <p className="text-xs text-gray-600">20 chansons</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};