import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, Music, Play, Pause, Trash2, Filter, Heart, Search, Download, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PremiumCard } from '@/components/ui/premium-card';
import { TranslatedText } from '@/components/TranslatedText';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

type FilterType = 'all' | 'favorites' | 'rang_a' | 'rang_b' | 'rang_ab';

const ITEMS_PER_PAGE = 10;

export const GenerationHistory: React.FC = () => {
  const { user } = useAuth();
  const { play, currentTrack, isPlaying, pause } = useGlobalAudio();
  const [history, setHistory] = useState<GeneratedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      // Charger depuis les deux sources en parallèle
      // Pour user_generated_music, filtrer par user_id si connecté
      // Pour generated_music_tracks, charger les récentes (même sans user_id) + celles de l'utilisateur
      const queries = [];
      
      if (user) {
        queries.push(
          supabase
            .from('user_generated_music')
            .select('id, item_code, rang, music_style, audio_url, created_at, title, is_favorite')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)
        );
        
        // Charger les tracks de l'utilisateur OU les récentes (pour associer les générations anonymes)
        queries.push(
          supabase
            .from('generated_music_tracks')
            .select('id, task_id, title, audio_url, duration, generation_status, metadata, created_at, user_id')
            .eq('generation_status', 'completed')
            .not('audio_url', 'is', null)
            .order('created_at', { ascending: false })
            .limit(50)
        );
      } else {
        // Utilisateur non connecté : charger les 10 dernières générations
        queries.push(Promise.resolve({ data: [], error: null }));
        queries.push(
          supabase
            .from('generated_music_tracks')
            .select('id, task_id, title, audio_url, duration, generation_status, metadata, created_at')
            .eq('generation_status', 'completed')
            .not('audio_url', 'is', null)
            .order('created_at', { ascending: false })
            .limit(10)
        );
      }
      
      const [userMusicResult, generatedTracksResult] = await Promise.all(queries);

      // Combiner les résultats en évitant les doublons par audio_url
      const userMusic = (userMusicResult as any).data || [];
      const generatedTracks = ((generatedTracksResult as any).data || [])
        .filter((track: any) => {
          // Si connecté, montrer ses tracks + les récentes sans user_id (dans les 24h)
          if (user) {
            const isOwned = track.user_id === user.id;
            const isRecent = new Date(track.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
            const isAnonymous = !track.user_id;
            return isOwned || (isAnonymous && isRecent);
          }
          return true;
        })
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

  // Filtrer et rechercher dans l'historique
  const filteredHistory = useMemo(() => {
    let filtered = history.filter(track => {
      // Filtre par type
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
      
      // Filtre par recherche
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          (track.title?.toLowerCase().includes(query)) ||
          (track.item_code?.toLowerCase().includes(query)) ||
          (track.music_style?.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
    
    return filtered;
  }, [history, filter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHistory, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

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

  const handleDelete = async (trackId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_generated_music')
        .delete()
        .eq('id', trackId)
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory(prev => prev.filter(t => t.id !== trackId));
      toast.success('Génération supprimée');
    } catch (err) {
      console.error('Erreur suppression:', err);
      toast.error('Erreur lors de la suppression');
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
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          <span>Chargement de l'historique...</span>
        </div>
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
    <PremiumCard variant="glass" className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <TranslatedText text="Historique des générations" />
          <Badge variant="secondary">{filteredHistory.length}</Badge>
        </h3>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-40 text-sm"
            />
          </div>
          
          {/* Filtre */}
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="favorites">❤️ Favoris</SelectItem>
              <SelectItem value="rang_a">Rang A</SelectItem>
              <SelectItem value="rang_b">Rang B</SelectItem>
            <SelectItem value="rang_ab">Rang A+B</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Boutons Export JSON + CSV */}
          {filteredHistory.length > 0 && (
            <div className="flex items-center gap-1">
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
                    <p>Exporter en CSV (Excel)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isCurrentlyPlaying 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-card/50 border-border/30 hover:bg-card/80'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {track.is_favorite && (
                        <Heart className="h-3 w-3 text-destructive fill-destructive" />
                      )}
                      <p className="font-medium text-foreground truncate">
                        {track.title || `${track.item_code} - Rang ${track.rang}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(track.id)}
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
    </PremiumCard>
  );
};