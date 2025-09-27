import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KaraokePlayerProps {
  songId?: string;
  currentTime?: number;
  isPlaying?: boolean;
  onSeek?: (time: number) => void;
  className?: string;
}

export const KaraokePlayer: React.FC<KaraokePlayerProps> = ({ 
  songId, 
  currentTime, 
  isPlaying, 
  onSeek,
  className 
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Karaoke Player</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Karaoke functionality for song {songId} coming soon...
        </p>
        {currentTime !== undefined && (
          <p className="text-sm">Current time: {currentTime}s</p>
        )}
        {isPlaying !== undefined && (
          <p className="text-sm">Status: {isPlaying ? 'Playing' : 'Paused'}</p>
        )}
      </CardContent>
    </Card>
  );
};