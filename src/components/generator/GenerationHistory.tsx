import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Music, Play, Pause, Trash2, Filter, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PremiumCard } from '@/components/ui/premium-card';
import { TranslatedText } from '@/components/TranslatedText';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export const GenerationHistory: React.FC = () => {
  const { user } = useAuth();
  const { play, currentTrack, isPlaying, pause } = useGlobalAudio();
  const [history, setHistory] = useState<GeneratedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_generated_music')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  };

  // Filtrer l'historique
  const filteredHistory = useMemo(() => {
    return history.filter(track => {
      switch (filter) {
        case 'favorites':
          return track.is_favorite === true;
        case 'rang_a':
          return track.rang === 'A';
        case 'rang_b':
          return track.rang === 'B';
        case 'rang_ab':
          return track.rang === 'AB';
        default:
          return true;
      }
    });
  }, [history, filter]);

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
    } catch {
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
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (!user) {
    return (
      <PremiumCard variant="glass" className="p-6 text-center">
        <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <TranslatedText text="Historique des générations" />
          <Badge variant="secondary">{filteredHistory.length}</Badge>
        </h3>
        
        {/* Filtre */}
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>Aucune génération {filter !== 'all' ? 'correspondant au filtre' : ''}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {filteredHistory.map((track) => {
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

                <div className="flex items-center gap-2">
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
      )}
    </PremiumCard>
  );
};