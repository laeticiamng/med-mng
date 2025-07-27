
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
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const ParolesMusicales: React.FC<ParolesMusicalesProps> = ({
  paroles = [],
  paroles_rang_a,
  paroles_rang_b,
  paroles_rang_ab,
  itemCode,
  tableauRangA,
  tableauRangB
}) => {
  console.log('🎵 ParolesMusicales - Rendu avec props:', { 
    paroles: paroles?.length,
    paroles_rang_a: paroles_rang_a?.length,
    paroles_rang_b: paroles_rang_b?.length,
    paroles_rang_ab: paroles_rang_ab?.length,
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
    pollingTracks,
    generationProgress,
    lastError,
    currentLanguage,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    handleGenerate,
    handleGenerateMix,
    handlePlayAudio,
    seek,
    changeVolume,
    stop
  } = useParolesMusicales(paroles, { 
    paroles_rang_a, 
    paroles_rang_b, 
    paroles_rang_ab, 
    item_code: itemCode 
  });

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
              paroles={
                // Utiliser uniquement les nouvelles paroles structurées
                paroles_rang_a && paroles_rang_b 
                  ? [paroles_rang_a.join('\n'), paroles_rang_b.join('\n')]
                  : paroles_rang_a 
                    ? [paroles_rang_a.join('\n'), '']
                    : paroles_rang_b
                      ? ['', paroles_rang_b.join('\n')]
                      : []
              }
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
              onGenerateMix={handleGenerateMix}
              onPlayAudio={handlePlayAudio}
              onSeek={seek}
              onVolumeChange={changeVolume}
              onStop={stop}
              pollingTracks={pollingTracks}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
