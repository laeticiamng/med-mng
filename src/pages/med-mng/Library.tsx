import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Music, 
  Search, 
  Play, 
  Pause,
  Heart, 
  MoreHorizontal, 
  Trash2, 
  Download,
  Share2,
  Clock, 
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Star,
  Calendar,
  Tag,
  Headphones,
  BarChart3,
  Plus,
  Sparkles,
  Brain
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EnhancedLibraryCard } from '@/components/immersive/EnhancedLibraryCard';
import { MusicWaveform } from '@/components/immersive/MusicWaveform';
import { ResponsiveLayout } from '@/components/immersive/ResponsiveLayout';
import { useToast } from '@/hooks/use-toast';
import { useAPI, useAIRecommendations } from '@/hooks/useAPI';
import { useNavigate } from 'react-router-dom';

interface MedTrack {
  id: string;
  title: string;
  subject: string;
  style: string;
  duration: number;
  createdAt: string;
  playCount: number;
  isFavorite: boolean;
  difficulty: 'debutant' | 'intermediaire' | 'avance' | 'expert';
  tags: string[];
  mood: string;
  tempo: number;
  retentionScore?: number;
  completionRate?: number;
}

const Library = () => {
  const { toast } = useToast();
  
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<MedTrack[]>([]);

  // Données simulées
  useEffect(() => {
    const mockTracks: MedTrack[] = [
      {
        id: '1',
        title: 'Insuffisance Cardiaque Trap',
        subject: 'Cardiologie',
        style: 'Trap',
        duration: 245,
        createdAt: '2024-01-15T10:30:00Z',
        playCount: 127,
        isFavorite: true,
        difficulty: 'intermediaire',
        tags: ['cardiologie', 'insuffisance', 'physiopathologie'],
        mood: 'Énergique',
        tempo: 150,
        retentionScore: 89,
        completionRate: 76
      },
      {
        id: '2',
        title: 'Neuroanatomie Lo-Fi',
        subject: 'Neurologie',
        style: 'Lo-Fi',
        duration: 312,
        createdAt: '2024-01-14T15:45:00Z',
        playCount: 89,
        isFavorite: false,
        difficulty: 'avance',
        tags: ['neurologie', 'anatomie', 'système nerveux'],
        mood: 'Relaxant',
        tempo: 85,
        retentionScore: 92,
        completionRate: 84
      },
      {
        id: '3',
        title: 'Diabète Pop Clinique',
        subject: 'Endocrinologie',
        style: 'Pop',
        duration: 198,
        createdAt: '2024-01-13T09:15:00Z',
        playCount: 156,
        isFavorite: true,
        difficulty: 'intermediaire',
        tags: ['endocrinologie', 'diabète', 'métabolisme'],
        mood: 'Optimiste',
        tempo: 125,
        retentionScore: 95,
        completionRate: 91
      },
      {
        id: '4',
        title: 'Pneumonie Jazz Fusion',
        subject: 'Pneumologie',
        style: 'Jazz',
        duration: 287,
        createdAt: '2024-01-12T14:20:00Z',
        playCount: 73,
        isFavorite: false,
        difficulty: 'avance',
        tags: ['pneumologie', 'infection', 'diagnostic'],
        mood: 'Sophistiqué',
        tempo: 95
      },
      {
        id: '5',
        title: 'Rythmes Hépatiques Afrobeat',
        subject: 'Gastroentérologie',
        style: 'Afrobeat',
        duration: 234,
        createdAt: '2024-01-11T11:30:00Z',
        playCount: 92,
        isFavorite: true,
        difficulty: 'intermediaire',
        tags: ['gastroentérologie', 'foie', 'hépatologie'],
        mood: 'Dynamique',
        tempo: 110
      },
      {
        id: '6',
        title: 'Oncologie Classique Moderne',
        subject: 'Oncologie',
        style: 'Classique',
        duration: 345,
        createdAt: '2024-01-10T16:45:00Z',
        playCount: 64,
        isFavorite: false,
        difficulty: 'expert',
        tags: ['oncologie', 'cancer', 'traitement'],
        mood: 'Élégant',
        tempo: 75
      }
    ];
    setTracks(mockTracks);
  }, []);

  // Fonctions utilitaires
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'debutant': return 'bg-green-100 text-green-800';
      case 'intermediaire': return 'bg-blue-100 text-blue-800';
      case 'avance': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStyleGradient = (style: string) => {
    switch (style.toLowerCase()) {
      case 'trap': return 'from-purple-500 to-pink-500';
      case 'lo-fi': return 'from-blue-400 to-cyan-400';
      case 'pop': return 'from-pink-400 to-rose-400';
      case 'jazz': return 'from-amber-500 to-orange-500';
      case 'afrobeat': return 'from-green-500 to-emerald-500';
      case 'classique': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  // Filtres et tri
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || 
                         filterBy === 'favorites' && track.isFavorite ||
                         track.difficulty === filterBy ||
                         track.style.toLowerCase() === filterBy.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const sortedTracks = [...filteredTracks].sort((a, b) => {
    switch (sortBy) {
      case 'recent': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular': return b.playCount - a.playCount;
      case 'alphabetical': return a.title.localeCompare(b.title);
      case 'duration': return b.duration - a.duration;
      default: return 0;
    }
  });

  const handlePlayPause = async (trackId: string) => {
    if (currentTrack === trackId && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(trackId);
      setIsPlaying(true);
      
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        // Mettre à jour le compteur de lecture
        setTracks(prevTracks =>
          prevTracks.map(t =>
            t.id === trackId
              ? { ...t, playCount: t.playCount + 1 }
              : t
          )
        );

        toast({
          title: "🎵 Lecture en cours",
          description: `${track.title} - ${track.subject}`,
        });

        // Rediriger vers le lecteur pour une expérience complète
        setTimeout(() => {
          window.location.href = `/med-mng/player/${trackId}`;
        }, 1000);
      }
    }
  };

  const toggleFavorite = (trackId: string) => {
    setTracks(prevTracks =>
      prevTracks.map(track =>
        track.id === trackId
          ? { ...track, isFavorite: !track.isFavorite }
          : track
      )
    );
  };

  const deleteTrack = (trackId: string) => {
    setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId));
    toast({
      title: "Musique supprimée",
      description: "La musique a été retirée de votre bibliothèque.",
    });
  };

  // Stats rapides
  const stats = {
    total: tracks.length,
    favorites: tracks.filter(t => t.isFavorite).length,
    totalDuration: tracks.reduce((sum, track) => sum + track.duration, 0),
    totalPlays: tracks.reduce((sum, track) => sum + track.playCount, 0)
  };

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header avec stats */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ma Bibliothèque Musicale
                </h1>
                <p className="text-gray-600 mt-1">
                  Votre collection personnelle de musiques pédagogiques MNG
                </p>
              </div>

              <div className="flex items-center space-x-4">
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

            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-700">Musiques</div>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-pink-600">{stats.favorites}</div>
                <div className="text-sm text-pink-700">Favoris</div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor(stats.totalDuration / 60)}h{Math.floor((stats.totalDuration % 60))}m
                </div>
                <div className="text-sm text-green-700">Durée totale</div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalPlays}</div>
                <div className="text-sm text-purple-700">Écoutes</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Contrôles */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Rechercher par titre, sujet ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres */}
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="favorites">Favoris</SelectItem>
                <SelectItem value="debutant">Débutant</SelectItem>
                <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                <SelectItem value="avance">Avancé</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
                <SelectItem value="trap">Trap</SelectItem>
                <SelectItem value="lo-fi">Lo-Fi</SelectItem>
                <SelectItem value="pop">Pop</SelectItem>
                <SelectItem value="jazz">Jazz</SelectItem>
              </SelectContent>
            </Select>

            {/* Tri */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récent</SelectItem>
                <SelectItem value="popular">Plus populaire</SelectItem>
                <SelectItem value="alphabetical">Alphabétique</SelectItem>
                <SelectItem value="duration">Durée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste des musiques */}
          {sortedTracks.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Music className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'Aucune musique trouvée' : 'Votre bibliothèque est vide'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Essayez avec d\'autres termes de recherche'
                  : 'Créez votre première musique pédagogique pour commencer !'}
              </p>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Music className="h-4 w-4 mr-2" />
                Créer ma première musique
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedTracks.map((track) => (
                <Card key={track.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/70 backdrop-blur-sm border-0">
                  <CardContent className="p-4">
                    {/* Image et contrôles */}
                    <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                      <div className={`w-full h-full bg-gradient-to-br ${getStyleGradient(track.style)} flex items-center justify-center text-white relative`}>
                        <Music className="h-16 w-16 opacity-80" />
                        
                        {/* Overlay de lecture */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                          <Button
                            size="lg"
                            onClick={() => handlePlayPause(track.id)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white rounded-full w-16 h-16"
                          >
                            {currentTrack === track.id && isPlaying ? (
                              <Pause className="h-8 w-8" />
                            ) : (
                              <Play className="h-8 w-8 ml-1" />
                            )}
                          </Button>
                        </div>

                        {/* Badge style */}
                        <Badge className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm text-white border-white/20">
                          {track.style}
                        </Badge>

                        {/* Favori */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleFavorite(track.id)}
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-full w-8 h-8"
                        >
                          <Heart className={`h-4 w-4 ${track.isFavorite ? 'fill-current text-red-400' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    {/* Informations */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {track.title}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {track.subject}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(track.duration)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(track.difficulty) + ' text-xs'}>
                          {track.difficulty}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Headphones className="h-3 w-3 mr-1" />
                          {track.playCount}
                        </div>
                      </div>

                      {/* Menu actions */}
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Partager
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteTrack(track.id)}
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
          ) : (
            /* Vue liste */
            <div className="space-y-4">
              {sortedTracks.map((track) => (
                <Card key={track.id} className="hover:shadow-md transition-all duration-200 bg-white/70 backdrop-blur-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Contrôle de lecture */}
                      <Button
                        size="sm"
                        onClick={() => handlePlayPause(track.id)}
                        className="rounded-full w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        {currentTrack === track.id && isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 ml-0.5" />
                        )}
                      </Button>

                      {/* Informations principales */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{track.title}</h3>
                        <p className="text-sm text-gray-600">{track.subject} • {track.style}</p>
                      </div>

                      {/* Tags */}
                      <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
                        {track.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {track.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{track.tags.length - 2}
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(track.duration)}
                        </div>
                        <div className="flex items-center">
                          <Headphones className="h-4 w-4 mr-1" />
                          {track.playCount}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleFavorite(track.id)}
                        >
                          <Heart className={`h-4 w-4 ${track.isFavorite ? 'fill-current text-red-500' : ''}`} />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Partager
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteTrack(track.id)}
                              className="text-red-600"
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
    </MedMngLayout>
  );
};

export default Library;