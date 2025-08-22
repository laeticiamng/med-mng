
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, Download, Library, Bug, Loader2 } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { DebugAudioButton } from './DebugAudioButton';
import { useMusicGenerationStatus } from '@/hooks/useMusicGenerationStatus';
import { Progress } from '@/components/ui/progress';

interface GeneratorMusicPlayerProps {
  generatedSong: any;
  onAddToLibrary: () => void;
  onSongUpdate?: (updatedSong: any) => void;
}

export const GeneratorMusicPlayer: React.FC<GeneratorMusicPlayerProps> = ({
  generatedSong,
  onAddToLibrary,
  onSongUpdate
}) => {
  const { currentTrack, isPlaying, play, pause, resume } = useGlobalAudio();
  const [showDebug, setShowDebug] = useState(false);

  // Détecter si c'est une génération en cours (trackId de 32 caractères hexadécimaux)
  const isTrackId = generatedSong?.audioUrl && 
    typeof generatedSong.audioUrl === 'string' && 
    generatedSong.audioUrl.length === 32 &&
    /^[a-f0-9]{32}$/i.test(generatedSong.audioUrl) &&
    !generatedSong.audioUrl.startsWith('http') && // Exclure les URLs HTTP
    !generatedSong.audioUrl.includes('.'); // Exclure les URLs avec des extensions
  const trackIdForPolling = isTrackId ? generatedSong.audioUrl : null;
  
  console.log('🔍 Détection trackId:', {
    audioUrl: generatedSong?.audioUrl,
    isTrackId,
    trackIdForPolling,
    audioUrlType: typeof generatedSong?.audioUrl
  });
  
  // Utiliser le hook de statut pour suivre la génération
  const { 
    status, 
    isPolling, 
    startPolling, 
    cancelGeneration,
    audioUrl, 
    progress, 
    isGenerating, 
    isTimeout,
    timeoutReached,
    elapsedTime 
  } = useMusicGenerationStatus(trackIdForPolling);

  // Démarrer le polling automatiquement si nécessaire
  useEffect(() => {
    if (trackIdForPolling && !isPolling) {
      console.log('🚀 Démarrage du polling pour trackId:', trackIdForPolling);
      startPolling();
    }
  }, [trackIdForPolling, isPolling, startPolling]);

  // Mettre à jour l'objet song quand l'URL audio finale arrive
  useEffect(() => {
    if (audioUrl && isTrackId && onSongUpdate) {
      console.log('🔄 URL audio finale reçue, mise à jour du song:', {
        trackId: generatedSong.audioUrl,
        finalAudioUrl: audioUrl
      });
      onSongUpdate({ audioUrl });
    }
  }, [audioUrl, isTrackId, onSongUpdate, generatedSong?.audioUrl]);

  console.log('🎵 GeneratorMusicPlayer render:', {
    hasGeneratedSong: !!generatedSong,
    audioUrl: generatedSong?.audioUrl,
    finalAudioUrl: audioUrl || generatedSong?.audioUrl,
    isTrackId,
    trackIdForPolling,
    isCurrentTrack: currentTrack?.url === (audioUrl || generatedSong?.audioUrl),
    isPlaying,
    currentTrack,
    pollingStatus: status?.status,
    isGenerating,
    progress
  });

  if (!generatedSong) return null;

  // Utiliser l'audioUrl du statut si disponible, sinon l'URL originale
  const finalAudioUrl = audioUrl || generatedSong.audioUrl;
  const isCurrentTrack = currentTrack?.url === finalAudioUrl;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handlePlay = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    console.log('🎵 HandlePlay appelé:', {
      generatedSong: !!generatedSong,
      originalAudioUrl: generatedSong?.audioUrl,
      finalAudioUrl,
      isTrackId,
      pollingAudioUrl: audioUrl,
      isGenerating,
      status: status?.status
    });

    // Si la génération est en cours et on n'a pas encore d'URL finale
    if (isGenerating && !finalAudioUrl) {
      alert('🎵 Votre musique est en cours de génération. Veuillez patienter quelques instants...');
      return;
    }

    // Vérifier que l'URL audio finale est valide
    if (!finalAudioUrl || 
        finalAudioUrl === '' || 
        finalAudioUrl === 'undefined' ||
        finalAudioUrl === null ||
        typeof finalAudioUrl !== 'string') {
      console.error('❌ URL audio invalide dans GeneratorMusicPlayer:', {
        finalAudioUrl,
        originalUrl: generatedSong?.audioUrl,
        pollingUrl: audioUrl,
        type: typeof finalAudioUrl
      });
      
      // Si c'est un trackId, encourager l'utilisateur à attendre
      if (isTrackId) {
        alert('🎵 Votre musique est encore en cours de génération. Veuillez patienter...');
      } else {
        alert('❌ Erreur: URL audio manquante ou invalide. Veuillez regénérer la musique.');
      }
      return;
    }

    console.log('🎵 Démarrage/reprise avec URL:', finalAudioUrl);
    
    // CORRECTION: Toujours forcer un nouveau play() pour éviter les problèmes de state
    // au lieu de tenter resume() qui peut échouer si l'élément audio n'est pas valide
    play({
      url: finalAudioUrl,
      title: generatedSong.title || 'Musique générée',
      rang: 'A'
    });
  };

  return (
    <Card className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          {isGenerating && !audioUrl ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Music className="h-6 w-6" />
              Musique générée avec succès !
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-square bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 max-w-xs mx-auto">
          {isGenerating && !audioUrl ? (
            <Loader2 className="h-16 w-16 text-white/80 animate-spin" />
          ) : (
            <Music className="h-16 w-16 text-white/80" />
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {generatedSong.title}
          </h3>
          <p className="text-gray-600 mb-4">
            Style: {generatedSong.style || 'Personnalisé'}
          </p>
          
          {/* Status de la génération */}
          {isTrackId && (
            <div className={`rounded-lg p-3 mb-4 ${timeoutReached || isTimeout ? 'bg-red-50' : 'bg-blue-50'}`}>
              <p className={`text-sm ${timeoutReached || isTimeout ? 'text-red-700' : 'text-blue-700'}`}>
                {timeoutReached || isTimeout ? (
                  <>⏱️ Génération trop longue ({Math.round((elapsedTime || 0) / 1000)}s). Vous pouvez annuler et relancer.</>
                ) : isGenerating ? (
                  <>🔄 Génération en cours... {Math.round(progress || 0)}% complété ({Math.round((elapsedTime || 0) / 1000)}s)</>
                ) : audioUrl ? (
                  <>✅ Musique prête !</>
                ) : (
                  <>⏳ Vérification du statut...</>
                )}
              </p>
            </div>
          )}
          
          {/* Barre de progression si génération en cours */}
          {(isGenerating || timeoutReached) && !audioUrl && (
            <div className="space-y-2">
              <Progress value={timeoutReached ? 100 : progress} className={`w-full ${timeoutReached ? 'bg-red-100' : ''}`} />
              <div className="flex items-center justify-between">
                <p className={`text-sm ${timeoutReached ? 'text-red-600' : 'text-blue-600'}`}>
                  {timeoutReached ? (
                    <>⏱️ Timeout ({Math.round((elapsedTime || 0) / 1000)}s)</>
                  ) : (
                    <>Génération en cours... {Math.round(progress || 0)}% complété</>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((elapsedTime || 0) / 1000)}s écoulées
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            onClick={handlePlay}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={(isGenerating && !audioUrl) || timeoutReached}
          >
            {isTrackId && isGenerating && !audioUrl && !timeoutReached ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : isCurrentlyPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {isTrackId && !audioUrl ? 'En attente...' : 'Écouter'}
              </>
            )}
          </Button>
          
          <Button
            onClick={onAddToLibrary}
            variant="outline"
            className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
            size="lg"
            disabled={(isGenerating && !audioUrl) || timeoutReached}
          >
            <Library className="h-4 w-4 mr-2" />
            Bibliothèque
          </Button>
          
          {/* Boutons d'annulation et relance si timeout ou génération trop longue */}
          {isTrackId && (timeoutReached || isTimeout || (isGenerating && elapsedTime && elapsedTime > 120000)) && (
            <>
              <Button
                onClick={() => {
                  console.log('❌ Annulation demandée par l\'utilisateur');
                  cancelGeneration();
                  if (onSongUpdate) {
                    onSongUpdate({ audioUrl: null });
                  }
                }}
                variant="destructive"
                size="lg"
                className="flex-1"
              >
                ❌ Annuler
              </Button>
              
              <Button
                onClick={() => {
                  console.log('🔄 Relance demandée par l\'utilisateur');
                  window.location.reload(); // Solution simple pour relancer complètement
                }}
                variant="default"
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                🔄 Relancer
              </Button>
            </>
          )}
          
          <Button
            onClick={() => setShowDebug(!showDebug)}
            variant="ghost"
            size="lg"
            className="text-gray-500 hover:text-gray-700"
            title="Debug audio"
          >
            <Bug className="h-4 w-4" />
          </Button>
          
          {/* Bouton de test du polling si c'est un trackId */}
          {isTrackId && !timeoutReached && (
            <Button
              onClick={() => {
                console.log('🔄 Force polling manuel pour:', trackIdForPolling);
                startPolling();
              }}
              variant="outline"
              size="lg"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
              title="Forcer la vérification"
            >
              🔄
            </Button>
          )}
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">🐛 Debug Audio</h4>
            <DebugAudioButton 
              audioUrl={generatedSong.audioUrl} 
              title={generatedSong.title}
            />
            <div className="text-xs text-gray-500 space-y-1">
              <div><strong>Generated Song:</strong> {JSON.stringify(generatedSong, null, 2).substring(0, 200)}...</div>
              <div><strong>Is Track ID:</strong> {isTrackId ? 'Oui' : 'Non'}</div>
              <div><strong>Track ID:</strong> {trackIdForPolling || 'N/A'}</div>
              <div><strong>Polling Audio URL:</strong> {audioUrl || 'En attente...'}</div>
              <div><strong>Final Audio URL:</strong> {finalAudioUrl || 'N/A'}</div>
              <div><strong>Current Track:</strong> {currentTrack?.url || 'Aucun'}</div>
              <div><strong>Is Playing:</strong> {isPlaying ? 'Oui' : 'Non'}</div>
              <div><strong>Is Generating:</strong> {isGenerating ? 'Oui' : 'Non'}</div>
              <div><strong>Progress:</strong> {Math.round(progress || 0)}%</div>
              <div><strong>Status:</strong> {status?.status || 'N/A'}</div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center mt-4 space-y-1">
          {isTrackId ? (
            timeoutReached || isTimeout ? (
              <div className="text-red-600">
                <p>⏱️ La génération prend plus de temps que prévu ({Math.round((elapsedTime || 0) / 1000)}s)</p>
                <p>Vous pouvez annuler et relancer ou attendre encore un peu.</p>
              </div>
            ) : isGenerating && !audioUrl ? (
              <p>⏳ Votre musique est en cours de génération... ({Math.round((elapsedTime || 0) / 1000)}s écoulées)</p>
            ) : audioUrl ? (
              <p>🎵 Votre musique est prête ! Utilisez les contrôles pour l'écouter.</p>
            ) : (
              <p>🔄 Vérification du statut de génération...</p>
            )
          ) : (
            <p>🎵 Votre musique est prête ! Utilisez les contrôles pour l'écouter.</p>
          )}
          {finalAudioUrl && (
            <p className="break-all">🔗 URL: {finalAudioUrl.substring(0, 80)}...</p>
          )}
          {isTrackId && (
            <p className="break-all">🆔 ID: {generatedSong.audioUrl}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
