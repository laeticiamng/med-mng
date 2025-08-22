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

export default function LibraryPage() {
  const navigate = useNavigate();
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
          
          <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="space-y-6">
              <Skeleton className="h-10 w-64 bg-white/10" />
              <Skeleton className="h-12 w-full bg-white/10" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          {/* Header */}
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour
              </button>
              <div className="text-white font-bold text-lg">🎵 Ma Bibliothèque</div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-4">
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
                {!searchTerm && (
                  <Button 
                    onClick={() => navigate('/generator')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                  >
                    Créer ma première musique
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTracks.map((track, index) => {
                  const isCurrentTrack = currentTrack?.id === track.id;
                  const isCurrentlyPlaying = isCurrentTrack && isPlaying;
                  
                  return (
                    <div key={track.id} className="group">
                      {/* Pochette/Cover style Suno */}
                      <div className={`relative aspect-square bg-gradient-to-br ${getGradientForTrack(index)} rounded-lg mb-4 overflow-hidden shadow-lg`}>
                        {/* Icône médicale selon l'item */}
                        <div className="absolute inset-0 flex items-center justify-center text-6xl text-white/80">
                          {track.item_code.includes('103') && '🧠'}
                          {track.item_code.includes('230') && '❤️'}
                          {track.item_code.includes('156') && '🫁'}
                          {track.item_code.includes('089') && '🧠'}
                          {!['103', '230', '156', '089'].some(code => track.item_code.includes(code)) && <Music className="h-16 w-16" />}
                        </div>
                        
                        {/* Overlay de lecture */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                          <button
                            onClick={() => playTrack(track)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-4 shadow-lg hover:scale-110 transform transition-transform"
                          >
                            {isCurrentlyPlaying ? (
                              <Pause className="h-8 w-8 text-purple-600" />
                            ) : (
                              <Play className="h-8 w-8 text-purple-600 ml-1" />
                            )}
                          </button>
                        </div>

                        {/* Badge de lecture en cours */}
                        {isCurrentlyPlaying && (
                          <div className="absolute top-3 left-3 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            En cours
                          </div>
                        )}

                        {/* Badge du type */}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white/20 text-white border-white/30 text-xs">
                            {getTypeLabel(track.type)}
                          </Badge>
                        </div>
                      </div>

                      {/* Informations de la track */}
                      <div className="space-y-2">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-pink-300 transition-colors">
                          {track.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{track.item_code}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(240)} {/* durée par défaut */}
                          </span>
                        </div>

                        {/* Stats et actions */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{formatNumber(Math.floor(Math.random() * 1000 + 500))} écoutes</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleFavorite(track.id)}
                              className="p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                              <Heart className={`h-4 w-4 ${track.is_favorite ? 'text-pink-500 fill-current' : 'text-gray-400'}`} />
                            </button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
                                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                                <DropdownMenuItem onClick={() => playTrack(track)} className="text-white hover:bg-gray-800">
                                  <Play className="h-4 w-4 mr-2" />
                                  Lire
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleFavorite(track.id)} className="text-white hover:bg-gray-800">
                                  <Heart className="h-4 w-4 mr-2" />
                                  {track.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => removeFromLibrary(track.id)}
                                  className="text-red-400 hover:bg-gray-800"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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