import { useState } from 'react';
import { Music, Search, Play, Heart, MoreHorizontal, Trash2, ArrowLeft, Clock, Pause } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { useResponsiveGrid, useResponsiveSpacing } from '@/hooks/useBreakpoints';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

export default function LibraryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const gridConfig = useResponsiveGrid();
  const spacing = useResponsiveSpacing();
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rang_a': return 'Rang A';
      case 'rang_b': return 'Rang B';
      case 'mix': return 'Mix A+B';
      default: return type;
    }
  };

  const getGradientForTrack = (index: number) => {
    const gradients = [
      'from-purple-600 to-pink-600',
      'from-red-500 to-pink-500', 
      'from-blue-500 to-cyan-500',
      'from-indigo-500 to-purple-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500'
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <PlayerProvider>
        <ConsistentBackground variant="primary">
          <div className={`relative z-10 container mx-auto ${spacing.container}`}>
            <div className="space-y-6">
              <Skeleton className="h-10 w-64 bg-muted/20" />
              <Skeleton className="h-12 w-full bg-muted/20" />
              <div className={`grid ${gridConfig.cards} ${gridConfig.gap}`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-lg bg-muted/20" />
                    <Skeleton className="h-4 w-32 bg-muted/20" />
                    <Skeleton className="h-3 w-24 bg-muted/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <MiniPlayer />
        </ConsistentBackground>
      </PlayerProvider>
    );
  }

  return (
    <PlayerProvider>
      <ConsistentBackground variant="primary">
        <PageHeader
          title="Ma Bibliothèque"
          subtitle={`${totalTracks} création${totalTracks > 1 ? 's' : ''} musicale${totalTracks > 1 ? 's' : ''} éducative${totalTracks > 1 ? 's' : ''}`}
          icon={Music}
          showBackButton
          backTo="/"
        />
        
        <div className="relative z-10">
          <div className={`container mx-auto ${spacing.container}`}>
            {/* Barre de recherche */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Rechercher par titre, item ou style..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-background/10 backdrop-blur-sm border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Liste des tracks */}
            {filteredTracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  {searchTerm ? 'Aucune musique trouvée' : 'Bibliothèque vide'}
                </p>
                <p className="text-muted-foreground/60 text-sm mb-6">
                  {searchTerm 
                    ? 'Essayez avec d\'autres termes de recherche'
                    : 'Générez votre première musique pour commencer !'}
                </p>
                <Button 
                  onClick={() => navigate('/generator')}
                  className="bg-primary hover:bg-primary/90 px-8 py-3 text-primary-foreground font-medium rounded-full shadow-lg"
                  size="lg"
                >
                  Créer ma première musique
                </Button>
              </div>
            ) : (
              <div className={`grid ${gridConfig.cards} ${gridConfig.gap}`}>
                {filteredTracks.map((track, index) => (
                  <Card key={track.id} className="bg-card/20 backdrop-blur-sm border border-border hover:bg-card/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
                    <CardContent className="p-6">
                      {/* Image et contrôles */}
                      <div className="relative aspect-square mb-4">
                        <div className={`w-full h-full bg-gradient-to-br ${getGradientForTrack(index)} rounded-xl flex items-center justify-center text-6xl text-white shadow-lg relative overflow-hidden`}>
                          <Music className="h-20 w-20 opacity-80" />
                          
                          {/* Overlay de lecture */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                              <Button
                                size="lg"
                                onClick={() => playTrack(track)}
                                className="rounded-full w-16 h-16 bg-primary/20 backdrop-blur-sm border border-primary/30 hover:bg-primary/30 text-primary-foreground shadow-xl"
                              >
                                {currentTrack?.id === track.id && isPlaying ? (
                                  <Pause className="h-8 w-8" />
                                ) : (
                                  <Play className="h-8 w-8 ml-1" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Badge du type */}
                        <Badge className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm text-foreground border-border">
                          {getTypeLabel((track as any).generation_type || 'default')}
                        </Badge>
                        
                        {/* Actions rapides */}
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavorite(track.id)}
                            className="rounded-full w-8 h-8 bg-background/30 backdrop-blur-sm hover:bg-background/50 text-foreground border border-border"
                          >
                            <Heart className={`h-4 w-4 ${track.is_favorite ? 'fill-current text-pink-400' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      {/* Informations de la track */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {track.title}
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-muted-foreground text-sm">
                            {track.item_code}
                          </p>
                          <p className="text-muted-foreground text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(track.duration)}
                          </p>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {formatNumber((track as any).play_count || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {formatNumber((track as any).likes || 0)}
                            </span>
                          </div>
                          
                          {/* Menu actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border border-border">
                              <DropdownMenuItem 
                                onClick={() => removeFromLibrary(track.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
        <MiniPlayer />
      </ConsistentBackground>
    </PlayerProvider>
  );
}