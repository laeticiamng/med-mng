
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMedMngMusicGeneration } from '@/hooks/useMedMngMusicGeneration';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { logger } from '@/utils/structuredLogger';
import { ParolesMusicalesDebugInfo } from './music/ParolesMusicalesDebugInfo';
import { MedMngParolesMusicalesHeader } from './music/MedMngParolesMusicalesHeader';
import { MedMngParolesMusicalesControls } from './music/MedMngParolesMusicalesControls';
import { MedMngParolesMusicalesErrorSection } from './music/MedMngParolesMusicalesErrorSection';
import { MedMngParolesMusicalesContent } from './music/MedMngParolesMusicalesContent';

interface MedMngParolesMusicalesProps {
  paroles?: string[];
  itemCode: string;
  tableauRangA?: Record<string, unknown>;
  tableauRangB?: Record<string, unknown>;
}

export const MedMngParolesMusicales: React.FC<MedMngParolesMusicalesProps> = ({
  paroles = [],
  itemCode,
  tableauRangA,
  tableauRangB
}) => {
  logger.debug('MedMngParolesMusicales rendu', {
    component: 'MedMngParolesMusicales',
    metadata: {
      parolesCount: paroles?.length,
      itemCode,
      hasTableauA: !!tableauRangA,
      hasTableauB: !!tableauRangB
    }
  });

  const [selectedStyle, setSelectedStyle] = useState<string>('lofi-piano');
  const [musicDuration, setMusicDuration] = useState<number>(240);

  const {
    isGenerating,
    generatedAudio,
    lastError,
    generateMusicInLanguage,
    currentLanguage
  } = useMedMngMusicGeneration();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    seek,
    changeVolume,
    stop
  } = useGlobalAudio();

  const handleGenerate = async (rang: 'A' | 'B') => {
    logger.info('Génération musicale MED-MNG', {
      component: 'MedMngParolesMusicales',
      action: 'handleGenerate',
      metadata: { rang, itemCode }
    });
    
    if (!paroles || paroles.length === 0) {
      logger.error('Aucune parole disponible', {
        component: 'MedMngParolesMusicales',
        itemCode
      });
      return;
    }

    const parolesIndex = rang === 'A' ? 0 : 1;
    if (!paroles[parolesIndex]) {
      logger.error(`Aucune parole pour rang ${rang}`, {
        component: 'MedMngParolesMusicales',
        metadata: { rang, itemCode }
      });
      return;
    }

    try {
      logger.info('Appel generateMusicInLanguage via MED-MNG', {
        component: 'MedMngParolesMusicales',
        metadata: { rang, itemCode }
      });
      const result = await generateMusicInLanguage(
        rang, 
        paroles, 
        selectedStyle, 
        musicDuration, 
        itemCode
      );
      logger.info('Génération MED-MNG terminée', {
        component: 'MedMngParolesMusicales',
        metadata: { rang, itemCode, result: !!result }
      });
      
    } catch (error) {
      logger.error(`Erreur génération MED-MNG rang ${rang}`, {
        component: 'MedMngParolesMusicales',
        metadata: { rang, itemCode }
      });
    }
  };

  const handlePlayAudio = (audioUrl: string, title: string) => {
    logger.debug('Bouton play cliqué MED-MNG', {
      component: 'MedMngParolesMusicales',
      metadata: {
        audioUrl: audioUrl?.substring(0, 100) + '...',
        title,
        isStreaming: audioUrl?.includes('/songs/') && audioUrl?.includes('/stream')
      }
    });

    if (!audioUrl) {
      logger.error('URL audio manquante', {
        component: 'MedMngParolesMusicales'
      });
      return;
    }

    if (currentTrack?.url === audioUrl && isPlaying) {
      logger.debug('Pause de l\'audio en cours', {
        component: 'MedMngParolesMusicales'
      });
      pause();
    } else {
      logger.debug('Lecture du streaming sécurisé MED-MNG', {
        component: 'MedMngParolesMusicales',
        metadata: { audioUrl: audioUrl.substring(0, 50) }
      });
      play({
        url: audioUrl,
        title: title,
        rang: audioUrl.includes('rangA') ? 'A' : 'B'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <MedMngParolesMusicalesHeader
          itemCode={itemCode}
          currentLanguage={currentLanguage}
        />
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

            <MedMngParolesMusicalesControls
              selectedStyle={selectedStyle}
              musicDuration={musicDuration}
              onStyleChange={setSelectedStyle}
              onDurationChange={setMusicDuration}
            />

            <MedMngParolesMusicalesErrorSection lastError={lastError} />

            <MedMngParolesMusicalesContent
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
