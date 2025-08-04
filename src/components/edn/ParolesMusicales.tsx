
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

  console.log('🎵 DETAILED paroles_rang_a:', paroles_rang_a);
  console.log('🎵 DETAILED paroles_rang_b:', paroles_rang_b);
  
  // Créer le format final qui sera passé à ParolesMusicalesMainContent
  // Si on a des champs spécifiques, les utiliser, sinon utiliser paroles_musicales
  let finalParoles: string[][] = [];
  
  if (paroles_rang_a && paroles_rang_a.length > 0) {
    finalParoles.push(paroles_rang_a);
  }
  if (paroles_rang_b && paroles_rang_b.length > 0) {
    finalParoles.push(paroles_rang_b);
  }
  
  // Si aucune parole spécifique, utiliser paroles_musicales
  if (finalParoles.length === 0 && paroles && paroles.length > 0) {
    // Diviser paroles_musicales en sections Rang A et Rang B si possible
    const allLyrics = Array.isArray(paroles) ? paroles : [paroles];
    finalParoles = [allLyrics]; // Utiliser comme Rang A pour l'instant
    
    console.log('🎵 Utilisation de paroles_musicales comme fallback:', {
      originalParoles: paroles,
      finalParoles
    });
  }
        
  console.log('🎵 FINAL paroles qui vont être passées:', finalParoles);

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
  } = useParolesMusicales([], { 
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

            <ParolesMusicalesErrorSection 
              lastError={lastError} 
              itemCode={itemCode}
              hasNoLyrics={finalParoles.length === 0 || finalParoles.every(p => !p || p.length === 0)}
            />

            <ParolesMusicalesMainContent
              paroles={finalParoles.length > 0 ? finalParoles : (paroles && paroles.length > 0 ? [paroles] : [])}
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
