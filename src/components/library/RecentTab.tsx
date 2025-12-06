import { useState, useEffect } from 'react';
import { Clock, Play, Calendar, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { usePlayer } from '@/hooks/usePlayer';

interface RecentTrack {
  id: string;
  title: string;
  item_code?: string;
  audio_url?: string;
  rang?: string;
  created_at: string;
  updated_at?: string;
}

export const RecentTab = () => {
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    fetchRecentTracks();
  }, []);

  const fetchRecentTracks = async () => {
    try {
      setLoading(true);
      
      // Récupérer les dernières musiques générées (30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('user_generated_music')
        .select('id, title, item_code, audio_url, rang, created_at, updated_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erreur récents:', error);
        setRecentTracks([]);
        return;
      }

      setRecentTracks(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setRecentTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (track: RecentTrack) => {
    playTrack({
      id: track.id,
      title: track.title,
      item_code: track.item_code || 'N/A',
      type: track.rang === 'A' ? 'rang_a' : track.rang === 'B' ? 'rang_b' : 'mix',
      stream_url: track.audio_url,
      created_at: track.created_at
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
    return date.toLocaleDateString();
  };

  const groupByDate = (tracks: RecentTrack[]) => {
    const groups: Record<string, RecentTrack[]> = {};
    
    tracks.forEach(track => {
      const dateKey = formatRelativeDate(track.created_at);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(track);
    });
    
    return groups;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Écoutes Récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (recentTracks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Écoutes Récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Clock className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium mb-2">Aucune activité récente</p>
          <p className="text-muted-foreground">
            Vos musiques générées récemment apparaîtront ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedTracks = groupByDate(recentTracks);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Écoutes Récentes
          <Badge variant="secondary" className="ml-2">
            {recentTracks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedTracks).map(([dateLabel, tracks]) => (
          <div key={dateLabel}>
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{dateLabel}</span>
            </div>
            
            <div className="space-y-2">
              {tracks.map(track => (
                <div 
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlay(track)}
                    className="h-10 w-10 rounded-full hover:bg-primary hover:text-primary-foreground"
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                        <div className="bg-current animate-pulse" />
                        <div className="bg-current animate-pulse" style={{ animationDelay: '0.1s' }} />
                        <div className="bg-current animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="bg-current animate-pulse" style={{ animationDelay: '0.3s' }} />
                      </div>
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{track.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{track.item_code || 'N/A'}</span>
                      {track.rang && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            Rang {track.rang}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {new Date(track.created_at).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
