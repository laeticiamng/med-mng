
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratedSongDisplay } from './GeneratedSongDisplay';
import { PreviewPlaceholder } from './PreviewPlaceholder';

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
