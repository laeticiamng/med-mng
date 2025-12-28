import React, { useState, useEffect } from 'react';
import { Clock, Music, Play, Trash2 } from 'lucide-react';
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

interface GeneratedTrack {
  id: string;
  item_code: string;
  rang: string;
  music_style: string;
  audio_url: string;
  created_at: string;
  title?: string;
}

export const GenerationHistory: React.FC = () => {
  const { user } = useAuth();
  const { play, currentTrack, isPlaying, pause } = useGlobalAudio();
  const [history, setHistory] = useState<GeneratedTrack[]>([]);
  const [loading, setLoading] = useState(true);

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
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  };

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
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <TranslatedText text="Historique des générations" />
        <Badge variant="secondary">{history.length}</Badge>
      </h3>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {history.map((track) => {
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
                <p className="font-medium text-foreground truncate">
                  {track.title || `${track.item_code} - Rang ${track.rang}`}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {track.music_style}
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
                >
                  <Play className={`h-4 w-4 ${isCurrentlyPlaying ? 'animate-pulse' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(track.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </PremiumCard>
  );
};