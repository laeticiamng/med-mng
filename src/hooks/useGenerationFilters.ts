/**
 * Hook pour gérer les filtres et tri de l'historique de génération
 * ✅ NOUVEAU: Filtres par rang, style, date, favoris + tri
 */

import { useState, useMemo, useCallback } from 'react';
import { 
  GenerationFilterType, 
  GenerationSortType, 
  GenerationDateRangeType,
  GeneratedTrack 
} from '@/types/music';

interface UseGenerationFiltersOptions {
  tracks: GeneratedTrack[];
}

export const useGenerationFilters = ({ tracks }: UseGenerationFiltersOptions) => {
  const [filter, setFilter] = useState<GenerationFilterType>('all');
  const [sort, setSort] = useState<GenerationSortType>('date_desc');
  const [dateRange, setDateRange] = useState<GenerationDateRangeType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // Styles disponibles
  const availableStyles = useMemo(() => {
    const styles = new Set(tracks.map(t => t.music_style).filter(Boolean));
    return Array.from(styles).sort();
  }, [tracks]);

  // Filtrage par type
  const filterByType = useCallback((track: GeneratedTrack): boolean => {
    switch (filter) {
      case 'favorites':
        return !!track.is_favorite;
      case 'rang_a':
        return track.rang === 'A';
      case 'rang_b':
        return track.rang === 'B';
      case 'rang_ab':
        return track.rang === 'AB';
      case 'completed':
        return track.generation_status === 'completed';
      case 'generating':
        return track.generation_status === 'generating';
      default:
        return true;
    }
  }, [filter]);

  // Filtrage par date
  const filterByDate = useCallback((track: GeneratedTrack): boolean => {
    if (dateRange === 'all') return true;
    
    const trackDate = new Date(track.created_at);
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return trackDate.toDateString() === now.toDateString();
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return trackDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return trackDate >= monthAgo;
      }
      case 'year': {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return trackDate >= yearAgo;
      }
      default:
        return true;
    }
  }, [dateRange]);

  // Filtrage par style
  const filterByStyle = useCallback((track: GeneratedTrack): boolean => {
    if (selectedStyles.length === 0) return true;
    return selectedStyles.includes(track.music_style);
  }, [selectedStyles]);

  // Filtrage par recherche
  const filterBySearch = useCallback((track: GeneratedTrack): boolean => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      track.title?.toLowerCase().includes(query) ||
      track.item_code?.toLowerCase().includes(query) ||
      track.music_style?.toLowerCase().includes(query) ||
      track.rang?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Tri
  const sortTracks = useCallback((a: GeneratedTrack, b: GeneratedTrack): number => {
    switch (sort) {
      case 'date_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'date_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'title_asc':
        return (a.title || '').localeCompare(b.title || '');
      case 'title_desc':
        return (b.title || '').localeCompare(a.title || '');
      case 'duration_asc':
        return (a.duration || 0) - (b.duration || 0);
      case 'duration_desc':
        return (b.duration || 0) - (a.duration || 0);
      default:
        return 0;
    }
  }, [sort]);

  // Tracks filtrés et triés
  const filteredTracks = useMemo(() => {
    return tracks
      .filter(filterByType)
      .filter(filterByDate)
      .filter(filterByStyle)
      .filter(filterBySearch)
      .sort(sortTracks);
  }, [tracks, filterByType, filterByDate, filterByStyle, filterBySearch, sortTracks]);

  // Stats de filtrage
  const filterStats = useMemo(() => ({
    total: tracks.length,
    filtered: filteredTracks.length,
    favorites: tracks.filter(t => t.is_favorite).length,
    byRang: {
      A: tracks.filter(t => t.rang === 'A').length,
      B: tracks.filter(t => t.rang === 'B').length,
      AB: tracks.filter(t => t.rang === 'AB').length
    }
  }), [tracks, filteredTracks]);

  // Reset tous les filtres
  const resetFilters = useCallback(() => {
    setFilter('all');
    setSort('date_desc');
    setDateRange('all');
    setSearchQuery('');
    setSelectedStyles([]);
  }, []);

  // Nombre de filtres actifs
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filter !== 'all') count++;
    if (dateRange !== 'all') count++;
    if (searchQuery.trim()) count++;
    if (selectedStyles.length > 0) count++;
    return count;
  }, [filter, dateRange, searchQuery, selectedStyles]);

  return {
    // État des filtres
    filter,
    sort,
    dateRange,
    searchQuery,
    selectedStyles,
    
    // Setters
    setFilter,
    setSort,
    setDateRange,
    setSearchQuery,
    setSelectedStyles,
    
    // Résultats
    filteredTracks,
    filterStats,
    availableStyles,
    activeFilterCount,
    
    // Actions
    resetFilters
  };
};
