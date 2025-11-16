import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFavoritesAndHistory } from '@/hooks/useFavoritesAndHistory';
import { usePlaylists } from '@/hooks/usePlaylists';
import { usePlayer } from '@/hooks/usePlayer';
import { 
  Heart, 
  History, 
  Play, 
  Pause, 
  Plus, 
  Search,
  Music,
  Clock,
  Star,
  Filter,
  Shuffle,
  MoreVertical,
  Download,
  Share2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const SpotifyLikeLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'duration'>('recent');
  const [filterTab, setFilterTab] = useState('all');
  
  const { 
    favorites, 
    history, 
    loading, 
    toggleFavorite, 
    isFavorite,
    getRecentlyPlayed,
    getTopPlayed,
    clearHistory 
  } = useFavoritesAndHistory();
  
  const { playlists, createPlaylist } = usePlaylists();
  const { playTrack, isPlaying, currentTrack, pause, play } = usePlayer();

  const filteredFavorites = favorites.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentlyPlayed = getRecentlyPlayed(10);
  const topPlayed = getTopPlayed(10);

  const handlePlaySong = async (song: any) => {
    if (currentTrack?.id === song.song_id && isPlaying) {
      pause();
    } else {
      await playTrack({
        id: song.song_id,
        title: song.title,
        stream_url: `https://cdn1.suno.ai/${song.suno_audio_id}.mp3`,
        type: 'rang_a', // Utiliser un type valide temporairement
        item_code: 'IC-001', // Ajouter les champs manquants
        created_at: new Date().toISOString()
      });
    }
  };

  const SongItem = ({ song, showDate = false }: { song: any; showDate?: boolean }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group">
      <div className="flex items-center gap-3 flex-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handlePlaySong(song)}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {currentTrack?.id === song.song_id && isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{song.title}</p>
          {showDate && (
            <p className="text-sm text-muted-foreground">
              {new Date(song.listen_date || song.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => toggleFavorite(song.song_id)}
          className="h-8 w-8 p-0"
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite(song.song_id) ? 'fill-red-500 text-red-500' : ''}`} 
          />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter à une playlist
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche et filtres */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans votre bibliothèque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récent</SelectItem>
              <SelectItem value="alphabetical">Alphabétique</SelectItem>
              <SelectItem value="duration">Durée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Shuffle className="h-4 w-4 mr-2" />
            Lecture aléatoire
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{favorites.length}</p>
                <p className="text-sm text-muted-foreground">Favoris</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{playlists.length}</p>
                <p className="text-sm text-muted-foreground">Playlists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{history.length}</p>
                <p className="text-sm text-muted-foreground">Écoutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(history.reduce((acc, h) => acc + h.listen_duration_seconds, 0) / 60)}m
                </p>
                <p className="text-sm text-muted-foreground">Temps total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs value={filterTab} onValueChange={setFilterTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tout</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Récemment écoutées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Récemment écoutées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentlyPlayed.slice(0, 5).map(song => (
                  <SongItem key={song.id} song={song} showDate />
                ))}
              </CardContent>
            </Card>

            {/* Top favoris */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Plus écoutées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topPlayed.slice(0, 5).map((song, index) => (
                  <div key={song.song_id} className="flex items-center justify-between p-2 rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{song.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{song.play_count} écoutes</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Mes favoris ({filteredFavorites.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredFavorites.length > 0 ? (
                filteredFavorites.map(song => (
                  <SongItem key={song.id} song={song} showDate />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune chanson favorite trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique d'écoute ({filteredHistory.length})
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearHistory}
                disabled={history.length === 0}
              >
                Effacer l'historique
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredHistory.length > 0 ? (
                filteredHistory.map(entry => (
                  <SongItem key={entry.id} song={entry} showDate />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun historique d'écoute</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 - Plus écoutées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPlayed.map((song, index) => (
                    <div key={song.song_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={index < 3 ? "default" : "outline"} 
                          className="w-6 h-6 p-0 flex items-center justify-center text-xs"
                        >
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{song.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{song.play_count} écoutes</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques d'écoute</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-500">
                      {Math.round(history.reduce((acc, h) => acc + h.completion_percentage, 0) / history.length || 0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Taux de completion moyen</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-500">
                      {Math.round(history.reduce((acc, h) => acc + h.listen_duration_seconds, 0) / 3600)}h
                    </p>
                    <p className="text-sm text-muted-foreground">Temps d'écoute total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};