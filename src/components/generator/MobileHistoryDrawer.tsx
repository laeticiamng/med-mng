/**
 * 📱 Drawer d'historique optimisé mobile
 * Affichage compact et swipable des générations récentes
 */

import { useAuth } from '@/components/med-mng/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, Download, Heart, Pause, Play } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

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

interface MobileHistoryDrawerProps {
  className?: string;
  maxItems?: number;
}

export const MobileHistoryDrawer: React.FC<MobileHistoryDrawerProps> = ({
  className,
  maxItems = 5
}) => {
  const { user } = useAuth();
  const { play, currentTrack, isPlaying, pause } = useGlobalAudio();
  const [isExpanded, setIsExpanded] = useState(false);
  const [tracks, setTracks] = useState<GeneratedTrack[]>([]);
  const [_loading, setLoading] = useState(false);

  // Charger les tracks récents
  const loadTracks = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_generated_music')
        .select('id, item_code, rang, music_style, audio_url, created_at, title, is_favorite')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(maxItems);

      if (error) throw error;
      setTracks(data || []);
    } catch (err) {
      console.error('Erreur chargement tracks:', err);
    } finally {
      setLoading(false);
    }
  }, [user, maxItems]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const handlePlay = useCallback((track: GeneratedTrack) => {
    if (currentTrack?.url === track.audio_url && isPlaying) {
      pause();
    } else {
      play({
        url: track.audio_url,
        title: track.title || `${track.item_code} - ${track.music_style}`,
        rang: track.rang as 'A' | 'B'
      });
    }
  }, [currentTrack, isPlaying, play, pause]);

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
    } catch (err) {
      console.error('Erreur téléchargement:', err);
    }
  }, []);

  if (!user || tracks.length === 0) return null;

  return (
    <div className={cn("fixed bottom-16 left-0 right-0 md:hidden z-40", className)}>
      {/* Barre collapsed */}
      <motion.div
        className="bg-card/95 backdrop-blur-xl border-t border-border shadow-lg px-4 py-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Récents</span>
            <Badge variant="secondary" className="text-xs">{tracks.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      {/* Contenu expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card/95 backdrop-blur-xl border-t border-border overflow-hidden"
          >
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {tracks.map((track) => {
                const isCurrentlyPlaying = currentTrack?.url === track.audio_url && isPlaying;
                
                return (
                  <div
                    key={track.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg transition-colors",
                      isCurrentlyPlaying 
                        ? "bg-primary/10 border border-primary/30" 
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    {/* Play button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlay(track)}
                      className={cn(
                        "h-8 w-8 p-0 rounded-full shrink-0",
                        isCurrentlyPlaying && "bg-primary text-primary-foreground"
                      )}
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    {/* Track info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {track.title || `${track.item_code} - ${track.music_style}`}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge variant="outline" className="h-4 px-1 text-[10px]">
                          {track.rang}
                        </Badge>
                        <span>•</span>
                        <span className="truncate">
                          {formatDistanceToNow(new Date(track.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {track.is_favorite && (
                        <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(track)}
                        className="h-7 w-7 p-0"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
