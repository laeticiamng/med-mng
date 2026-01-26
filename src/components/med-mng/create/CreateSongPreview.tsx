import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratedSongDisplay } from './GeneratedSongDisplay';
import { PreviewPlaceholder } from './PreviewPlaceholder';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Music, Flame, Star } from 'lucide-react';

interface CreateSongPreviewProps {
  generatedSong: any;
  style: string;
  selectedTitle: string;
  onPlay: () => void;
  onAddToLibrary: () => void;
}

export const CreateSongPreview: React.FC<CreateSongPreviewProps> = ({
  generatedSong,
  style,
  selectedTitle,
  onPlay,
  onAddToLibrary
}) => {
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);
  
  useEffect(() => {
    const trackGeneration = async () => {
      if (generatedSong && !hasTrackedRef.current) {
        hasTrackedRef.current = true;
        logActivity({
          activity_type: 'music_generation',
          count: 1,
          metadata: { component: 'song_preview', style, title: selectedTitle }
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await addPoints(user.id, 'itemMastered');
        }
      }
    };
    trackGeneration();
  }, [generatedSong]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            {generatedSong ? 'Chanson générée' : 'Aperçu'}
          </div>
          {stats && generatedSong && (
            <div className="flex items-center gap-2 px-2 py-1 bg-muted/30 rounded-full text-xs">
              <Flame className="h-3 w-3 text-warning" />
              <span className="font-bold text-warning">{stats.currentStreak}</span>
              <Star className="h-3 w-3 text-primary ml-1" />
              <span className="font-bold text-primary">Nv.{stats.level}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {generatedSong ? (
          <GeneratedSongDisplay
            generatedSong={generatedSong}
            style={style}
            onPlay={onPlay}
            onAddToLibrary={onAddToLibrary}
          />
        ) : (
          <PreviewPlaceholder selectedTitle={selectedTitle} />
        )}
      </CardContent>
    </Card>
  );
};
