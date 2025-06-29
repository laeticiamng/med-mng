
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, AlertTriangle, Loader2 } from 'lucide-react';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { AudioPlayer } from './AudioPlayer';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { musicStyles } from './music/MusicStylesData';

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

  // Contexte audio global pour le lecteur - utilisation des bons noms de méthodes
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
    console.log(`🎵 Génération demandée pour Rang ${rang}:`, {
      selectedStyle,
      musicDuration,
      parolesLength: paroles?.length || 0,
      currentLanguage
    });

    if (!paroles || paroles.length === 0) {
      console.error('❌ Aucune parole disponible');
      return;
    }

    const parolesIndex = rang === 'A' ? 0 : 1;
    if (!paroles[parolesIndex]) {
      console.error(`❌ Aucune parole pour le Rang ${rang}`);
      return;
    }

    try {
      await generateMusicInLanguage(rang, paroles, selectedStyle, musicDuration);
      console.log(`✅ Génération lancée pour Rang ${rang}`);
    } catch (error) {
      console.error(`❌ Erreur génération Rang ${rang}:`, error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayAudio = (audioUrl: string, title: string) => {
    if (currentTrack?.url === audioUrl && isPlaying) {
      pause();
    } else {
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
            Génération Musicale - {itemCode}
          </CardTitle>
          <CardDescription>
            Génération de musique avec paroles chantées en {currentLanguage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Informations de debug */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Page chargée avec succès</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>Item Code: {itemCode}</p>
                <p>Paroles disponibles: {paroles?.length || 0}</p>
                <p>Langue actuelle: {currentLanguage}</p>
                <p>Style sélectionné: {selectedStyle}</p>
                <p>Durée: {formatDuration(musicDuration)}</p>
              </div>
            </div>

            {/* Sélecteurs de style et durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Style musical :</label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {musicStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label} - {style.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Durée :</label>
                <Select value={musicDuration.toString()} onValueChange={(value) => setMusicDuration(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="120">2:00 - Court</SelectItem>
                    <SelectItem value="180">3:00 - Standard</SelectItem>
                    <SelectItem value="240">4:00 - Long</SelectItem>
                    <SelectItem value="300">5:00 - Étendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Affichage des erreurs */}
            {lastError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Erreur de génération</span>
                </div>
                <p className="text-red-700 mt-2">{lastError}</p>
              </div>
            )}

            {/* Paroles et boutons de génération */}
            {paroles && paroles.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Paroles disponibles :</h3>
                
                {paroles[0] && (
                  <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                    <h4 className="font-medium text-amber-800 mb-2">Rang A :</h4>
                    <p className="text-sm text-amber-700 whitespace-pre-wrap mb-4">
                      {paroles[0].substring(0, 200)}
                      {paroles[0].length > 200 && '...'}
                    </p>
                    
                    <div className="space-y-3">
                      <Button 
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => handleGenerate('A')}
                        disabled={isGenerating.rangA}
                      >
                        {isGenerating.rangA ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Génération en cours...
                          </>
                        ) : (
                          `Générer Musique Rang A (${formatDuration(musicDuration)})`
                        )}
                      </Button>

                      {generatedAudio.rangA && (
                        <div className="mt-4">
                          <AudioPlayer
                            audioUrl={generatedAudio.rangA}
                            title={`Rang A - ${itemCode}`}
                            isPlaying={currentTrack?.url === generatedAudio.rangA && isPlaying}
                            currentTime={currentTrack?.url === generatedAudio.rangA ? currentTime : 0}
                            duration={currentTrack?.url === generatedAudio.rangA ? duration : musicDuration}
                            volume={volume}
                            onPlayPause={() => handlePlayAudio(generatedAudio.rangA!, `Rang A - ${itemCode}`)}
                            onSeek={seek}
                            onVolumeChange={changeVolume}
                            onStop={stop}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {paroles[1] && (
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium text-blue-800 mb-2">Rang B :</h4>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap mb-4">
                      {paroles[1].substring(0, 200)}
                      {paroles[1].length > 200 && '...'}
                    </p>
                    
                    <div className="space-y-3">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleGenerate('B')}
                        disabled={isGenerating.rangB}
                      >
                        {isGenerating.rangB ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Génération en cours...
                          </>
                        ) : (
                          `Générer Musique Rang B (${formatDuration(musicDuration)})`
                        )}
                      </Button>

                      {generatedAudio.rangB && (
                        <div className="mt-4">
                          <AudioPlayer
                            audioUrl={generatedAudio.rangB}
                            title={`Rang B - ${itemCode}`}
                            isPlaying={currentTrack?.url === generatedAudio.rangB && isPlaying}
                            currentTime={currentTrack?.url === generatedAudio.rangB ? currentTime : 0}
                            duration={currentTrack?.url === generatedAudio.rangB ? duration : musicDuration}
                            volume={volume}
                            onPlayPause={() => handlePlayAudio(generatedAudio.rangB!, `Rang B - ${itemCode}`)}
                            onSeek={seek}
                            onVolumeChange={changeVolume}
                            onStop={stop}
                          />
                        </div>
                      )}
                    </div>
                  </div>
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
                  Cet item ne contient pas encore de paroles musicales.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
