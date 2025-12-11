import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratedSongDisplay } from './GeneratedSongDisplay';
import { PreviewPlaceholder } from './PreviewPlaceholder';
import { useActivityTracking } from '@/hooks/useActivityTracking';

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
  
  useEffect(() => {
    if (generatedSong) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'song_preview', style, title: selectedTitle }
      });
    }
  }, [generatedSong]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {generatedSong ? 'Chanson générée' : 'Aperçu'}
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
