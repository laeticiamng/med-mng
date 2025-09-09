import React, { useState } from 'react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Music, 
  Play, 
  Pause, 
  Heart,
  Download,
  Share2,
  Search,
  Filter,
  Grid3X3,
  List,
  Clock,
  Star,
  Headphones,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

const NewLibrary = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPlaying, setCurrentPlaying] = useState(null);

  const songs = [
    {
      id: 1,
      title: 'Relaxation Anatomie',
      artist: 'MED-MNG IA',
      genre: 'Ambient',
      mood: 'Relaxant',
      duration: '4:32',
      plays: 1847,
      likes: 234,
      medicalFocus: 'Anatomie',
      dateCreated: '2024-01-05',
      favorite: true,
      thumbnail: '🧠'
    },
    {
      id: 2,
      title: 'Concentration Cardiologie',
      artist: 'MED-MNG IA',
      genre: 'Electronic',
      mood: 'Concentration',
      duration: '6:18',
      plays: 2156,
      likes: 312,
      medicalFocus: 'Cardiologie',
      dateCreated: '2024-01-03',
      favorite: false,
      thumbnail: '❤️'
    },
    {
      id: 3,
      title: 'Énergie Chirurgie',
      artist: 'MED-MNG IA',
      genre: 'Classical',
      mood: 'Énergisant',
      duration: '5:45',
      plays: 1632,
      likes: 189,
      medicalFocus: 'Chirurgie',
      dateCreated: '2024-01-02',
      favorite: true,
      thumbnail: '🔪'
    },
    {
      id: 4,
      title: 'Méditation Neurologie',
      artist: 'MED-MNG IA',
      genre: 'Nature',
      mood: 'Guérison',
      duration: '8:12',
      plays: 987,
      likes: 156,
      medicalFocus: 'Neurologie',
      dateCreated: '2024-01-01',
      favorite: false,
      thumbnail: '🧬'
    },
    {
      id: 5,
      title: 'Focus Pharmacologie',
      artist: 'MED-MNG IA',
      genre: 'Binaural',
      mood: 'Concentration',
      duration: '7:23',
      plays: 1456,
      likes: 267,
      medicalFocus: 'Pharmacologie',
      dateCreated: '2023-12-28',
      favorite: true,
      thumbnail: '💊'
    },
    {
      id: 6,
      title: 'Calme Pédiatrie',
      artist: 'MED-MNG IA',
      genre: 'Meditation',
      mood: 'Relaxant',
      duration: '5:34',
      plays: 1789,
      likes: 298,
      medicalFocus: 'Pédiatrie',
      dateCreated: '2023-12-25',
      favorite: false,
      thumbnail: '👶'
    }
  ];

  const filters = [
    { value: 'all', label: 'Toutes les musiques' },
    { value: 'favorites', label: 'Favoris' },
    { value: 'recent', label: 'Récentes' },
    { value: 'popular', label: 'Populaires' },
    { value: 'anatomie', label: 'Anatomie' },
    { value: 'cardiologie', label: 'Cardiologie' },
    { value: 'neurologie', label: 'Neurologie' },
    { value: 'chirurgie', label: 'Chirurgie' }
  ];

  const moods = ['Relaxant', 'Concentration', 'Énergisant', 'Guérison'];
  const genres = ['Ambient', 'Electronic', 'Classical', 'Nature', 'Binaural', 'Meditation'];

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.medicalFocus.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === 'favorites') matchesFilter = song.favorite;
    else if (selectedFilter !== 'all') {
      matchesFilter = song.medicalFocus.toLowerCase() === selectedFilter.toLowerCase();
    }
    
    return matchesSearch && matchesFilter;
  });

  const handlePlay = (songId) => {
    if (currentPlaying === songId) {
      setCurrentPlaying(null);
      toast.info('Lecture arrêtée');
    } else {
      setCurrentPlaying(songId);
      const song = songs.find(s => s.id === songId);
      toast.success(`Lecture: ${song.title}`);
    }
  };

  const handleLike = (songId) => {
    const song = songs.find(s => s.id === songId);
    toast.success(`${song.favorite ? 'Retiré des' : 'Ajouté aux'} favoris`);
  };

  const handleDownload = (song) => {
    toast.success(`Téléchargement de "${song.title}" commencé`);
  };

  const handleShare = (song) => {
    toast.success(`Lien de partage copié pour "${song.title}"`);
  };

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                <Music className="inline h-10 w-10 mr-3 text-indigo-600" />
                Ma Bibliothèque
              </h1>
              <p className="text-lg text-gray-600">
                {filteredSongs.length} musiques dans votre collection
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Créer une nouvelle musique
            </Button>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher par titre ou domaine médical..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <div className="text-sm text-gray-600 mr-4">Filtres rapides:</div>
            {moods.map((mood) => (
              <Badge key={mood} variant="outline" className="cursor-pointer hover:bg-gray-100">
                {mood}
              </Badge>
            ))}
            {genres.map((genre) => (
              <Badge key={genre} variant="secondary" className="cursor-pointer hover:bg-gray-200">
                {genre}
              </Badge>
            ))}
          </div>

          {/* Music Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSongs.map((song) => (
                <Card key={song.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-6xl">
                    {song.thumbnail}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{song.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{song.artist}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{song.genre}</Badge>
                      <Badge variant="secondary" className="text-xs">{song.mood}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {song.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Headphones className="h-3 w-3" />
                        {song.plays.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => handlePlay(song.id)}
                        className="flex-1"
                      >
                        {currentPlaying === song.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLike(song.id)}
                      >
                        <Heart className={`h-4 w-4 ${song.favorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(song)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSongs.map((song) => (
                <Card key={song.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-2xl shrink-0">
                        {song.thumbnail}
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{song.title}</h3>
                        <p className="text-gray-600 text-sm">{song.artist} • {song.medicalFocus}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{song.genre}</Badge>
                          <Badge variant="secondary" className="text-xs">{song.mood}</Badge>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right text-sm text-gray-600 shrink-0">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3" />
                          {song.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Headphones className="h-3 w-3" />
                          {song.plays.toLocaleString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handlePlay(song.id)}
                        >
                          {currentPlaying === song.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLike(song.id)}
                        >
                          <Heart className={`h-4 w-4 ${song.favorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(song)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShare(song)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredSongs.length === 0 && (
            <div className="text-center py-16">
              <Music className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune musique trouvée</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Essayez avec d\'autres mots-clés' : 'Commencez par créer votre première musique'}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer une musique
              </Button>
            </div>
          )}
        </div>
      </div>
    </MedMngLayout>
  );
};

export default NewLibrary;