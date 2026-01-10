import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, Music, Play, Pause, Trash2, Filter, Heart, Search, Download, ChevronLeft, ChevronRight, FileDown, RefreshCw, BarChart3, Share2, CheckSquare, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PremiumCard } from '@/components/ui/premium-card';
import { TranslatedText } from '@/components/TranslatedText';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { toast } from 'sonner';
import { formatDistanceToNow, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BatchActionsBar } from './BatchActionsBar';
import { GenerationStats } from './GenerationStats';
import { MusicListSkeleton } from '@/components/ui/skeleton-loader';
import { ShareMusicDialog } from './ShareMusicDialog';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { useRealtimeGeneration } from '@/hooks/useRealtimeGeneration';
import { GenerationFilters, type FilterType, type SortType, type DateRangeType } from './GenerationFilters';
import { useDebounce } from '@/hooks/useDebounce'; // ✅ Import debounce

interface GeneratedTrack {
  id: string;
  item_code: string;
  rang: string;
  music_style: string;
  audio_url: string;
  created_at: string;
  title?: string;
  is_favorite?: boolean;
}

type FilterTypeSimple = 'all' | 'favorites' | 'rang_a' | 'rang_b' | 'rang_ab';

const ITEMS_PER_PAGE = 10;

export const GenerationHistory: React.FC = () => {
  const { user } = useAuth();
  const { play, currentTrack, isPlaying, pause } = useGlobalAudio();
  const [history, setHistory] = useState<GeneratedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date_desc');
  const [dateRange, setDateRange] = useState<DateRangeType>('all');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // ✅ Debounce 300ms
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [shareTrack, setShareTrack] = useState<GeneratedTrack | null>(null);

  // Realtime subscription pour les nouvelles générations
  const { isConnected: realtimeConnected } = useRealtimeGeneration({
    userId: user?.id,
    onGenerationComplete: (track) => {
      loadHistory();
    },
    enabled: !!user
  });

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Réaltime : écouter les nouvelles générations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('history-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_generated_music',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          loadHistory();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_music_tracks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new?.generation_status === 'completed' && payload.new?.audio_url) {
            loadHistory();
            toast.success('🎵 Nouvelle musique disponible !');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // Charger uniquement les musiques de l'utilisateur connecté
      const [userMusicResult, generatedTracksResult] = await Promise.all([
        // Source 1: user_generated_music - musiques associées à l'utilisateur
        supabase
          .from('user_generated_music')
          .select('id, item_code, rang, music_style, audio_url, created_at, title, is_favorite')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        
        // Source 2: generated_music_tracks - uniquement celles de l'utilisateur
        supabase
          .from('generated_music_tracks')
          .select('id, task_id, title, audio_url, duration, generation_status, metadata, created_at, user_id')
          .eq('user_id', user.id)
          .eq('generation_status', 'completed')
          .not('audio_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      // Combiner les résultats en évitant les doublons par audio_url
      const userMusic = userMusicResult.data || [];
      const generatedTracks = (generatedTracksResult.data || [])
        .map((track: any) => ({
          id: track.id,
          item_code: track.metadata?.itemCode || 'GEN',
          rang: track.metadata?.rang || 'A',
          music_style: track.metadata?.style || 'Generated',
          audio_url: track.audio_url,
          created_at: track.created_at,
          title: track.title,
          is_favorite: false
        }));

      // Fusionner en évitant les doublons
      const seenUrls = new Set<string>();
      const combined: GeneratedTrack[] = [];
      
      for (const track of [...userMusic, ...generatedTracks]) {
        if (track.audio_url && !seenUrls.has(track.audio_url)) {
          seenUrls.add(track.audio_url);
          combined.push(track);
        }
      }

      // Trier par date décroissante
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setHistory(combined.slice(0, 50));
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extraire les styles uniques pour le filtre
  const availableStyles = useMemo(() => {
    const styles = new Set<string>();
    history.forEach(track => {
      if (track.music_style) styles.add(track.music_style);
    });
    return Array.from(styles).sort();
  }, [history]);

  // Calculer le nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filter !== 'all') count++;
    if (dateRange !== 'all') count++;
    if (styleFilter && styleFilter !== 'all') count++;
    if (sortBy !== 'date_desc') count++;
    return count;
  }, [filter, dateRange, styleFilter, sortBy]);

  // Réinitialiser les filtres
  const clearFilters = useCallback(() => {
    setFilter('all');
    setSortBy('date_desc');
    setDateRange('all');
    setStyleFilter('all');
    setSearchQuery('');
  }, []);

  // Filtrer et rechercher dans l'historique avec tous les filtres
  const filteredHistory = useMemo(() => {
    let filtered = history.filter(track => {
      // Filtre par type/rang
      switch (filter) {
        case 'favorites':
          if (track.is_favorite !== true) return false;
          break;
        case 'rang_a':
          if (track.rang !== 'A') return false;
          break;
        case 'rang_b':
          if (track.rang !== 'B') return false;
          break;
        case 'rang_ab':
          if (track.rang !== 'AB') return false;
          break;
      }

      // Filtre par période
      if (dateRange !== 'all') {
        const trackDate = new Date(track.created_at);
        switch (dateRange) {
          case 'today':
            if (!isToday(trackDate)) return false;
            break;
          case 'week':
            if (!isThisWeek(trackDate, { locale: fr })) return false;
            break;
          case 'month':
            if (!isThisMonth(trackDate)) return false;
            break;
        }
      }

      // Filtre par style
      if (styleFilter && styleFilter !== 'all') {
        if (track.music_style !== styleFilter) return false;
      }
      
      // Filtre par recherche - ✅ Utilise debouncedSearchQuery
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        return (
          (track.title?.toLowerCase().includes(query)) ||
          (track.item_code?.toLowerCase().includes(query)) ||
          (track.music_style?.toLowerCase().includes(query))
        );
      }
      
      return true;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title_asc':
          return (a.title || a.item_code).localeCompare(b.title || b.item_code);
        case 'title_desc':
          return (b.title || b.item_code).localeCompare(a.title || a.item_code);
        case 'date_desc':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    return filtered;
  }, [history, filter, debouncedSearchQuery, dateRange, styleFilter, sortBy]); // ✅ Utilise debouncedSearchQuery

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHistory, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, dateRange, styleFilter, sortBy]);

  const handlePlay = (track: GeneratedTrack) => {
    if (currentTrack?.url === track.audio_url && isPlaying) {
      pause();
    } else {
      play({
        url: track.audio_url,
        title: track.title || `${track.item_code} - ${track.music_style}`,
        rang: track.rang as 'A' | 'B'
      });
    }
  };

  const handleDeleteClick = (trackId: string) => {
    setTrackToDelete(trackId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !trackToDelete) return;

    try {
      const { error } = await supabase
        .from('user_generated_music')
        .delete()
        .eq('id', trackToDelete)
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory(prev => prev.filter(t => t.id !== trackToDelete));
      toast.success('Génération supprimée');
    } catch (err) {
      console.error('Erreur suppression:', err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setTrackToDelete(null);
    }
  };

  const handleToggleFavorite = async (trackId: string, currentFavorite: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_generated_music')
        .update({ is_favorite: !currentFavorite })
        .eq('id', trackId)
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory(prev => prev.map(t => 
        t.id === trackId ? { ...t, is_favorite: !currentFavorite } : t
      ));
      toast.success(currentFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
    } catch (err) {
      console.error('Erreur toggle favori:', err);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Télécharger un track
  const handleDownload = useCallback(async (track: GeneratedTrack) => {
    try {
      const response = await fetch(track.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title || track.item_code}-${track.rang}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Téléchargement lancé');
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      toast.error('Erreur de téléchargement');
    }
  }, []);

  // Exporter l'historique en JSON
  const handleExportHistory = useCallback((format: 'json' | 'csv' = 'json') => {
    try {
      const exportData = filteredHistory.map(track => ({
        title: track.title || `${track.item_code} - ${track.rang}`,
        item_code: track.item_code,
        rang: track.rang,
        style: track.music_style,
        created_at: track.created_at,
        is_favorite: track.is_favorite || false,
        audio_url: track.audio_url
      }));
      
      let content: string;
      let mimeType: string;
      let extension: string;
      
      if (format === 'csv') {
        // Export CSV
        const headers = ['Titre', 'Code Item', 'Rang', 'Style', 'Date', 'Favori', 'URL Audio'];
        const rows = exportData.map(d => [
          `"${d.title}"`,
          d.item_code,
          d.rang,
          d.style,
          new Date(d.created_at).toLocaleDateString('fr-FR'),
          d.is_favorite ? 'Oui' : 'Non',
          d.audio_url
        ]);
        content = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        mimeType = 'text/csv;charset=utf-8';
        extension = 'csv';
      } else {
        // Export JSON
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `med-mng-music-history-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${exportData.length} générations exportées (${extension.toUpperCase()})`);
    } catch (err) {
      console.error('Erreur export:', err);
      toast.error('Erreur lors de l\'export');
    }
  }, [filteredHistory]);

  // === BATCH ACTIONS ===
  const toggleSelection = useCallback((trackId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredHistory.map(t => t.id)));
  }, [filteredHistory]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBatchDeleteClick = useCallback(() => {
    if (selectedIds.size > 0) {
      setBatchDeleteDialogOpen(true);
    }
  }, [selectedIds.size]);

  const handleConfirmBatchDelete = useCallback(async () => {
    if (!user || selectedIds.size === 0) return;
    
    setIsBatchDeleting(true);
    try {
      const idsToDelete = Array.from(selectedIds);
      const { error } = await supabase
        .from('user_generated_music')
        .delete()
        .in('id', idsToDelete)
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory(prev => prev.filter(t => !selectedIds.has(t.id)));
      toast.success(`${idsToDelete.length} génération(s) supprimée(s)`);
      clearSelection();
    } catch (err) {
      console.error('Erreur suppression batch:', err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsBatchDeleting(false);
    }
  }, [user, selectedIds, clearSelection]);

  const handleBatchFavorite = useCallback(async () => {
    if (!user || selectedIds.size === 0) return;
    
    try {
      const idsToUpdate = Array.from(selectedIds);
      const { error } = await supabase
        .from('user_generated_music')
        .update({ is_favorite: true })
        .in('id', idsToUpdate)
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory(prev => prev.map(t => 
        selectedIds.has(t.id) ? { ...t, is_favorite: true } : t
      ));
      toast.success(`${idsToUpdate.length} ajouté(s) aux favoris`);
      clearSelection();
    } catch (err) {
      console.error('Erreur favoris batch:', err);
      toast.error('Erreur lors de la mise à jour');
    }
  }, [user, selectedIds, clearSelection]);

  const handleBatchDownload = useCallback(async () => {
    const tracksToDownload = history.filter(t => selectedIds.has(t.id));
    
    for (const track of tracksToDownload) {
      await handleDownload(track);
      // Petit délai entre les téléchargements
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    clearSelection();
  }, [history, selectedIds, handleDownload, clearSelection]);

  // Historique réservé aux utilisateurs connectés
  if (!user) {
    return (
      <PremiumCard variant="glass" className="p-6 text-center">
        <Music className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          <TranslatedText text="Connectez-vous pour voir votre historique de générations" />
        </p>
      </PremiumCard>
    );
  }

  if (loading) {
    return (
      <PremiumCard variant="glass" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-semibold">Historique</span>
        </div>
        <MusicListSkeleton count={5} />
      </PremiumCard>
    );
  }

  if (history.length === 0) {
    return (
      <PremiumCard variant="glass" className="p-6 text-center">
        <Music className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          <TranslatedText text="Aucune génération récente. Créez votre première musique !" />
        </p>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard variant="glass" className="p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span className="truncate"><TranslatedText text="Historique" /></span>
            <Badge variant="secondary" className="text-xs shrink-0">{filteredHistory.length}</Badge>
          </h3>
          
          <div className="flex items-center gap-1">
            {/* Bouton statistiques */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={showStats ? "default" : "ghost"}
                    onClick={() => setShowStats(!showStats)}
                    className="h-8 w-8 p-0"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showStats ? 'Masquer' : 'Afficher'} statistiques</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Bouton rafraîchir */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setLoading(true);
                      loadHistory();
                    }}
                    disabled={loading}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rafraîchir</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Export buttons - desktop only inline */}
            {filteredHistory.length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportHistory('json')}
                        className="h-8 px-2 text-xs"
                      >
                        <FileDown className="h-3 w-3 mr-1" />
                        JSON
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Exporter en JSON</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportHistory('csv')}
                        className="h-8 px-2 text-xs"
                      >
                        <FileDown className="h-3 w-3 mr-1" />
                        CSV
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Exporter en CSV</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
        
        {/* Statistiques */}
        {showStats && (
          <GenerationStats tracks={history} className="mb-2" />
        )}
        
        {/* Filtres avancés intégrés */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Recherche */}
          <div className="relative flex-1 sm:flex-none sm:w-40">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-10 sm:h-8 text-sm w-full"
            />
          </div>
          
          {/* Composant de filtres avancés */}
          <GenerationFilters
            filter={filter}
            setFilter={setFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            dateRange={dateRange}
            setDateRange={setDateRange}
            styleFilter={styleFilter}
            setStyleFilter={setStyleFilter}
            availableStyles={availableStyles}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
            className="flex-1"
          />
          
          {/* Mobile export buttons */}
          {filteredHistory.length > 0 && (
            <div className="flex sm:hidden gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportHistory('json')}
                className="flex-1 h-10 text-xs"
              >
                <FileDown className="h-3 w-3 mr-1" />
                JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportHistory('csv')}
                className="flex-1 h-10 text-xs"
              >
                <FileDown className="h-3 w-3 mr-1" />
                CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {paginatedHistory.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>Aucune génération {filter !== 'all' || searchQuery ? 'correspondant aux critères' : ''}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {paginatedHistory.map((track) => {
              const isCurrentlyPlaying = currentTrack?.url === track.audio_url && isPlaying;
              
              return (
                <div 
                  key={track.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    selectedIds.has(track.id) 
                      ? 'bg-primary/5 border-primary/40' 
                      : isCurrentlyPlaying 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-card/50 border-border/30 hover:bg-card/80'
                  }`}
                >
                  {/* Checkbox de sélection */}
                  <Checkbox
                    checked={selectedIds.has(track.id)}
                    onCheckedChange={() => toggleSelection(track.id)}
                    className="shrink-0"
                    aria-label={`Sélectionner ${track.title || track.item_code}`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {track.is_favorite && (
                        <Heart className="h-3 w-3 text-destructive fill-destructive" />
                      )}
                      <p className="font-medium text-foreground truncate">
                        {track.title || `${track.item_code} - Rang ${track.rang}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {track.music_style}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {track.rang}
                      </Badge>
                      <span>
                        {formatDistanceToNow(new Date(track.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={isCurrentlyPlaying ? "default" : "outline"}
                      onClick={() => handlePlay(track)}
                      className="h-8 w-8 p-0"
                      aria-label={isCurrentlyPlaying ? "Pause" : "Lecture"}
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(track)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      aria-label="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleFavorite(track.id, track.is_favorite || false)}
                      className={`h-8 w-8 p-0 ${track.is_favorite ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                      aria-label={track.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      <Heart className={`h-4 w-4 ${track.is_favorite ? 'fill-destructive' : ''}`} />
                    </Button>
                    {/* Bouton partage */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShareTrack(track)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      aria-label="Partager"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteClick(track.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} sur {totalPages} ({filteredHistory.length} résultats)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Barre d'actions batch */}
      <BatchActionsBar
        selectedCount={selectedIds.size}
        onDeleteSelected={handleBatchDeleteClick}
        onFavoriteSelected={handleBatchFavorite}
        onDownloadSelected={handleBatchDownload}
        onClearSelection={clearSelection}
        onSelectAll={selectAll}
        totalCount={filteredHistory.length}
        isDeleting={isBatchDeleting}
      />

      {/* Dialog confirmation suppression individuelle */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Supprimer cette génération ?"
        itemCount={1}
      />

      {/* Dialog confirmation suppression batch */}
      <ConfirmDeleteDialog
        open={batchDeleteDialogOpen}
        onOpenChange={setBatchDeleteDialogOpen}
        onConfirm={handleConfirmBatchDelete}
        title="Supprimer les générations sélectionnées ?"
        itemCount={selectedIds.size}
        isLoading={isBatchDeleting}
      />

      {/* Dialog de partage */}
      {shareTrack && (
        <ShareMusicDialog
          trackTitle={shareTrack.title || `${shareTrack.item_code} - Rang ${shareTrack.rang}`}
          trackId={shareTrack.id}
          audioUrl={shareTrack.audio_url}
          open={!!shareTrack}
          onOpenChange={(open) => !open && setShareTrack(null)}
        />
      )}
    </PremiumCard>
  );
};