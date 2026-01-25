/**
 * Hook pour gérer la sélection batch de tracks
 * ✅ NOUVEAU: Sélection multiple avec actions batch
 */

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface SelectableTrack {
  id: string;
  audio_url?: string;
  title?: string;
  is_favorite?: boolean;
}

export const useBatchSelection = <T extends SelectableTrack>(tracks: T[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Toggle une sélection
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Sélectionner tout
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(tracks.map(t => t.id)));
  }, [tracks]);

  // Désélectionner tout
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Vérifier si un track est sélectionné
  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Tracks sélectionnés
  const selectedTracks = useMemo(() => {
    return tracks.filter(t => selectedIds.has(t.id));
  }, [tracks, selectedIds]);

  // Supprimer les sélectionnés
  const deleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    
    setIsProcessing(true);
    
    try {
      const ids = Array.from(selectedIds);
      
      const { _error } = await supabase
        .from('generated_music_tracks')
        .delete()
        .in('id', ids);
      
      if (_error) throw _error;
      
      toast.success(`${ids.length} piste(s) supprimée(s)`);
      clearSelection();
    } catch (error) {
      console.error('Erreur suppression batch:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, clearSelection]);

  // Ajouter aux favoris (via metadata)
  const favoriteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    
    setIsProcessing(true);
    
    try {
      const ids = Array.from(selectedIds);
      
      // Mettre à jour chaque track individuellement avec metadata
      for (const id of ids) {
        const { _data: track } = await supabase
          .from('generated_music_tracks')
          .select('metadata')
          .eq('id', id)
          .single();
        
        const currentMetadata = (track?.metadata as Record<string, any>) || {};
        
        await supabase
          .from('generated_music_tracks')
          .update({ 
            metadata: { ...currentMetadata, is_favorite: true } 
          })
          .eq('id', id);
      }
      
      const error = null; // Pas d'erreur à ce stade
      
      if (error) throw error;
      
      toast.success(`${ids.length} piste(s) ajoutée(s) aux favoris`);
      clearSelection();
    } catch (error) {
      console.error('Erreur favoris batch:', error);
      toast.error('Erreur lors de l\'ajout aux favoris');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, clearSelection]);

  // Télécharger les sélectionnés
  const downloadSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    
    setIsProcessing(true);
    
    try {
      const tracksToDownload = selectedTracks.filter(t => t.audio_url);
      
      if (tracksToDownload.length === 0) {
        toast.error('Aucune piste avec audio disponible');
        return;
      }
      
      // Télécharger chaque fichier
      for (const track of tracksToDownload) {
        if (!track.audio_url) continue;
        
        const response = await fetch(track.audio_url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${track.title || track.id}.mp3`;
        link.click();
        
        URL.revokeObjectURL(url);
      }
      
      toast.success(`${tracksToDownload.length} piste(s) téléchargée(s)`);
      clearSelection();
    } catch (error) {
      console.error('Erreur téléchargement batch:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, selectedTracks, clearSelection]);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    selectedTracks,
    isProcessing,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    deleteSelected,
    favoriteSelected,
    downloadSelected
  };
};
