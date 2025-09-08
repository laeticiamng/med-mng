import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Library as LibraryIcon,
  Search,
  Heart,
  Play,
  Download,
  Share,
  Plus,
  Music,
  Clock,
  Calendar,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// ===============================================
// MED-MNG LIBRARY - COMPLETE MUSIC MANAGEMENT
// ===============================================

interface Track {
  id: string;
  title: string;
  item_code: string;
  rang: 'A' | 'B' | 'AB';
  audio_url?: string;
  stream_url?: string;
  duration_seconds: number;
  style: string;
  language: string;
  is_favorite: boolean;
  play_count: number;
  created_at: string;
}

const Library: React.FC = () => {
  // States
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedRang, setSelectedRang] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Hooks
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load library data
  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      // Mock data until database is ready
      const mockTracks: Track[] = [
        {
          id: '1',
          title: 'IC-225 Cardiologie Rang A',
          item_code: 'IC-225',
          rang: 'A',
          duration_seconds: 240,
          style: 'medical-educational',
          language: 'fr',
          is_favorite: false,
          play_count: 5,
          created_at: new Date().toISOString()
        }
      ];
      
      setTracks(mockTracks);
    } catch (error) {
      console.error('Error loading library:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger votre bibliothèque",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted tracks
  const filteredTracks = useMemo(() => {
    let filtered = tracks.filter(track => {
      const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           track.item_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRang = selectedRang === 'all' || track.rang === selectedRang;

      return matchesSearch && matchesRang;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'play_count':
          aValue = a.play_count;
          bValue = b.play_count;
          break;
        case 'duration':
          aValue = a.duration_seconds;
          bValue = b.duration_seconds;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [tracks, searchQuery, selectedRang, sortBy, sortOrder]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (trackId: string) => {
    try {
      const track = tracks.find(t => t.id === trackId);
      if (!track) return;

      // Mock update until database is ready
      const error = null;

      if (error) throw error;

      setTracks(prev => prev.map(t => 
        t.id === trackId ? { ...t, is_favorite: !t.is_favorite } : t
      ));

      toast({
        title: track.is_favorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: track.title
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre bibliothèque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LibraryIcon className="h-8 w-8 text-primary" />
            Ma bibliothèque musicale
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez et organisez vos musiques d'apprentissage médical
          </p>
        </div>
        <Button asChild>
          <Link to="/med-mng/create">
            <Plus className="h-4 w-4 mr-2" />
            Créer une musique
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total pistes</p>
                <p className="text-xl font-bold">{tracks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Favoris</p>
                <p className="text-xl font-bold">{tracks.filter(t => t.is_favorite).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Durée totale</p>
                <p className="text-xl font-bold">
                  {Math.floor(tracks.reduce((sum, t) => sum + t.duration_seconds, 0) / 60)}min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Cette semaine</p>
                <p className="text-xl font-bold">
                  {tracks.filter(track => 
                    new Date(track.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre ou code item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Rang Filter */}
            <Select value={selectedRang} onValueChange={setSelectedRang}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous rangs</SelectItem>
                <SelectItem value="A">Rang A</SelectItem>
                <SelectItem value="B">Rang B</SelectItem>
                <SelectItem value="AB">Rang AB</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date création</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
                <SelectItem value="play_count">Écoutes</SelectItem>
                <SelectItem value="duration">Durée</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracks */}
      {filteredTracks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucune piste trouvée</h3>
            <p className="text-muted-foreground mb-6">
              {tracks.length === 0 
                ? "Votre bibliothèque est vide. Commencez par créer votre première musique !" 
                : "Aucune piste ne correspond à vos critères de recherche."
              }
            </p>
            <Button asChild>
              <Link to="/med-mng/create">
                <Plus className="h-4 w-4 mr-2" />
                Créer ma première musique
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map((track) => (
            <Card key={track.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{track.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{track.item_code}</Badge>
                      <Badge 
                        variant={track.rang === 'A' ? 'default' : track.rang === 'B' ? 'secondary' : 'destructive'}
                      >
                        Rang {track.rang}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFavorite(track.id)}
                    className={track.is_favorite ? 'text-red-500' : 'text-muted-foreground'}
                  >
                    <Heart className={`h-4 w-4 ${track.is_favorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatDuration(track.duration_seconds)}</span>
                    <span>{track.play_count} écoutes</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Écouter
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;