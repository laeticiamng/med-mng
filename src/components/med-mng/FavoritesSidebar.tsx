import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Search, 
  Play, 
  Clock, 
  Music, 
  X,
  Filter,
  SortAsc,
  Download,
  Share2,
  Trash2
} from 'lucide-react';

interface FavoriteSong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  genre: string;
  addedAt: Date;
  playCount: number;
  audioUrl: string;
  thumbnailUrl?: string;
}

interface FavoritesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySong: (song: FavoriteSong) => void;
}

export const FavoritesSidebar: React.FC<FavoritesSidebarProps> = ({ 
  isOpen, 
  onClose, 
  onPlaySong 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'addedAt' | 'playCount'>('addedAt');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [favorites, setFavorites] = useState<FavoriteSong[]>([
    {
      id: '1',
      title: 'Anatomie Cardiaque',
      artist: 'MED-MNG AI',
      duration: 180,
      genre: 'Cardiologie',
      addedAt: new Date(2024, 11, 1),
      playCount: 15,
      audioUrl: '/audio/anatomie-cardiaque.mp3'
    },
    {
      id: '2', 
      title: 'Système Nerveux',
      artist: 'MED-MNG AI',
      duration: 240,
      genre: 'Neurologie',
      addedAt: new Date(2024, 11, 3),
      playCount: 8,
      audioUrl: '/audio/systeme-nerveux.mp3'
    }
  ]);

  const { toast } = useToast();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredAndSortedFavorites = favorites
    .filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           song.genre.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGenre = filterGenre === 'all' || song.genre === filterGenre;
      
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'playCount':
          return b.playCount - a.playCount;
        case 'addedAt':
        default:
          return b.addedAt.getTime() - a.addedAt.getTime();
      }
    });

  const genres = ['all', ...Array.from(new Set(favorites.map(song => song.genre)))];

  const removeFavorite = (songId: string) => {
    setFavorites(prev => prev.filter(song => song.id !== songId));
    toast({
      title: "Retiré des favoris",
      description: "La musique a été retirée de vos favoris"
    });
  };

  const handleShare = (song: FavoriteSong) => {
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: `Écoute cette musique médicale : ${song.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${song.title} - ${window.location.href}`);
      toast({
        title: "Lien copié",
        description: "Le lien de partage a été copié dans le presse-papiers"
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-96 bg-background border-l shadow-2xl z-50"
          >
            <Card className="h-full border-0 rounded-none">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <CardTitle>Mes Favoris</CardTitle>
                    <Badge variant="secondary">{favorites.length}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 h-full">
                {/* Search and Filters */}
                <div className="p-4 border-b space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans vos favoris..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                    >
                      <option value="addedAt">Plus récents</option>
                      <option value="title">Par titre</option>
                      <option value="playCount">Plus écoutés</option>
                    </select>

                    <select
                      value={filterGenre}
                      onChange={(e) => setFilterGenre(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>
                          {genre === 'all' ? 'Tous les genres' : genre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Favorites List */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {filteredAndSortedFavorites.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Aucun favori trouvé</p>
                        <p className="text-sm">
                          {searchQuery || filterGenre !== 'all' 
                            ? 'Essayez de modifier vos filtres'
                            : 'Ajoutez des musiques à vos favoris pour les retrouver ici'
                          }
                        </p>
                      </div>
                    ) : (
                      filteredAndSortedFavorites.map((song, index) => (
                        <motion.div
                          key={song.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="p-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              {/* Thumbnail */}
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Music className="h-6 w-6 text-white" />
                              </div>

                              {/* Song Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{song.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {song.artist}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(song.duration)}</span>
                                  <span>•</span>
                                  <span>{song.playCount} écoutes</span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => onPlaySong(song)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                                
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShare(song)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Share2 className="h-3 w-3" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFavorite(song.id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Genre Badge */}
                            <div className="flex justify-between items-center mt-2">
                              <Badge variant="outline" className="text-xs">
                                {song.genre}
                              </Badge>
                              
                              <span className="text-xs text-muted-foreground">
                                Ajouté le {song.addedAt.toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};