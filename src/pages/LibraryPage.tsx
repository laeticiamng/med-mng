import { useState } from 'react';
import { Music, Search, Play, Heart, MoreHorizontal, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { usePlayer } from '@/hooks/usePlayer';

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    tracks, 
    loading, 
    toggleFavorite, 
    removeFromLibrary, 
    totalTracks 
  } = useMusicLibrary();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  // Filtrer les pistes selon la recherche
  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rang_a': return 'Rang A';
      case 'rang_b': return 'Rang B';
      case 'mix': return 'Mix A+B';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rang_a': return 'bg-primary/10 text-primary';
      case 'rang_b': return 'bg-secondary/10 text-secondary';
      case 'mix': return 'bg-accent/10 text-accent';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <PlayerProvider>
        <div className="min-h-screen bg-background pb-24">
          <div className="container mx-auto p-6">
            <div className="space-y-6">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-12 w-full" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-64" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <MiniPlayer />
        </div>
      </PlayerProvider>
    );
  }

  return (
    <PlayerProvider>
      <div className="min-h-screen bg-background pb-24">
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Music className="w-6 h-6 text-primary-foreground" />
                  </div>
                  Bibliothèque Musicale
                </h1>
                <p className="text-muted-foreground mt-2">
                  {totalTracks} piste{totalTracks > 1 ? 's' : ''} disponible{totalTracks > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Recherche */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une piste ou un item EDN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Liste des pistes */}
            {filteredTracks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm ? 'Aucune piste trouvée' : 'Bibliothèque vide'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? 'Aucune piste ne correspond à votre recherche'
                      : 'Générez votre première musique pour commencer !'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTracks.map((track) => (
                  <Card key={track.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in hover-scale">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Bouton de lecture */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playTrack(track)}
                          className="h-12 w-12 rounded-full hover:bg-primary hover:text-primary-foreground group-hover:scale-110 transition-all duration-200 animate-fade-in"
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                              <div className="bg-current animate-pulse"></div>
                              <div className="bg-current animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                              <div className="bg-current animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="bg-current animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                          ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                          )}
                        </Button>

                        {/* Informations de la piste */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg truncate">{track.title}</h3>
                            <Badge className={getTypeColor(track.type)}>
                              {getTypeLabel(track.type)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {track.item_code} • {new Date(track.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(track.id)}
                            className="h-8 w-8"
                          >
                            <Heart className={`h-4 w-4 ${track.is_favorite ? 'fill-current text-red-500' : ''}`} />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => playTrack(track)}>
                                <Play className="h-4 w-4 mr-2" />
                                Lire
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleFavorite(track.id)}>
                                <Heart className="h-4 w-4 mr-2" />
                                {track.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => removeFromLibrary(track.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mini Player fixe */}
        <MiniPlayer />
      </div>
    </PlayerProvider>
  );
}