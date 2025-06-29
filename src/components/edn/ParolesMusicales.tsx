
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';
import { useParolesMusicales } from '@/hooks/useParolesMusicales';
import { ParolesMusicalesDebugInfo } from './music/ParolesMusicalesDebugInfo';
import { ParolesMusicalesControls } from './music/ParolesMusicalesControls';
import { ParolesMusicalesErrorSection } from './music/ParolesMusicalesErrorSection';
import { ParolesMusicalesMainContent } from './music/ParolesMusicalesMainContent';

interface ParolesMusicalesProps {
  paroles?: string[];
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const ParolesMusicales: React.FC<ParolesMusicalesProps> = ({
  paroles = [],
  itemCode,
  tableauRangA,
  tableauRangB
}) => {
  console.log('🎵 ParolesMusicales - Rendu avec props:', { 
    paroles: paroles?.length, 
    itemCode, 
    hasTableauA: !!tableauRangA, 
    hasTableauB: !!tableauRangB 
  });

  const {
    selectedStyle,
    setSelectedStyle,
    musicDuration,
    setMusicDuration,
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    currentLanguage,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    handleGenerate,
    handlePlayAudio,
    seek,
    changeVolume,
    stop
  } = useParolesMusicales(paroles);

  console.log('🎵 ÉTAT ACTUEL generatedAudio:', generatedAudio);
  console.log('🎵 ÉTAT ACTUEL generationProgress:', generationProgress);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-6 w-6 text-amber-600" />
            Génération Musicale Suno AI - {itemCode}
          </CardTitle>
          <CardDescription>
            Génération de musique avec paroles chantées en {currentLanguage} via Suno AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ParolesMusicalesDebugInfo
              itemCode={itemCode}
              paroles={paroles}
              currentLanguage={currentLanguage}
              selectedStyle={selectedStyle}
              musicDuration={musicDuration}
              isGenerating={isGenerating}
              generatedAudio={generatedAudio}
              lastError={lastError}
            />

            <ParolesMusicalesControls
              selectedStyle={selectedStyle}
              musicDuration={musicDuration}
              onStyleChange={setSelectedStyle}
              onDurationChange={setMusicDuration}
            />

            <ParolesMusicalesErrorSection lastError={lastError} />

            <ParolesMusicalesMainContent
              paroles={paroles}
              itemCode={itemCode}
              musicDuration={musicDuration}
              selectedStyle={selectedStyle}
              isGenerating={isGenerating}
              generatedAudio={generatedAudio}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              generationProgress={generationProgress}
              onGenerate={handleGenerate}
              onPlayAudio={handlePlayAudio}
              onSeek={seek}
              onVolumeChange={changeVolume}
              onStop={stop}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
