// Complete MED-MNG Library Page with all features
import React from "react";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  Download, 
  Share, 
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
  Clock,
  Calendar,
  Star,
  Headphones,
  Plus,
  Trash2,
  Edit,
  Copy,
  Archive,
  Shuffle,
  Repeat,
  SkipForward,
  SkipBack,
  VolumeX,
  Volume1,
  Waveform,
  Mic,
  Users,
  TrendingUp,
  BarChart3,
  Eye,
  BookOpen,
  Tag,
  FolderPlus,
  FolderOpen,
  SortAsc,
  SortDesc,
  RefreshCw,
  Upload,
  Settings,
  History,
  Award,
  Target,
  Zap
} from "lucide-react";
import { useNavAction } from "@/hooks/useNavAction";
import { analytics } from "@/lib/analytics";
import { toast } from "@/components/ui/use-toast";

// Mock library data
const mockSongs = [
  {
    id: "song-1",
    title: "IC-290 - Épidémiologie des Cancers",
    artist: "Vous",
    genre: "Pop Médical",
    duration: 180,
    createdAt: "2024-01-15",
    plays: 23,
    likes: 12,
    isLiked: true,
    isFavorite: true,
    tags: ["oncologie", "épidémiologie", "prévention"],
    difficulty: "Intermédiaire",
    ednsource: "IC-290",
    audioUrl: null,
    waveform: [12, 25, 18, 30, 22, 35, 28, 15, 40, 20],
    status: "completed",
    downloadCount: 5,
    shareCount: 3,
    category: "mes-creations"
  },
  {
    id: "song-2",
    title: "Arrêt Cardiaque - RCP en Rythme",
    artist: "Vous",
    genre: "Rock Médical",
    duration: 200,
    createdAt: "2024-01-12",
    plays: 45,
    likes: 28,
    isLiked: true,
    isFavorite: false,
    tags: ["urgences", "rcp", "cardiologie"],
    difficulty: "Avancé",
    ednsource: "IC-331",
    audioUrl: null,
    waveform: [8, 32, 25, 38, 30, 42, 35, 20, 48, 25],
    status: "completed",
    downloadCount: 12,
    shareCount: 8,
    category: "mes-creations"
  },
  {
    id: "song-3",
    title: "Anatomie du Crâne",
    artist: "Dr. Martin",
    genre: "Folk Académique",
    duration: 165,
    createdAt: "2024-01-10",
    plays: 67,
    likes: 34,
    isLiked: false,
    isFavorite: true,
    tags: ["anatomie", "neurologie", "crâne"],
    difficulty: "Débutant",
    ednsource: "Anatomie",
    audioUrl: null,
    waveform: [15, 20, 28, 22, 18, 30, 25, 12, 35, 18],
    status: "completed",
    downloadCount: 18,
    shareCount: 15,
    category: "bibliotheque-globale"
  }
];

const mockPlaylists = [
  {
    id: "playlist-1",
    name: "Révisions Cardiologie",
    description: "Toutes mes chansons sur la cardiologie",
    songCount: 8,
    duration: 1440,
    createdAt: "2024-01-10",
    isPublic: false,
    cover: null,
    tags: ["cardiologie", "révisions"]
  },
  {
    id: "playlist-2", 
    name: "Urgences Médicales",
    description: "Pour réviser les situations d'urgence",
    songCount: 12,
    duration: 2160,
    createdAt: "2024-01-08",
    isPublic: true,
    cover: null,
    tags: ["urgences", "réanimation"]
  }
];

const mockStats = {
  totalSongs: 24,
  totalPlays: 156,
  totalDuration: 4320, // minutes
  favoriteGenre: "Pop Médical",
  longestStreak: 7,
  averageSessionTime: 25,
  monthlyGrowth: 15,
  topCategory: "Cardiologie"
};

export default function MedMngLibraryComplete() {
  const executeAction = useNavAction();
  
  // View states
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [currentCategory, setCurrentCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('recent');
  const [filterGenre, setFilterGenre] = React.useState('');
  const [filterDifficulty, setFilterDifficulty] = React.useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);
  
  // Player states
  const [currentSong, setCurrentSong] = React.useState<any>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(80);
  const [isShuffleOn, setIsShuffleOn] = React.useState(false);
  const [repeatMode, setRepeatMode] = React.useState<'off' | 'one' | 'all'>('off');
  
  // UI states
  const [selectedSongs, setSelectedSongs] = React.useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = React.useState(false);
  const [newPlaylistName, setNewPlaylistName] = React.useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = React.useState(false);

  React.useEffect(() => {
    analytics.track('page', 'medmng_library_view');
  }, []);

  const filteredSongs = React.useMemo(() => {
    return mockSongs.filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           song.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = currentCategory === 'all' || song.category === currentCategory;
      const matchesGenre = !filterGenre || song.genre === filterGenre;
      const matchesDifficulty = !filterDifficulty || song.difficulty === filterDifficulty;
      const matchesFavorites = !showFavoritesOnly || song.isFavorite;
      
      return matchesSearch && matchesCategory && matchesGenre && matchesDifficulty && matchesFavorites;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'plays':
          return b.plays - a.plays;
        case 'likes':
          return b.likes - a.likes;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });
  }, [searchQuery, currentCategory, filterGenre, filterDifficulty, showFavoritesOnly, sortBy]);

  const handlePlaySong = (song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
    analytics.trackMusicPlay(song.id, 0);
    
    toast({
      title: "Lecture en cours",
      description: song.title,
    });
  };

  const handleLikeSong = (songId: string) => {
    const song = mockSongs.find(s => s.id === songId);
    if (song) {
      song.isLiked = !song.isLiked;
      analytics.trackMusicLike(songId, song.isLiked);
      
      toast({
        title: song.isLiked ? "Ajouté aux favoris" : "Retiré des favoris",
        description: song.title,
      });
    }
  };

  const handleDeleteSong = (songId: string) => {
    analytics.trackUserAction('song_delete', songId);
    toast({
      title: "Chanson supprimée",
      description: "La chanson a été supprimée de votre bibliothèque.",
    });
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      analytics.trackUserAction('playlist_create', newPlaylistName);
      toast({
        title: "Playlist créée",
        description: `La playlist "${newPlaylistName}" a été créée.`,
      });
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const SongCard = ({ song, isSelected, onSelect }: { song: any, isSelected: boolean, onSelect?: (id: string) => void }) => (
    <Card className={`group hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Selection checkbox for bulk actions */}
          {showBulkActions && onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(song.id)}
              className="mt-1"
            />
          )}
          
          {/* Song cover/waveform */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {currentSong?.id === song.id && isPlaying ? (
              <div className="flex items-center gap-1">
                {song.waveform.slice(0, 4).map((height, index) => (
                  <div
                    key={index}
                    className="w-1 bg-primary rounded-full animate-pulse"
                    style={{ 
                      height: `${Math.max(height / 3, 8)}px`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  />
                ))}
              </div>
            ) : (
              <Music className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          
          {/* Song info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                  {song.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {song.artist} • {song.genre}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {song.ednsource}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      song.difficulty === 'Débutant' ? 'bg-green-100 text-green-800' :
                      song.difficulty === 'Intermédiaire' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {song.difficulty}
                  </Badge>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePlaySong(song)}
                >
                  {currentSong?.id === song.id && isPlaying ? 
                    <Pause className="h-4 w-4" /> : 
                    <Play className="h-4 w-4" />
                  }
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleLikeSong(song.id)}
                  className={song.isLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 ${song.isLiked ? 'fill-current' : ''}`} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter à une playlist
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="h-4 w-4 mr-2" />
                      Partager
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Dupliquer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Song stats */}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(song.duration)}
              </span>
              <span className="flex items-center gap-1">
                <Headphones className="h-3 w-3" />
                {song.plays}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {song.likes}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(song.createdAt)}
              </span>
            </div>
            
            {/* Tags */}
            {song.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {song.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {song.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{song.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SongListItem = ({ song, isSelected, onSelect }: { song: any, isSelected: boolean, onSelect?: (id: string) => void }) => (
    <div className={`flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
      {showBulkActions && onSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(song.id)}
        />
      )}
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handlePlaySong(song)}
        className="flex-shrink-0"
      >
        {currentSong?.id === song.id && isPlaying ? 
          <Pause className="h-4 w-4" /> : 
          <Play className="h-4 w-4" />
        }
      </Button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{song.title}</p>
            <p className="text-sm text-muted-foreground">{song.artist} • {song.genre}</p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDuration(song.duration)}</span>
            <span className="flex items-center gap-1">
              <Headphones className="h-3 w-3" />
              {song.plays}
            </span>
            <span>{formatDate(song.createdAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleLikeSong(song.id)}
          className={song.isLiked ? 'text-red-500' : ''}
        >
          <Heart className={`h-4 w-4 ${song.isLiked ? 'fill-current' : ''}`} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter à une playlist
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="h-4 w-4 mr-2" />
              Partager
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const PlaylistCard = ({ playlist }: { playlist: any }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                  {playlist.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {playlist.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>{playlist.songCount} chansons</span>
                  <span>•</span>
                  <span>{formatDuration(playlist.duration)}</span>
                  {playlist.isPublic && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        Publique
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Play className="h-4 w-4 mr-2" />
                    Lire la playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Voir détails
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Partager
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {playlist.tags && playlist.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {playlist.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout
      title="Ma Bibliothèque Musicale"
      subtitle={`${mockStats.totalSongs} chansons • ${Math.floor(mockStats.totalDuration / 60)}h d'écoute`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBulkActions(!showBulkActions)}>
            <Settings className="w-4 h-4 mr-2" />
            Actions groupées
          </Button>
          <Button size="sm" onClick={() => executeAction({ type: "route", to: "/med-mng/create" })}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle chanson
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalSongs}</p>
                  <p className="text-sm text-muted-foreground">Chansons créées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalPlays}</p>
                  <p className="text-sm text-muted-foreground">Écoutes totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{Math.floor(mockStats.totalDuration / 60)}h</p>
                  <p className="text-sm text-muted-foreground">Temps d'écoute</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">+{mockStats.monthlyGrowth}%</p>
                  <p className="text-sm text-muted-foreground">Ce mois-ci</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans votre bibliothèque..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filterGenre} onValueChange={setFilterGenre}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les genres</SelectItem>
                    <SelectItem value="Pop Médical">Pop Médical</SelectItem>
                    <SelectItem value="Rock Médical">Rock Médical</SelectItem>
                    <SelectItem value="Folk Académique">Folk Académique</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Plus récents</SelectItem>
                    <SelectItem value="plays">Plus écoutés</SelectItem>
                    <SelectItem value="likes">Plus aimés</SelectItem>
                    <SelectItem value="title">Par titre</SelectItem>
                    <SelectItem value="duration">Par durée</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
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
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="favorites-only"
                  checked={showFavoritesOnly}
                  onCheckedChange={setShowFavoritesOnly}
                />
                <Label htmlFor="favorites-only" className="text-sm">
                  Favoris uniquement
                </Label>
              </div>
              
              {showBulkActions && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter à playlist
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer les chansons sélectionnées ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Les chansons seront définitivement supprimées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSong('multiple')}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={currentCategory} onValueChange={setCurrentCategory}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="mes-creations">Mes créations</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="bibliotheque-globale">Bibliothèque globale</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSongs.map((song) => (
                    <SongCard 
                      key={song.id} 
                      song={song}
                      isSelected={selectedSongs.includes(song.id)}
                      onSelect={(id) => {
                        if (selectedSongs.includes(id)) {
                          setSelectedSongs(prev => prev.filter(sid => sid !== id));
                        } else {
                          setSelectedSongs(prev => [...prev, id]);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSongs.map((song) => (
                    <SongListItem 
                      key={song.id} 
                      song={song}
                      isSelected={selectedSongs.includes(song.id)}
                      onSelect={(id) => {
                        if (selectedSongs.includes(id)) {
                          setSelectedSongs(prev => prev.filter(sid => sid !== id));
                        } else {
                          setSelectedSongs(prev => [...prev, id]);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
              
              {filteredSongs.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Aucune chanson trouvée.
                    </p>
                    <Button className="mt-4" onClick={() => executeAction({ type: "route", to: "/med-mng/create" })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer votre première chanson
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mes-creations" className="mt-6">
            <div className="space-y-4">
              {viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSongs.filter(song => song.category === 'mes-creations').map((song) => (
                    <SongCard 
                      key={song.id} 
                      song={song}
                      isSelected={selectedSongs.includes(song.id)}
                      onSelect={(id) => {
                        if (selectedSongs.includes(id)) {
                          setSelectedSongs(prev => prev.filter(sid => sid !== id));
                        } else {
                          setSelectedSongs(prev => [...prev, id]);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSongs.filter(song => song.category === 'mes-creations').map((song) => (
                    <SongListItem 
                      key={song.id} 
                      song={song}
                      isSelected={selectedSongs.includes(song.id)}
                      onSelect={(id) => {
                        if (selectedSongs.includes(id)) {
                          setSelectedSongs(prev => prev.filter(sid => sid !== id));
                        } else {
                          setSelectedSongs(prev => [...prev, id]);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="playlists" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Créer une nouvelle playlist</h3>
                      <p className="text-sm text-muted-foreground">
                        Organisez vos chansons par thème ou spécialité
                      </p>
                    </div>
                    <Button onClick={() => setShowCreatePlaylist(true)}>
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Nouvelle playlist
                    </Button>
                  </div>
                  
                  {showCreatePlaylist && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nom de la playlist..."
                          value={newPlaylistName}
                          onChange={(e) => setNewPlaylistName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                        />
                        <Button onClick={handleCreatePlaylist}>Créer</Button>
                        <Button variant="outline" onClick={() => setShowCreatePlaylist(false)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockPlaylists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bibliotheque-globale" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Bibliothèque globale MED-MNG</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Découvrez les chansons créées par la communauté médicale
                  </p>
                </div>
              </Card>
              
              {viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSongs.filter(song => song.category === 'bibliotheque-globale').map((song) => (
                    <SongCard 
                      key={song.id} 
                      song={song}
                      isSelected={selectedSongs.includes(song.id)}
                      onSelect={(id) => {
                        if (selectedSongs.includes(id)) {
                          setSelectedSongs(prev => prev.filter(sid => sid !== id));
                        } else {
                          setSelectedSongs(prev => [...prev, id]);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSongs.filter(song => song.category === 'bibliotheque-globale').map((song) => (
                    <SongListItem 
                      key={song.id} 
                      song={song}
                      isSelected={selectedSongs.includes(song.id)}
                      onSelect={(id) => {
                        if (selectedSongs.includes(id)) {
                          setSelectedSongs(prev => prev.filter(sid => sid !== id));
                        } else {
                          setSelectedSongs(prev => [...prev, id]);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Current Playing Song (Mini Player) */}
        {currentSong && (
          <Card className="fixed bottom-4 right-4 w-80 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{currentSong.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCurrentSong(null)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}