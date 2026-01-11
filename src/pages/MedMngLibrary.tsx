import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { withAuth } from '@/components/med-mng/withAuth';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { SongCard } from '@/components/med-mng/SongCard';
import { Button } from '@/components/ui/button';
import { Music, Plus, AlertCircle, Heart, ListMusic, Flame, Trophy, ArrowUpDown, LayoutGrid, List, PlayCircle, BarChart3, CheckSquare, FileDown } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslation } from '@/hooks/useTranslation';
import { SkeletonLibraryGrid } from '@/components/common/SkeletonLibraryGrid';
import { AdvancedSearch } from '@/components/med-mng/AdvancedSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTE_PATHS } from '@/config/routes';
import { Badge } from '@/components/ui/badge';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { toast } from 'sonner';
import { LibraryStats } from '@/components/library/LibraryStats';
import { ContinuousPlayer } from '@/components/library/ContinuousPlayer';
import { PlaylistQuickAdd } from '@/components/library/PlaylistQuickAdd';
import { useLibraryRealtime } from '@/hooks/useLibraryRealtime';
import { BatchActions } from '@/components/library/BatchActions';

const MedMngLibraryComponent = () => {
  const medMngApi = useMedMngApi();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { play } = useGlobalAudio();
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSlowLoading, setShowSlowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'style'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [playlistAddOpen, setPlaylistAddOpen] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<{id: string, title: string} | null>(null);
  const [showContinuousPlayer, setShowContinuousPlayer] = useState(false);
  const [continuousPlayerIndex, setContinuousPlayerIndex] = useState(0);
  // Mode sélection batch
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  
  const { stats: gamificationStats, loadStats, addPoints } = useGamification();
  const { logActivity } = useActivityTracking();

  const { text: searchPlaceholder } = useTranslation('Rechercher une chanson...');
  const { text: errorMessage } = useTranslation('Impossible de charger votre bibliothèque');
  const { text: retryText } = useTranslation('Réessayer');

  // Load gamification stats
  React.useEffect(() => {
    if (user?.id) {
      loadStats(user.id);
    }
  }, [user?.id, loadStats]);

  const level = gamificationStats ? Math.floor((gamificationStats.currentXP || 0) / XP_PER_LEVEL) + 1 : 1;

  const handleSongPlay = useCallback(async (song: any) => {
    await logActivity({
      activity_type: 'study',
      metadata: { action: 'music_play', song_id: song.id, song_title: song.title }
    });
    navigate(`/med-mng/player/${song.id}`);
  }, [logActivity, navigate]);

  const { data: library, isLoading, error, refetch } = useQuery({
    queryKey: ['med-mng-library', currentPage],
    queryFn: async () => {
      try {
        const result = await medMngApi.getLibrary(currentPage, 12);
        return result;
      } catch (err) {
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Afficher message de lenteur après 4s
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSlowLoading(true), 4000);
      return () => clearTimeout(timer);
    } else {
      setShowSlowLoading(false);
    }
  }, [isLoading]);

  const { data: quota } = useQuery({
    queryKey: ['med-mng-quota'],
    queryFn: async () => {
      try {
        return await medMngApi.getRemainingQuota();
      } catch {
        return { remaining_credits: 0 };
      }
    },
  });

  // Hook temps réel pour les mises à jour automatiques
  useLibraryRealtime({
    userId: user?.id,
    refetch,
  });

  // Effet pour initialiser les chansons filtrées
  React.useEffect(() => {
    if (library) {
      let filtered = library;
      if (activeTab === 'favorites') {
        filtered = library.filter(song => song.is_liked);
      }
      setFilteredSongs(filtered);
    }
  }, [library, activeTab]);

  // Tri des chansons
  const sortedSongs = useMemo(() => {
    const songs = [...filteredSongs];
    switch (sortBy) {
      case 'title':
        return songs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'style':
        return songs.sort((a, b) => (a.meta?.style || '').localeCompare(b.meta?.style || ''));
      case 'date':
      default:
        return songs.sort((a, b) => 
          new Date(b.added_to_library_at || b.created_at).getTime() - 
          new Date(a.added_to_library_at || a.created_at).getTime()
        );
    }
  }, [filteredSongs, sortBy]);

  // Mode lecture continue - jouer toutes les chansons avec ContinuousPlayer
  const handlePlayAll = useCallback(() => {
    if (sortedSongs.length === 0) {
      toast.error('Aucune chanson à jouer');
      return;
    }
    
    setContinuousPlayerIndex(0);
    setShowContinuousPlayer(true);
    setIsPlayingAll(true);
    toast.success(`Lecture continue: ${sortedSongs.length} chansons`);
  }, [sortedSongs]);

  // Convertir les chansons pour le ContinuousPlayer
  const continuousPlayerTracks = useMemo(() => {
    return sortedSongs.map(song => ({
      id: song.id,
      title: song.title || 'Chanson',
      audioUrl: song.meta?.audio_url || `https://cdn1.suno.ai/${song.suno_audio_id}.mp3`,
      style: song.meta?.style,
      rang: song.meta?.rang,
      duration: song.meta?.duration
    }));
  }, [sortedSongs]);

  // Ouvrir le dialog playlist pour une chanson
  const handleAddToPlaylist = useCallback((song: any) => {
    setSelectedSongForPlaylist({ id: song.id, title: song.title });
    setPlaylistAddOpen(true);
  }, []);

  // Toggle sélection d'une chanson pour batch actions
  const toggleSongSelection = useCallback((songId: string) => {
    setSelectedSongIds(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  }, []);

  // Sélectionner/Désélectionner tout
  const toggleSelectAll = useCallback(() => {
    if (selectedSongIds.length === sortedSongs.length) {
      setSelectedSongIds([]);
    } else {
      setSelectedSongIds(sortedSongs.map(s => s.id));
    }
  }, [selectedSongIds.length, sortedSongs]);

  // Export CSV/JSON de la bibliothèque avec BOM UTF-8 pour Excel
  const handleExportLibrary = useCallback((format: 'json' | 'csv') => {
    try {
      const exportData = sortedSongs.map(song => ({
        title: song.title,
        style: song.meta?.style || '',
        rang: song.meta?.rang || '',
        is_favorite: song.is_liked || false,
        added_at: song.added_to_library_at || song.created_at,
        audio_url: song.meta?.audio_url || `https://cdn1.suno.ai/${song.suno_audio_id}.mp3`
      }));
      
      let content: string;
      let mimeType: string;
      let extension: string;
      
      if (format === 'csv') {
        const headers = ['Titre', 'Style', 'Rang', 'Favori', 'Date', 'URL Audio'];
        const rows = exportData.map(d => [
          `"${(d.title || '').replace(/"/g, '""')}"`, // Escape quotes in title
          `"${(d.style || '').replace(/"/g, '""')}"`,
          d.rang || '',
          d.is_favorite ? 'Oui' : 'Non',
          new Date(d.added_at).toLocaleDateString('fr-FR'),
          d.audio_url
        ]);
        // BOM UTF-8 pour compatibilité Excel + vraies nouvelles lignes
        const BOM = '\uFEFF';
        content = BOM + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        mimeType = 'text/csv;charset=utf-8';
        extension = 'csv';
      } else {
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json;charset=utf-8';
        extension = 'json';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ma-bibliotheque-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${exportData.length} chansons exportées (${extension.toUpperCase()})`);
    } catch (err) {
      console.error('Erreur export:', err);
      toast.error('Erreur lors de l\'export');
    }
  }, [sortedSongs]);

  // Calculer les stats de la bibliothèque
  const libraryStats = useMemo(() => {
    if (!library || library.length === 0) return null;
    
    const favoritesCount = library.filter(s => s.is_liked).length;
    const totalDuration = library.reduce((acc, s) => acc + (s.meta?.duration || 240), 0);
    const lastAdded = library.reduce((latest, s) => {
      const date = new Date(s.added_to_library_at || s.created_at);
      return date > latest ? date : latest;
    }, new Date(0));
    
    const styleCounts: Record<string, number> = {};
    library.forEach(s => {
      const style = s.meta?.style || 'Unknown';
      styleCounts[style] = (styleCounts[style] || 0) + 1;
    });
    const mostPlayedStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    return {
      totalSongs: library.length,
      favoritesCount,
      totalDurationMinutes: Math.round(totalDuration / 60),
      lastAddedDate: lastAdded.toISOString(),
      mostPlayedStyle
    };
  }, [library]);

  if (isLoading) {
    return (
      <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
              Ma bibliothèque musicale
            </h1>
            <p className="text-muted-foreground">Chargement de vos chansons...</p>
          </div>
          
          <SkeletonLibraryGrid count={12} />
          
          {showSlowLoading && (
            <div className="text-center mt-8 p-4 bg-primary/10 rounded-lg">
              <p className="text-primary font-medium">
                Chargement plus long que d'habitude ?
              </p>
              <p className="text-primary/80 text-sm mt-1">
                Nous récupérons vos données...
              </p>
            </div>
          )}
        </div>
      </MedMngLayout>
    );
  }

  if (error) {
    return (
      <MedMngLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <TranslatedText text="Erreur" as="h1" className="text-2xl font-bold text-foreground mb-4" />
            <TranslatedText text={errorMessage} as="p" className="text-muted-foreground mb-6" />
            <div className="space-y-3">
              <Button onClick={() => refetch()} className="w-full min-h-[48px]">
                {retryText}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(ROUTE_PATHS.medMngCreate)}
                className="w-full min-h-[48px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                <TranslatedText text="Créer votre première chanson" />
              </Button>
            </div>
          </div>
        </div>
      </MedMngLayout>
    );
  }

  return (
    <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <TranslatedText 
              text="Ma bibliothèque"
              as="h1"
              className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2 truncate"
              showLoader
            />
            <TranslatedText 
              text={`${filteredSongs.length} chanson${filteredSongs.length > 1 ? 's' : ''}`}
              as="p"
              className="text-sm sm:text-base text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Stats gamification - mobile compact */}
            {gamificationStats && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Badge variant="outline" className="gap-1 py-1 sm:py-1.5 text-xs sm:text-sm">
                  <Flame className="h-3 w-3 text-warning" />
                  {gamificationStats.currentStreak || 0}
                  <span className="hidden sm:inline">j</span>
                </Badge>
                <Badge variant="outline" className="gap-1 py-1 sm:py-1.5 text-xs sm:text-sm">
                  <Trophy className="h-3 w-3 text-primary" />
                  <span className="hidden sm:inline">Niv.</span>{level}
                </Badge>
              </div>
            )}
            {/* Crédits */}
            <div className="text-right shrink-0">
              <div className="bg-card rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm">
                <TranslatedText text="Crédits" className="text-xs text-muted-foreground hidden sm:block" />
                <div className="text-base sm:text-lg md:text-2xl font-bold text-primary">
                  {quota?.remaining_credits || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="mb-4 sm:mb-8">
          <AdvancedSearch
            songs={library || []}
            onFilteredSongs={setFilteredSongs}
            placeholder={searchPlaceholder}
          />
        </div>

        {/* Actions - responsive buttons + tri + vue */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Button 
            onClick={() => navigate(ROUTE_PATHS.medMngCreate)}
            className="flex items-center gap-1.5 sm:gap-2 min-h-[44px] text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Créer</span>
          </Button>
          
          {/* Lecture continue */}
          {sortedSongs.length > 0 && (
            <Button 
              variant="outline"
              onClick={handlePlayAll}
              className="flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm border-primary/30 text-primary hover:bg-primary/10"
            >
              <PlayCircle className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Tout jouer</span>
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={() => navigate(ROUTE_PATHS.medMngPlaylists)}
            className="flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm"
          >
            <ListMusic className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Playlists</span>
          </Button>
          
          {/* Bouton Stats */}
          <Button 
            variant={showStats ? "default" : "outline"}
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm"
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Stats</span>
          </Button>
          
          {/* Mode sélection */}
          <Button 
            variant={selectionMode ? "default" : "outline"}
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedSongIds([]);
            }}
            className="flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm"
          >
            <CheckSquare className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Sélection</span>
          </Button>
          
          {/* Export */}
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportLibrary('json')}
              className="h-10 px-2 text-xs"
            >
              <FileDown className="h-3 w-3 mr-1" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportLibrary('csv')}
              className="h-10 px-2 text-xs"
            >
              <FileDown className="h-3 w-3 mr-1" />
              CSV
            </Button>
          </div>
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Tri */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'title' | 'style')}>
            <SelectTrigger className="w-auto min-w-[100px] sm:min-w-[130px] h-10 text-xs sm:text-sm">
              <ArrowUpDown className="h-3 w-3 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Titre</SelectItem>
              <SelectItem value="style">Style</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Vue grille/compact */}
          <div className="hidden sm:flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none h-10 px-3"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('compact')}
              className="rounded-none h-10 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* LibraryStats - affiché conditionnellement */}
        {showStats && libraryStats && (
          <div className="mb-4 sm:mb-6">
            <LibraryStats
              totalSongs={libraryStats.totalSongs}
              favoritesCount={libraryStats.favoritesCount}
              totalDurationMinutes={libraryStats.totalDurationMinutes}
              lastAddedDate={libraryStats.lastAddedDate}
              mostPlayedStyle={libraryStats.mostPlayedStyle}
            />
          </div>
        )}

        {/* ContinuousPlayer - affiché en mode lecture continue */}
        {showContinuousPlayer && continuousPlayerTracks.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <ContinuousPlayer
              tracks={continuousPlayerTracks}
              initialTrackIndex={continuousPlayerIndex}
              onTrackChange={(track, index) => setContinuousPlayerIndex(index)}
              onPlaybackEnd={() => {
                setShowContinuousPlayer(false);
                setIsPlayingAll(false);
                toast.success('Lecture terminée');
              }}
            />
          </div>
        )}

        {/* Tabs responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
          <TabsList className="grid w-full grid-cols-3 mb-3 sm:mb-4 h-auto">
            <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
              <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Toutes</span>
              <span className="sm:hidden">Tout</span>
              <span className="text-xs ml-0.5 sm:ml-1">({library?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Favoris</span>
              <span className="sm:hidden">♥</span>
              <span className="text-xs ml-0.5 sm:ml-1">({library?.filter(s => s.is_liked).length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
              <ListMusic className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Playlists</span>
              <span className="sm:hidden">Lists</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderSongGrid()}
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            {renderSongGrid()}
          </TabsContent>

          <TabsContent value="playlists" className="mt-0">
            {renderPlaylistsSection()}
          </TabsContent>
        </Tabs>

        {/* Pagination responsive */}
        {library && library.length === 12 && activeTab !== 'playlists' && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="min-h-[44px] px-3 sm:px-6 flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <span className="hidden sm:inline"><TranslatedText text="Précédent" /></span>
                <span className="sm:hidden">←</span>
              </Button>
              <div className="flex items-center justify-center px-3 text-sm text-muted-foreground">
                {currentPage}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p + 1)}
                className="min-h-[44px] px-3 sm:px-6 flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <span className="hidden sm:inline"><TranslatedText text="Suivant" /></span>
                <span className="sm:hidden">→</span>
              </Button>
            </div>
          </div>
        )}

        {/* PlaylistQuickAdd Dialog */}
        {selectedSongForPlaylist && (
          <PlaylistQuickAdd
            open={playlistAddOpen}
            onOpenChange={setPlaylistAddOpen}
            songId={selectedSongForPlaylist.id}
            songTitle={selectedSongForPlaylist.title}
            onSuccess={() => {
              refetch();
              setSelectedSongForPlaylist(null);
            }}
          />
        )}

        {/* BatchActions - affiché quand des chansons sont sélectionnées */}
        {selectionMode && (
          <BatchActions
            selectedIds={selectedSongIds}
            songs={sortedSongs}
            onClearSelection={() => {
              setSelectedSongIds([]);
              setSelectionMode(false);
            }}
            onActionComplete={() => refetch()}
          />
        )}
      </div>
    </MedMngLayout>
  );

  function renderSongGrid() {
    // Utiliser sortedSongs au lieu de filteredSongs pour le tri
    const songsToRender = sortedSongs;
    
    return songsToRender.length === 0 ? (
      <div className="text-center py-8 sm:py-16">
        <Music className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
        <TranslatedText 
          text={activeTab === 'favorites' ? 'Aucun favori' : (library && library.length > 0 ? 'Aucun résultat' : 'Bibliothèque vide')}
          as="h3"
          className="text-base sm:text-xl font-semibold text-foreground mb-2"
        />
        <TranslatedText 
          text={activeTab === 'favorites' 
            ? 'Ajoutez des chansons à vos favoris' 
            : (library && library.length > 0
              ? 'Aucune chanson correspondante' 
              : 'Créez votre première chanson')}
          as="p"
          className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto"
        />
        {(!library || library.length === 0) && activeTab === 'all' && (
          <Button onClick={() => navigate(ROUTE_PATHS.medMngCreate)} className="min-h-[44px] px-4 sm:px-6 text-sm">
            <TranslatedText text="Créer" />
          </Button>
        )}
      </div>
    ) : viewMode === 'compact' ? (
      // Vue compacte (liste) - avec sélection
      <div className="space-y-2 animate-fade-in">
        {/* En-tête de sélection */}
        {selectionMode && (
          <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg mb-2">
            <span className="text-xs text-muted-foreground">
              {selectedSongIds.length}/{songsToRender.length} sélectionnée(s)
            </span>
            <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="h-7 text-xs">
              {selectedSongIds.length === songsToRender.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Button>
          </div>
        )}
        {songsToRender.map((song) => {
          const isSelected = selectedSongIds.includes(song.id);
          return (
            <div 
              key={song.id}
              onClick={selectionMode ? () => toggleSongSelection(song.id) : undefined}
              className={`flex items-center gap-3 p-3 bg-card rounded-lg border transition-colors cursor-pointer ${
                isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border/30 hover:bg-card/80'
              }`}
            >
              {selectionMode && (
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`}>
                  {isSelected && <CheckSquare className="h-3 w-3 text-primary-foreground" />}
                </div>
              )}
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0">
                <Music className="h-5 w-5 text-primary-foreground/80" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate text-sm">{song.title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {song.meta?.style || 'Style'} • {new Date(song.added_to_library_at || song.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {song.is_liked && <Heart className="h-3 w-3 text-destructive fill-destructive" />}
                {!selectionMode && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleSongPlay(song); }}
                    className="min-h-[36px] min-w-[36px] p-0"
                  >
                    <PlayCircle className="h-5 w-5 text-primary" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      // Vue grille (par défaut) - avec sélection
      <>
        {/* En-tête de sélection pour mode grille */}
        {selectionMode && (
          <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg mb-4">
            <span className="text-xs text-muted-foreground">
              {selectedSongIds.length}/{songsToRender.length} sélectionnée(s)
            </span>
            <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="h-7 text-xs">
              {selectedSongIds.length === songsToRender.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Button>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 animate-fade-in">
          {songsToRender.map((song) => {
            const isSelected = selectedSongIds.includes(song.id);
            return (
              <div 
                key={song.id} 
                className={`relative ${isSelected ? 'ring-2 ring-primary rounded-xl' : ''}`}
                onClick={selectionMode ? () => toggleSongSelection(song.id) : undefined}
              >
                {selectionMode && (
                  <div className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-background/80 border-2 border-muted-foreground'
                  }`}>
                    {isSelected && <CheckSquare className="h-3 w-3" />}
                  </div>
                )}
                <SongCard 
                  song={song}
                  onPlay={() => !selectionMode && handleSongPlay(song)}
                  onRemove={() => refetch()}
                  onToggleLike={() => refetch()}
                />
              </div>
            );
          })}
        </div>
      </>
    );
  }

  function renderPlaylistsSection() {
    return (
      <div className="text-center py-8 sm:py-16">
        <ListMusic className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
        <TranslatedText 
          text="Mes playlists"
          as="h3"
          className="text-base sm:text-xl font-semibold text-foreground mb-2"
        />
        <TranslatedText 
          text="Organisez vos chansons"
          as="p"
          className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6"
        />
        <Button 
          onClick={() => navigate(ROUTE_PATHS.medMngPlaylists)} 
          className="min-h-[44px] px-4 sm:px-6 text-sm"
        >
          <ListMusic className="h-4 w-4 mr-2" />
          <TranslatedText text="Voir" />
        </Button>
      </div>
    );
  }
};

export const MedMngLibrary = withAuth(MedMngLibraryComponent);
