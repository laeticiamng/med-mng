
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, AlertTriangle, Loader2, Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';
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
      await generateMusicInLanguage(rang, paroles, selectedStyle, musicDuration);
      console.log(`✅ GÉNÉRATION TERMINÉE POUR RANG ${rang}`);
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION RANG ${rang}:`, error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayAudio = (audioUrl: string, title: string) => {
    console.log('🎵 BOUTON PLAY CLIQUÉ:', {
      audioUrl: audioUrl?.substring(0, 100) + '...',
      title,
      currentTrack: currentTrack?.url?.substring(0, 100) + '...',
      isPlaying,
      audioUrlValid: !!audioUrl && audioUrl.startsWith('http')
    });

    // Vérifications détaillées
    if (!audioUrl) {
      console.error('❌ URL AUDIO MANQUANTE');
      return;
    }

    if (!audioUrl.startsWith('http')) {
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
            {/* Informations de debug étendues */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Debug Info Suno</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>Item Code: {itemCode}</p>
                <p>Paroles disponibles: {paroles?.length || 0}</p>
                <p>Langue actuelle: {currentLanguage}</p>
                <p>Style sélectionné: {selectedStyle}</p>
                <p>Durée: {formatDuration(musicDuration)}</p>
                <p>Génération Rang A: {isGenerating.rangA ? '🔄 En cours...' : '⏸️ Arrêtée'}</p>
                <p>Génération Rang B: {isGenerating.rangB ? '🔄 En cours...' : '⏸️ Arrêtée'}</p>
                <p>Audio Rang A: {generatedAudio.rangA ? '✅ URL Disponible' : '❌ Non généré'}</p>
                <p>Audio Rang B: {generatedAudio.rangB ? '✅ URL Disponible' : '❌ Non généré'}</p>
                {generatedAudio.rangA && (
                  <p className="break-all">URL A: {generatedAudio.rangA.substring(0, 80)}...</p>
                )}
                {generatedAudio.rangB && (
                  <p className="break-all">URL B: {generatedAudio.rangB.substring(0, 80)}...</p>
                )}
                <p>Erreur: {lastError || 'Aucune'}</p>
              </div>
            </div>

            {/* Sélecteurs de style et durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Style musical Suno :</label>
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
                            Génération Suno en cours...
                          </>
                        ) : (
                          `Générer avec Suno Rang A (${formatDuration(musicDuration)})`
                        )}
                      </Button>

                      {generatedAudio.rangA && (
                        <div className="mt-4 space-y-2">
                          {/* Bouton de test simple */}
                          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                            <Button
                              onClick={() => handlePlayAudio(generatedAudio.rangA!, `Rang A - ${itemCode}`)}
                              className="flex items-center gap-2"
                            >
                              {currentTrack?.url === generatedAudio.rangA && isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              Test Audio Suno A
                            </Button>
                            <span className="text-sm text-gray-600">
                              {currentTrack?.url === generatedAudio.rangA && isPlaying ? '🎵 En cours...' : '⏸️ Prêt'}
                            </span>
                          </div>
                          
                          <AudioPlayer
                            audioUrl={generatedAudio.rangA}
                            title={`Suno Rang A - ${itemCode}`}
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
                            Génération Suno en cours...
                          </>
                        ) : (
                          `Générer avec Suno Rang B (${formatDuration(musicDuration)})`
                        )}
                      </Button>

                      {generatedAudio.rangB && (
                        <div className="mt-4 space-y-2">
                          {/* Bouton de test simple */}
                          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                            <Button
                              onClick={() => handlePlayAudio(generatedAudio.rangB!, `Rang B - ${itemCode}`)}
                              className="flex items-center gap-2"
                            >
                              {currentTrack?.url === generatedAudio.rangB && isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              Test Audio Suno B
                            </Button>
                            <span className="text-sm text-gray-600">
                              {currentTrack?.url === generatedAudio.rangB && isPlaying ? '🎵 En cours...' : '⏸️ Prêt'}
                            </span>
                          </div>
                          
                          <AudioPlayer
                            audioUrl={generatedAudio.rangB}
                            title={`Suno Rang B - ${itemCode}`}
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
