
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, AlertTriangle } from 'lucide-react';
import { useMedMngMusicGeneration } from '@/hooks/useMedMngMusicGeneration';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { ParolesMusicalesDebugInfo } from './music/ParolesMusicalesDebugInfo';
import { ParolesMusicalesControls } from './music/ParolesMusicalesControls';
import { ParolesMusicalesRangSection } from './music/ParolesMusicalesRangSection';

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-6 w-6 text-amber-600" />
            Génération Musicale MED-MNG - {itemCode}
          </CardTitle>
          <CardDescription>
            Génération sécurisée avec streaming via MED-MNG en {currentLanguage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Informations de debug */}
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

            {/* Sélecteurs de style et durée */}
            <ParolesMusicalesControls
              selectedStyle={selectedStyle}
              musicDuration={musicDuration}
              onStyleChange={setSelectedStyle}
              onDurationChange={setMusicDuration}
            />

            {/* Affichage des erreurs */}
            {lastError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Erreur MED-MNG</span>
                </div>
                <p className="text-red-700 mt-2">{lastError}</p>
              </div>
            )}

            {/* Paroles et boutons de génération */}
            {paroles && paroles.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Paroles disponibles pour MED-MNG :</h3>
                
                {paroles[0] && (
                  <ParolesMusicalesRangSection
                    rang="A"
                    paroles={paroles[0]}
                    musicDuration={musicDuration}
                    isGenerating={isGenerating.rangA}
                    generatedAudio={generatedAudio.rangA}
                    itemCode={itemCode}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    volume={volume}
                    onGenerate={() => handleGenerate('A')}
                    onPlayAudio={handlePlayAudio}
                    onSeek={seek}
                    onVolumeChange={changeVolume}
                    onStop={stop}
                  />
                )}

                {paroles[1] && (
                  <ParolesMusicalesRangSection
                    rang="B"
                    paroles={paroles[1]}
                    musicDuration={musicDuration}
                    isGenerating={isGenerating.rangB}
                    generatedAudio={generatedAudio.rangB}
                    itemCode={itemCode}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    volume={volume}
                    onGenerate={() => handleGenerate('B')}
                    onPlayAudio={handlePlayAudio}
                    onSeek={seek}
                    onVolumeChange={changeVolume}
                    onStop={stop}
                  />
                )}
              </div>
            )}

            {(!paroles || paroles.length === 0) && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Aucune parole disponible</span>
                </div>
                <p className="text-yellow-700 mt-2">
                  Cet item ne contient pas encore de paroles musicales pour MED-MNG.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
