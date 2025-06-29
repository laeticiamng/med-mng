
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, AlertTriangle } from 'lucide-react';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { ParolesMusicalesDebugInfo } from './music/ParolesMusicalesDebugInfo';
import { ParolesMusicalesControls } from './music/ParolesMusicalesControls';
import { ParolesMusicalesRangSection } from './music/ParolesMusicalesRangSection';

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

  const [selectedStyle, setSelectedStyle] = useState<string>('lofi-piano');
  const [musicDuration, setMusicDuration] = useState<number>(240);

  // Hook pour la génération musicale
  const {
    isGenerating,
    generatedAudio,
    lastError,
    generateMusicInLanguage,
    currentLanguage
  } = useMusicGenerationWithTranslation();

  // Contexte audio global pour le lecteur
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
    console.log(`🎵 Configuration:`, {
      selectedStyle,
      musicDuration,
      parolesLength: paroles?.length || 0,
      currentLanguage,
      parolesPreview: paroles?.[rang === 'A' ? 0 : 1]?.substring(0, 50) + '...' || 'Aucune'
    });

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
      console.log('🚀 APPEL generateMusicInLanguage...');
      const audioUrl = await generateMusicInLanguage(rang, paroles, selectedStyle, musicDuration);
      console.log(`✅ GÉNÉRATION TERMINÉE POUR RANG ${rang}, URL:`, audioUrl);
      
      // Vérification supplémentaire de l'état
      setTimeout(() => {
        console.log('🎵 VÉRIFICATION ÉTAT RETARDÉE generatedAudio:', generatedAudio);
      }, 100);
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION RANG ${rang}:`, error);
    }
  };

  // Fonction pour valider l'URL audio avant lecture
  const isValidAudioUrl = (audioUrl: string): boolean => {
    if (!audioUrl) return false;
    // Accepter les URLs relatives (commençant par /) et les URLs absolues (http/https)
    return audioUrl.startsWith('/') || audioUrl.startsWith('http://') || audioUrl.startsWith('https://');
  };

  const handlePlayAudio = (audioUrl: string, title: string) => {
    console.log('🎵 BOUTON PLAY CLIQUÉ:', {
      audioUrl: audioUrl?.substring(0, 100) + '...',
      title,
      currentTrack: currentTrack?.url?.substring(0, 100) + '...',
      isPlaying,
      audioUrlValid: isValidAudioUrl(audioUrl)
    });

    // Vérifications détaillées
    if (!audioUrl) {
      console.error('❌ URL AUDIO MANQUANTE');
      return;
    }

    if (!isValidAudioUrl(audioUrl)) {
      console.error('❌ URL AUDIO INVALIDE:', audioUrl);
      return;
    }

    // Test de connectivité à l'URL
    console.log('🔍 TEST DE CONNECTIVITÉ AUDIO...');
    const testAudio = new Audio();
    
    testAudio.addEventListener('canplay', () => {
      console.log('✅ AUDIO PEUT ÊTRE LU, URL VALIDE');
    });
    
    testAudio.addEventListener('error', (e) => {
      console.error('❌ ERREUR DE TEST AUDIO:', e);
      console.error('❌ PROBLÈME AVEC L\'URL:', audioUrl);
    });
    
    testAudio.addEventListener('loadstart', () => {
      console.log('🔄 DÉBUT DE CHARGEMENT AUDIO');
    });
    
    testAudio.addEventListener('loadeddata', () => {
      console.log('✅ DONNÉES AUDIO CHARGÉES');
    });
    
    testAudio.src = audioUrl;

    if (currentTrack?.url === audioUrl && isPlaying) {
      console.log('⏸️ PAUSE DE L\'AUDIO EN COURS');
      pause();
    } else {
      console.log('▶️ LECTURE DU NOUVEL AUDIO');
      console.log('🎵 Données transmises au contexte audio:', {
        url: audioUrl,
        title: title,
        rang: audioUrl.includes('rangA') ? 'A' : 'B'
      });
      
      play({
        url: audioUrl,
        title: title,
        rang: audioUrl.includes('rangA') ? 'A' : 'B'
      });
    }
  };

  // Log de l'état pour debug
  console.log('🎵 ÉTAT ACTUEL generatedAudio:', generatedAudio);

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
                  <span className="font-semibold">Erreur de génération Suno</span>
                </div>
                <p className="text-red-700 mt-2">{lastError}</p>
              </div>
            )}

            {/* Paroles et boutons de génération */}
            {paroles && paroles.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Paroles disponibles pour Suno :</h3>
                
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
                  Cet item ne contient pas encore de paroles musicales pour Suno.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
