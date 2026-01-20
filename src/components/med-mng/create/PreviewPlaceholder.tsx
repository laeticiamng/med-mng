import React, { useMemo } from 'react';
import { Music, Waves, Disc3 } from 'lucide-react';

interface PreviewPlaceholderProps {
  selectedTitle: string;
  style?: string;
  duration?: number;
}

export const PreviewPlaceholder: React.FC<PreviewPlaceholderProps> = ({ 
  selectedTitle, 
  style = 'lofi',
  duration = 120 
}) => {
  // Générer une prévisualisation de waveform déterministe basée sur le style
  const waveformPreview = useMemo(() => {
    const points = 40;
    return Array.from({ length: points }, (_, i) => {
      const progress = i / points;
      // Différents patterns selon le style
      let amplitude = 0;
      switch (style) {
        case 'epic':
          amplitude = 40 + Math.sin(progress * Math.PI * 8) * 30 + Math.sin(progress * Math.PI * 2) * 20;
          break;
        case 'pop':
          amplitude = 50 + Math.sin(progress * Math.PI * 12) * 25;
          break;
        case 'classical':
          amplitude = 30 + Math.sin(progress * Math.PI * 4) * 20 + Math.cos(progress * Math.PI * 6) * 15;
          break;
        case 'jazz':
          amplitude = 35 + Math.sin(progress * Math.PI * 6) * 25 + Math.sin(progress * Math.PI * 10) * 10;
          break;
        default: // lofi
          amplitude = 45 + Math.sin(progress * Math.PI * 6) * 20;
      }
      return Math.max(10, Math.min(80, amplitude));
    });
  }, [style]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center py-8">
      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex flex-col items-center justify-center mb-4 relative overflow-hidden">
        {/* Waveform preview */}
        <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-4 opacity-30">
          {waveformPreview.map((height, i) => (
            <div
              key={i}
              className="bg-primary rounded-full transition-all duration-300"
              style={{
                width: '3px',
                height: `${height}%`,
                opacity: 0.5 + (height / 160)
              }}
            />
          ))}
        </div>
        
        {/* Icon central */}
        <div className="relative z-10 bg-background/80 backdrop-blur-sm rounded-full p-4 mb-3">
          {selectedTitle ? (
            <Disc3 className="h-12 w-12 text-primary animate-pulse" />
          ) : (
            <Music className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        
        {/* Info */}
        <div className="relative z-10 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-sm font-medium">
            {selectedTitle || 'Aucun titre sélectionné'}
          </p>
          {selectedTitle && (
            <div className="flex items-center justify-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Waves className="h-3 w-3" />
                {style}
              </span>
              <span>{formatDuration(duration)}</span>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm">
        {selectedTitle ? 
          'Cliquez sur "Générer" pour créer votre musique' : 
          'Sélectionnez vos paramètres pour commencer'
        }
      </p>
    </div>
  );
};
