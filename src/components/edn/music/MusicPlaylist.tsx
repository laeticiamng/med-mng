import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Music, Clock, Heart, ListMusic, Volume2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MusicTrack {
  id: string;
  item_code: string;
  title: string;
  audio_url?: string;
  duration?: number;
  listened_at?: string;
  is_favorite?: boolean;
}

interface MusicPlaylistProps {
  onPlayTrack?: (track: MusicTrack) => void;
}

export const MusicPlaylist: React.FC<MusicPlaylistProps> = ({ onPlayTrack }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'history'>('all');

  const loadMusicData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Load items with music
      const { data: itemsData } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, paroles_musicales')
        .not('paroles_musicales', 'is', null)
        .order('item_code');

      const musicTracks = (itemsData || [])
        .filter(item => item.paroles_musicales && item.paroles_musicales.length > 0)
        .map(item => ({
          id: item.id,
          item_code: item.item_code,
          title: item.title,
          duration: Math.floor(Math.random() * 180) + 60, // Placeholder duration
        }));

      setTracks(musicTracks);

      // Load user favorites and history from localStorage (could be DB in future)
      const savedFavorites = localStorage.getItem('music-favorites');
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }

      const savedHistory = localStorage.getItem('music-history');
      if (savedHistory) {
        const historyItems = JSON.parse(savedHistory) as string[];
        const historyTracks = musicTracks.filter(t => historyItems.includes(t.item_code));
        setHistory(historyTracks.slice(0, 20));
      }

    } catch {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMusicData();
  }, [loadMusicData]);

  const toggleFavorite = (itemCode: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemCode)) {
      newFavorites.delete(itemCode);
    } else {
      newFavorites.add(itemCode);
    }
    setFavorites(newFavorites);
    localStorage.setItem('music-favorites', JSON.stringify([...newFavorites]));
  };

  const addToHistory = (track: MusicTrack) => {
    const existingHistory = localStorage.getItem('music-history');
    let historyItems: string[] = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Remove if already exists and add to front
    historyItems = historyItems.filter(code => code !== track.item_code);
    historyItems.unshift(track.item_code);
    historyItems = historyItems.slice(0, 50); // Keep last 50
    
    localStorage.setItem('music-history', JSON.stringify(historyItems));
    setHistory(tracks.filter(t => historyItems.includes(t.item_code)).slice(0, 20));
  };

  const playTrack = (track: MusicTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    addToHistory(track);
    onPlayTrack?.(track);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTracks = activeTab === 'favorites' 
    ? tracks.filter(t => favorites.has(t.item_code))
    : activeTab === 'history' 
      ? history 
      : tracks;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de la playlist...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Player Controls */}
      {currentTrack && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{currentTrack.item_code}</p>
                <p className="text-sm text-muted-foreground truncate">{currentTrack.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  className="h-10 w-10 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playlist Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListMusic className="h-5 w-5" />
              Playlist Mnémotechnique
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveTab('all')}
              >
                Tout ({tracks.length})
              </Button>
              <Button 
                variant={activeTab === 'favorites' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveTab('favorites')}
              >
                <Heart className="h-3 w-3 mr-1" />
                Favoris ({favorites.size})
              </Button>
              <Button 
                variant={activeTab === 'history' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveTab('history')}
              >
                <Clock className="h-3 w-3 mr-1" />
                Historique
              </Button>
            </div>
          </div>
          <CardDescription>
            {tracks.length} titres disponibles pour mémoriser les items EDN
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {displayTracks.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                  {activeTab === 'favorites' ? (
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  ) : activeTab === 'history' ? (
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <Music className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {activeTab === 'favorites' && "Aucun favori"}
                    {activeTab === 'history' && "Aucun historique"}
                    {activeTab === 'all' && "Aucune musique disponible"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === 'favorites' && "Cliquez sur ❤️ pour ajouter des titres à vos favoris"}
                    {activeTab === 'history' && "Écoutez des musiques pour voir votre historique ici"}
                    {activeTab === 'all' && "Les musiques mnémotechniques n'ont pas encore été générées pour les items"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {displayTracks.map((track, idx) => (
                  <div 
                    key={track.id}
                    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group
                      ${currentTrack?.id === track.id ? 'bg-primary/10' : ''}`}
                    onClick={() => playTrack(track)}
                  >
                    <div className="w-8 text-center text-muted-foreground text-sm">
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Volume2 className="h-4 w-4 mx-auto text-primary animate-pulse" />
                      ) : (
                        <span className="group-hover:hidden">{idx + 1}</span>
                      )}
                      <Play className="h-4 w-4 mx-auto hidden group-hover:block" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.item_code}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.title}</p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.item_code);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${favorites.has(track.item_code) ? 'fill-destructive text-destructive' : ''}`} />
                    </Button>
                    
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {track.duration ? formatDuration(track.duration) : '--:--'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
