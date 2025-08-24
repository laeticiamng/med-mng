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
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3),transparent_50%)]"></div>
          
          <div className={`relative z-10 container mx-auto ${spacing.container}`}>
            <div className="space-y-6">
              <Skeleton className="h-10 w-64 bg-white/10" />
              <Skeleton className="h-12 w-full bg-white/10" />
              <div className={`grid ${gridConfig.cards} ${gridConfig.gap}`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-lg bg-white/10" />
                    <Skeleton className="h-4 w-32 bg-white/10" />
                    <Skeleton className="h-3 w-24 bg-white/10" />
                  </div>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Aura de fond inspirée de Suno */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3),transparent_50%)]"></div>
        
        <div className="relative z-10">
          {/* Header - Optimisé pour tablettes */}
          <div className={`container mx-auto ${spacing.container}`}>
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                aria-label="Retourner à la page d'accueil"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour
              </button>
              <div className="text-white font-bold text-lg">🎵 Ma Bibliothèque</div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-4" id="main-content">
                Ma <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Bibliothèque</span>
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                {totalTracks} création{totalTracks > 1 ? 's' : ''} musicale{totalTracks > 1 ? 's' : ''} éducative{totalTracks > 1 ? 's' : ''}
              </p>
              
              {/* Barre de recherche style Suno */}
              <div className="relative max-w-md mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, item ou style..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Liste des tracks style Suno */}
            {filteredTracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  {searchTerm ? 'Aucune musique trouvée' : 'Bibliothèque vide'}
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  {searchTerm 
                    ? 'Essayez avec d\'autres termes de recherche'
                    : 'Générez votre première musique pour commencer !'}
                </p>
                <Button 
                  onClick={() => navigate('/generator')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-8 py-3 text-white font-medium rounded-full shadow-lg"
                  size="lg"
                >
                  Créer ma première musique
                </Button>
              </div>
            ) : (
              <div className={`grid ${gridConfig.cards} ${gridConfig.gap}`}>
                {filteredTracks.map((track, index) => (
                  <Card key={track.id} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 group">
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
                                className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white shadow-xl"
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
                        <Badge className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white border-white/20">
                          {getTypeLabel(track.generation_type)}
                        </Badge>
                        
                        {/* Actions rapides */}
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavorite(track.id)}
                            className="rounded-full w-8 h-8 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white border border-white/20"
                          >
                            <Heart className={`h-4 w-4 ${track.is_favorite ? 'fill-current text-pink-400' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      {/* Informations de la track */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2 group-hover:text-pink-300 transition-colors">
                          {track.title}
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-gray-300 text-sm">
                            {track.item_code}
                          </p>
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(track.duration)}
                          </p>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {formatNumber(track.play_count || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {formatNumber(track.likes || 0)}
                            </span>
                          </div>
                          
                          {/* Menu actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border border-white/20">
                              <DropdownMenuItem 
                                onClick={() => removeFromLibrary(track.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          </div>
        </div>
        <MiniPlayer />
      </div>
    </PlayerProvider>
  );
}