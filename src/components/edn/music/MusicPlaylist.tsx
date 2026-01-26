import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Music, Clock, Heart, ListMusic, Volume2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

interface MusicTrack {
  id: string;
  item_code: string;
  title: string;
  audio_url?: string;
  duration?: number;
  listened_at?: string;
  is_favorite?: boolean;
}

interface MusicPreferences {
  favorites: string[];
  history: string[];
  shuffle_enabled: boolean;
  repeat_mode: 'none' | 'one' | 'all';
  volume: number;
}

interface MusicPlaylistProps {
  onPlayTrack?: (track: MusicTrack) => void;
}

export const MusicPlaylist: React.FC<MusicPlaylistProps> = ({ onPlayTrack }) => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'history'>('all');
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  // Load user preferences from Supabase
  const loadUserPreferences = useCallback(async (musicTracks: MusicTrack[]) => {
    if (!user) {
      // Fallback to localStorage for non-authenticated users
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
      return;
    }

    try {
      const { data } = await supabase
        .from('user_music_preferences' as any)
        .select('favorites, history, shuffle_enabled, repeat_mode, volume')
        .eq('user_id', user.id)
        .single();

      if (data) {
        const prefs = data as unknown as MusicPreferences;
        setFavorites(new Set(prefs.favorites || []));
        setShuffleEnabled(prefs.shuffle_enabled || false);
        setRepeatMode(prefs.repeat_mode || 'none');
        
        const historyItems = prefs.history || [];
        const historyTracks = musicTracks.filter(t => historyItems.includes(t.item_code));
        setHistory(historyTracks.slice(0, 20));
      }
    } catch {
      // First time user, no preferences yet
    }
  }, [user]);

  // Save preferences to Supabase
  const savePreferences = useCallback(async (
    newFavorites?: Set<string>,
    newHistory?: string[],
    newShuffle?: boolean,
    newRepeat?: 'none' | 'one' | 'all'
  ) => {
    const favoritesToSave = newFavorites || favorites;
    const historyToSave = newHistory || history.map(t => t.item_code);
    const shuffleToSave = newShuffle !== undefined ? newShuffle : shuffleEnabled;
    const repeatToSave = newRepeat !== undefined ? newRepeat : repeatMode;

    if (!user) {
      // Fallback to localStorage
      localStorage.setItem('music-favorites', JSON.stringify([...favoritesToSave]));
      localStorage.setItem('music-history', JSON.stringify(historyToSave));
      return;
    }

    try {
      await supabase
        .from('user_music_preferences' as any)
        .upsert({
          user_id: user.id,
          favorites: [...favoritesToSave],
          history: historyToSave,
          shuffle_enabled: shuffleToSave,
          repeat_mode: repeatToSave,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch {
      // Silent error handling
    }
  }, [user, favorites, history, shuffleEnabled, repeatMode]);

  const loadMusicData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: itemsData } = await supabase
        .from('edn_items_complete')
        .select('id, item_code, title, paroles_musicales')
        .not('paroles_musicales', 'is', null)
        .order('item_code');

      const musicTracks = (itemsData || [])
        .filter(item => item.paroles_musicales && item.paroles_musicales.length > 0)
        .map((item, index) => ({
          id: item.id,
          item_code: item.item_code,
          title: item.title,
          // Durée déterministe basée sur la longueur des paroles
          duration: 60 + ((item.paroles_musicales?.length || 0) * 3) + (index % 60),
        }));

      setTracks(musicTracks);
      await loadUserPreferences(musicTracks);

    } catch {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  }, [loadUserPreferences]);

  useEffect(() => {
    loadMusicData();
  }, [loadMusicData]);

  const toggleFavorite = useCallback((itemCode: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemCode)) {
      newFavorites.delete(itemCode);
    } else {
      newFavorites.add(itemCode);
    }
    setFavorites(newFavorites);
    savePreferences(newFavorites);
  }, [favorites, savePreferences]);

  const addToHistory = useCallback((track: MusicTrack) => {
    let historyItems = history.map(t => t.item_code);
    historyItems = historyItems.filter(code => code !== track.item_code);
    historyItems.unshift(track.item_code);
    historyItems = historyItems.slice(0, 50);
    
    const newHistoryTracks = tracks.filter(t => historyItems.includes(t.item_code)).slice(0, 20);
    setHistory(newHistoryTracks);
    savePreferences(undefined, historyItems);
  }, [history, tracks, savePreferences]);

  const playTrack = useCallback((track: MusicTrack) => {
    const displayList = activeTab === 'favorites' 
      ? tracks.filter(t => favorites.has(t.item_code))
      : activeTab === 'history' 
        ? history 
        : tracks;
    
    const index = displayList.findIndex(t => t.id === track.id);
    setCurrentIndex(index);
    setCurrentTrack(track);
    setIsPlaying(true);
    addToHistory(track);
    onPlayTrack?.(track);
  }, [activeTab, tracks, favorites, history, addToHistory, onPlayTrack]);

  // Skip to previous track
  const skipPrevious = useCallback(() => {
    const displayList = activeTab === 'favorites' 
      ? tracks.filter(t => favorites.has(t.item_code))
      : activeTab === 'history' 
        ? history 
        : tracks;
    
    if (displayList.length === 0) return;

    let newIndex: number;
    if (shuffleEnabled) {
      // Deterministic shuffle: step backward with offset
      newIndex = (currentIndex - 3 + displayList.length) % displayList.length;
    } else if (currentIndex <= 0) {
      newIndex = repeatMode === 'all' ? displayList.length - 1 : 0;
    } else {
      newIndex = currentIndex - 1;
    }

    const newTrack = displayList[newIndex];
    if (newTrack) {
      setCurrentIndex(newIndex);
      setCurrentTrack(newTrack);
      addToHistory(newTrack);
      onPlayTrack?.(newTrack);
    }
  }, [activeTab, tracks, favorites, history, currentIndex, shuffleEnabled, repeatMode, addToHistory, onPlayTrack]);

  // Skip to next track
  const skipNext = useCallback(() => {
    const displayList = activeTab === 'favorites' 
      ? tracks.filter(t => favorites.has(t.item_code))
      : activeTab === 'history' 
        ? history 
        : tracks;
    
    if (displayList.length === 0) return;

    let newIndex: number;
    if (shuffleEnabled) {
      // Deterministic shuffle: step forward with offset
      newIndex = (currentIndex + 3) % displayList.length;
    } else if (currentIndex >= displayList.length - 1) {
      newIndex = repeatMode === 'all' ? 0 : displayList.length - 1;
    } else {
      newIndex = currentIndex + 1;
    }

    const newTrack = displayList[newIndex];
    if (newTrack) {
      setCurrentIndex(newIndex);
      setCurrentTrack(newTrack);
      addToHistory(newTrack);
      onPlayTrack?.(newTrack);
    }
  }, [activeTab, tracks, favorites, history, currentIndex, shuffleEnabled, repeatMode, addToHistory, onPlayTrack]);

  // Toggle shuffle mode
  const toggleShuffle = useCallback(() => {
    const newShuffle = !shuffleEnabled;
    setShuffleEnabled(newShuffle);
    savePreferences(undefined, undefined, newShuffle);
  }, [shuffleEnabled, savePreferences]);

  // Cycle repeat mode
  const cycleRepeat = useCallback(() => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const newMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(newMode);
    savePreferences(undefined, undefined, undefined, newMode);
  }, [repeatMode, savePreferences]);

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
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${shuffleEnabled ? 'text-primary' : ''}`}
                  onClick={toggleShuffle}
                  title="Mode aléatoire"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={skipPrevious}
                  title="Piste précédente"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  className="h-10 w-10 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={skipNext}
                  title="Piste suivante"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${repeatMode !== 'none' ? 'text-primary' : ''}`}
                  onClick={cycleRepeat}
                  title={`Répéter: ${repeatMode === 'none' ? 'Désactivé' : repeatMode === 'one' ? 'Une piste' : 'Tout'}`}
                >
                  <Repeat className="h-4 w-4" />
                  {repeatMode === 'one' && <span className="absolute text-[8px] font-bold">1</span>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playlist Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
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