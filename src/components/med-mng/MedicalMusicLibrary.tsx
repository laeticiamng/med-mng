import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Music, 
  Play, 
  Pause, 
  Download, 
  Heart, 
  Search,
  Filter,
  Calendar,
  Clock,
  Tag,
  Trash2,
  Share2,
  RefreshCw
} from 'lucide-react';

interface MusicGeneration {
  id: string;
  item_code: string | null;
  title: string;
  rang: 'A' | 'B' | 'AB';
  style: string;
  status: 'generating' | 'completed' | 'failed';
  audio_url: string | null;
  image_url: string | null;
  created_at: string;
  completed_at: string | null;
  enhanced_lyrics: string | null;
}

export const MedicalMusicLibrary: React.FC = () => {
  const [generations, setGenerations] = useState<MusicGeneration[]>([]);
  const [filteredGenerations, setFilteredGenerations] = useState<MusicGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRang, setFilterRang] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();

  const loadGenerations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('med_mng_music_generations' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setGenerations((data || []) as MusicGeneration[]);
    } catch (error) {
      console.error('Load generations error:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger votre bibliothèque",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load data on mount
  useEffect(() => {
    loadGenerations();
  }, [loadGenerations]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...generations];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(gen => 
        gen.title.toLowerCase().includes(term) ||
        gen.item_code?.toLowerCase().includes(term) ||
        gen.style.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(gen => gen.status === filterStatus);
    }

    // Rang filter
    if (filterRang !== 'all') {
      filtered = filtered.filter(gen => gen.rang === filterRang);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredGenerations(filtered);
  }, [generations, searchTerm, filterStatus, filterRang, sortBy]);

  const togglePlay = useCallback((generationId: string, audioUrl: string | null) => {
    if (!audioUrl) {
      toast({
        title: "Audio non disponible",
        description: "Cette génération n'a pas d'audio",
        variant: "destructive"
      });
      return;
    }

    if (currentlyPlaying === generationId) {
      setCurrentlyPlaying(null);
      // Pause logic here
    } else {
      setCurrentlyPlaying(generationId);
      // Play logic here
    }
  }, [currentlyPlaying, toast]);

  const downloadAudio = useCallback(async (generation: MusicGeneration) => {
    if (!generation.audio_url) {
      toast({
        title: "Audio non disponible",
        description: "Cette génération n'a pas d'audio",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(generation.audio_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generation.title || generation.item_code || 'musique'}.mp3`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Téléchargement démarré",
        description: "Le fichier audio est en cours de téléchargement"
      });
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger l'audio",
        variant: "destructive"
      });
    }
  }, [toast]);

  const deleteGeneration = useCallback(async (generationId: string) => {
    try {
      const { error } = await supabase
        .from('med_mng_music_generations' as any)
        .delete()
        .eq('id', generationId);

      if (error) throw error;

      setGenerations(prev => prev.filter(g => g.id !== generationId));
      
      toast({
        title: "Suppression réussie",
        description: "La génération a été supprimée"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur suppression",
        description: "Impossible de supprimer la génération",
        variant: "destructive"
      });
    }
  }, [toast]);

  const shareGeneration = useCallback(async (generation: MusicGeneration) => {
    if (!generation.audio_url) {
      toast({
        title: "Partage impossible",
        description: "Cette génération n'a pas d'audio",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(generation.audio_url);
      toast({
        title: "Lien copié",
        description: "Le lien de partage a été copié dans le presse-papiers"
      });
    } catch (error) {
      toast({
        title: "Erreur de partage",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'generating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRangColor = (rang: string) => {
    switch (rang) {
      case 'A': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'B': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'AB': return 'bg-gradient-to-r from-purple-100 to-orange-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Chargement de votre bibliothèque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ma Bibliothèque Musicale
          </h1>
          <p className="text-muted-foreground mt-1">
            {generations.length} génération{generations.length !== 1 ? 's' : ''} • 
            {generations.filter(g => g.status === 'completed').length} complétée{generations.filter(g => g.status === 'completed').length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Button onClick={loadGenerations} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rechercher</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Titre, item, style..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Statut</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Complétés</SelectItem>
                  <SelectItem value="generating">En cours</SelectItem>
                  <SelectItem value="failed">Échoués</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rang</label>
              <Select value={filterRang} onValueChange={setFilterRang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rangs</SelectItem>
                  <SelectItem value="A">Rang A</SelectItem>
                  <SelectItem value="B">Rang B</SelectItem>
                  <SelectItem value="AB">Rang A+B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trier par</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (récent)</SelectItem>
                  <SelectItem value="title">Titre (A-Z)</SelectItem>
                  <SelectItem value="status">Statut</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Toutes ({filteredGenerations.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Complétées ({filteredGenerations.filter(g => g.status === 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="generating">
            En cours ({filteredGenerations.filter(g => g.status === 'generating').length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Échouées ({filteredGenerations.filter(g => g.status === 'failed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <GenerationsList 
            generations={filteredGenerations}
            currentlyPlaying={currentlyPlaying}
            onTogglePlay={togglePlay}
            onDownload={downloadAudio}
            onDelete={deleteGeneration}
            onShare={shareGeneration}
            getStatusColor={getStatusColor}
            getRangColor={getRangColor}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <GenerationsList 
            generations={filteredGenerations.filter(g => g.status === 'completed')}
            currentlyPlaying={currentlyPlaying}
            onTogglePlay={togglePlay}
            onDownload={downloadAudio}
            onDelete={deleteGeneration}
            onShare={shareGeneration}
            getStatusColor={getStatusColor}
            getRangColor={getRangColor}
          />
        </TabsContent>

        <TabsContent value="generating" className="mt-6">
          <GenerationsList 
            generations={filteredGenerations.filter(g => g.status === 'generating')}
            currentlyPlaying={currentlyPlaying}
            onTogglePlay={togglePlay}
            onDownload={downloadAudio}
            onDelete={deleteGeneration}
            onShare={shareGeneration}
            getStatusColor={getStatusColor}
            getRangColor={getRangColor}
          />
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          <GenerationsList 
            generations={filteredGenerations.filter(g => g.status === 'failed')}
            currentlyPlaying={currentlyPlaying}
            onTogglePlay={togglePlay}
            onDownload={downloadAudio}
            onDelete={deleteGeneration}
            onShare={shareGeneration}
            getStatusColor={getStatusColor}
            getRangColor={getRangColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface GenerationsListProps {
  generations: MusicGeneration[];
  currentlyPlaying: string | null;
  onTogglePlay: (id: string, url: string | null) => void;
  onDownload: (generation: MusicGeneration) => void;
  onDelete: (id: string) => void;
  onShare: (generation: MusicGeneration) => void;
  getStatusColor: (status: string) => string;
  getRangColor: (rang: string) => string;
}

const GenerationsList: React.FC<GenerationsListProps> = ({
  generations,
  currentlyPlaying,
  onTogglePlay,
  onDownload,
  onDelete,
  onShare,
  getStatusColor,
  getRangColor
}) => {
  if (generations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Aucune génération trouvée</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par créer votre première musique médicale
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {generations.map((generation) => (
        <Card key={generation.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">
                  {generation.title}
                </CardTitle>
                {generation.item_code && (
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Tag className="h-3 w-3" />
                    {generation.item_code}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                <Badge className={getRangColor(generation.rang)}>
                  {generation.rang}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(generation.created_at).toLocaleDateString('fr-FR')}
              {generation.completed_at && (
                <>
                  <Clock className="h-4 w-4 ml-2" />
                  {new Date(generation.completed_at).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(generation.status)}>
                {generation.status === 'completed' ? 'Terminé' :
                 generation.status === 'generating' ? 'En cours' : 'Échoué'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {generation.style}
              </span>
            </div>

            {generation.image_url && (
              <div className="aspect-video bg-muted rounded overflow-hidden">
                <img 
                  src={generation.image_url} 
                  alt="Illustration"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {generation.status === 'completed' && generation.audio_url && (
              <div className="bg-muted/50 p-3 rounded">
                <audio controls className="w-full h-8">
                  <source src={generation.audio_url} type="audio/mpeg" />
                </audio>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {generation.status === 'completed' && generation.audio_url && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onTogglePlay(generation.id, generation.audio_url)}
                  >
                    {currentlyPlaying === generation.id ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {currentlyPlaying === generation.id ? 'Pause' : 'Écouter'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload(generation)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onShare(generation)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Partager
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(generation.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>

            {generation.enhanced_lyrics && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Voir les paroles améliorées
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs whitespace-pre-wrap">
                  {generation.enhanced_lyrics}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};