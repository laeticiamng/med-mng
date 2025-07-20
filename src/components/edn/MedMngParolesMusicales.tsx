
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMedMngMusicGeneration } from '@/hooks/useMedMngMusicGeneration';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { ParolesMusicalesDebugInfo } from './music/ParolesMusicalesDebugInfo';
import { MedMngParolesMusicalesHeader } from './music/MedMngParolesMusicalesHeader';
import { MedMngParolesMusicalesControls } from './music/MedMngParolesMusicalesControls';
import { MedMngParolesMusicalesErrorSection } from './music/MedMngParolesMusicalesErrorSection';
import { MedMngParolesMusicalesContent } from './music/MedMngParolesMusicalesContent';

interface MedMngParolesMusicalesProps {
  paroles?: string[];
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const MedMngParolesMusicales: React.FC<MedMngParolesMusicalesProps> = ({
  paroles = [],
  itemCode,
  tableauRangA,
  tableauRangB
}) => {
  console.log('🎵 MedMngParolesMusicales - Rendu avec props:', { 
    paroles: paroles?.length, 
    itemCode, 
    hasTableauA: !!tableauRangA, 
    hasTableauB: !!tableauRangB 
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
    console.log(`🎵 BOUTON GÉNÉRER CLIQUÉ - Rang ${rang}`);
    
    if (!paroles || paroles.length === 0) {
      console.error('❌ AUCUNE PAROLE DISPONIBLE');
      return;
    }

    const parolesIndex = rang === 'A' ? 0 : 1;
    if (!paroles[parolesIndex]) {
      console.error(`❌ AUCUNE PAROLE POUR LE RANG ${rang}`);
      return;
    }

    try {
      console.log('🚀 APPEL generateMusicInLanguage via MED-MNG...');
      const result = await generateMusicInLanguage(
        rang, 
        paroles, 
        selectedStyle, 
        musicDuration, 
        itemCode
      );
      console.log(`✅ GÉNÉRATION MED-MNG TERMINÉE POUR RANG ${rang}:`, result);
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION MED-MNG RANG ${rang}:`, error);
    }
  };

  const handlePlayAudio = (audioUrl: string, title: string) => {
    console.log('🎵 BOUTON PLAY CLIQUÉ (MED-MNG):', {
      audioUrl: audioUrl?.substring(0, 100) + '...',
      title,
      isStreaming: audioUrl?.includes('/songs/') && audioUrl?.includes('/stream')
    });

    if (!audioUrl) {
      console.error('❌ URL AUDIO MANQUANTE');
      return;
    }

    if (currentTrack?.url === audioUrl && isPlaying) {
      console.log('⏸️ PAUSE DE L\'AUDIO EN COURS');
      pause();
    } else {
      console.log('▶️ LECTURE DU STREAMING SÉCURISÉ MED-MNG');
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
