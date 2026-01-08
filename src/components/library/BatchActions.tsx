import React, { useState } from 'react';
import { Trash2, Download, Heart, ListPlus, X, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

interface BatchActionsProps {
  selectedIds: string[];
  songs: any[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  selectedIds,
  songs,
  onClearSelection,
  onActionComplete,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const selectedSongs = songs.filter(s => selectedIds.includes(s.id));

  // Télécharger toutes les chansons sélectionnées
  const handleBatchDownload = async () => {
    if (selectedSongs.length === 0) return;
    
    setLoading(true);
    let downloaded = 0;
    
    for (const song of selectedSongs) {
      try {
        const audioUrl = song.meta?.audio_url || `https://cdn1.suno.ai/${song.suno_audio_id}.mp3`;
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song.title || 'song'}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        downloaded++;
        
        // Petit délai entre les téléchargements
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error('Erreur téléchargement:', song.title, err);
      }
    }
    
    setLoading(false);
    toast.success(`${downloaded}/${selectedSongs.length} chansons téléchargées`);
    onClearSelection();
  };

  // Ajouter toutes aux favoris via user_generated_music
  const handleBatchFavorite = async () => {
    if (!user || selectedSongs.length === 0) return;
    
    setLoading(true);
    try {
      // Mettre à jour is_favorite dans user_generated_music
      const { error } = await supabase
        .from('user_generated_music')
        .update({ is_favorite: true } as any)
        .in('id', selectedIds)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success(`${selectedSongs.length} chansons ajoutées aux favoris`);
      onActionComplete();
      onClearSelection();
    } catch (err) {
      console.error('Erreur favoris batch:', err);
      toast.error('Erreur lors de l\'ajout aux favoris');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer toutes les chansons sélectionnées de user_generated_music
  const handleBatchDelete = async () => {
    if (!user || selectedSongs.length === 0) return;
    
    if (!confirm(`Supprimer ${selectedSongs.length} chansons de votre bibliothèque ?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_generated_music')
        .delete()
        .in('id', selectedIds)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success(`${selectedSongs.length} chansons supprimées`);
      onActionComplete();
      onClearSelection();
    } catch (err) {
      console.error('Erreur suppression batch:', err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border shadow-lg rounded-xl px-4 py-3 flex items-center gap-3">
        <Badge variant="secondary" className="gap-1">
          <CheckSquare className="h-3 w-3" />
          {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
        </Badge>
        
        <div className="h-6 w-px bg-border" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBatchDownload}
          disabled={loading}
          className="h-9"
        >
          <Download className="h-4 w-4 mr-1" />
          Télécharger
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBatchFavorite}
          disabled={loading}
          className="h-9"
        >
          <Heart className="h-4 w-4 mr-1" />
          Favoris
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBatchDelete}
          disabled={loading}
          className="h-9 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
        
        <div className="h-6 w-px bg-border" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-9"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
