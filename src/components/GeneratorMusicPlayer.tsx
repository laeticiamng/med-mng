import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, Download, Library, Loader2 } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
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

  // Détecter si c'est une génération en cours (trackId de 32 caractères hexadécimaux)
  const isTrackId = generatedSong?.audioUrl && 
    typeof generatedSong.audioUrl === 'string' && 
    generatedSong.audioUrl.length === 32 &&
    /^[a-f0-9]{32}$/i.test(generatedSong.audioUrl) &&
    !generatedSong.audioUrl.startsWith('http') && // Exclure les URLs HTTP
    !generatedSong.audioUrl.includes('.'); // Exclure les URLs avec des extensions
  const trackIdForPolling = isTrackId ? generatedSong.audioUrl : null;
  
  // Optimized tracking - remove console.log for production
  
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
    timeoutReached
  } = useMusicGenerationStatus(trackIdForPolling);

  // Si on reçoit une URL audio finale, mettre à jour le song
  useEffect(() => {
    if (audioUrl && isTrackId && onSongUpdate) {
      // Optimized tracking - production ready
      const updatedSong = {
        ...generatedSong,
        audioUrl: audioUrl
      };
      onSongUpdate(updatedSong);
    }
  }, [audioUrl, isTrackId, generatedSong, onSongUpdate]);

  // Production optimized logging removed for security
  
  // URL audio finale à utiliser
  const finalAudioUrl = audioUrl || (isTrackId ? null : generatedSong?.audioUrl);

  const handlePlay = async () => {
    if (!finalAudioUrl || !generatedSong) return;
    
    // Production optimized - secure audio handling
    
    const trackToPlay = {
      id: generatedSong.id || 'generated-' + Date.now(),
      title: generatedSong.title || 'Musique générée',
      url: finalAudioUrl,
      artist: 'MED-MNG IA',
      duration: generatedSong.duration || 0,
      type: 'generated' as const,
      rang: generatedSong.rang || 'A'
    };

    if (currentTrack?.url === finalAudioUrl) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      // Production optimized audio loading
      await play(trackToPlay);
    }
  };

  // Lancer le polling si on a un trackId et qu'on n'est pas déjà en cours
  useEffect(() => {
    if (trackIdForPolling && !isPolling && !audioUrl) {
      // Production optimized polling start
      setTimeout(() => startPolling(), 100);
    }
  }, [trackIdForPolling, isPolling, audioUrl, startPolling]);

  const isCurrentTrack = currentTrack?.url === finalAudioUrl;

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-blue-600" />
          Lecteur Musical IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Titre de la musique */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {generatedSong?.title || 'Musique générée'}
            </h3>
            <p className="text-sm text-gray-600">MED-MNG IA • Musique d'apprentissage</p>
          </div>

          {/* Progress bar pour génération en cours */}
          {isTrackId && !audioUrl && !timeoutReached && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Génération en cours...</span>
                <span className="text-blue-600">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full bg-blue-100" />
              <p className="text-xs text-center text-gray-500">
                {status?.status === 'completed' ? 'Musique prête !' :
                 status?.status === 'failed' ? 'Erreur de génération' :
                 status?.status === 'timeout' ? 'Timeout - Réessayez' :
                 'Génération en cours...'}
              </p>
            </div>
          )}

          {/* Contrôles de lecture */}
          <div className="flex items-center justify-center gap-4">
            {/* Lecture/Pause */}
            {finalAudioUrl ? (
              <Button
                onClick={handlePlay}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : isCurrentTrack && isPlaying ? (
                  <Pause className="h-5 w-5 mr-2" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                {isGenerating ? 'Génération...' : 
                 isCurrentTrack && isPlaying ? 'Pause' : 'Lire'}
              </Button>
            ) : isTrackId && !timeoutReached ? (
              <Button 
                disabled 
                size="lg"
                className="bg-blue-300 text-blue-800 px-8"
              >
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                En cours de génération...
              </Button>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">Musique non disponible</p>
                {timeoutReached && (
                  <Button
                    onClick={() => {
                      if (trackIdForPolling) {
                        startPolling();
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Réessayer
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {finalAudioUrl && (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = finalAudioUrl;
                  link.download = `${generatedSong?.title || 'musique'}.mp3`;
                  link.click();
                }}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              
              <Button
                onClick={onAddToLibrary}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Library className="h-4 w-4 mr-2" />
                Ajouter à la bibliothèque
              </Button>
            </div>
          )}

          {/* Informations techniques pour dev (production optimized) */}
          {process.env.NODE_ENV === 'development' && isTrackId && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
              <div>Track ID: {trackIdForPolling}</div>
              <div>Status: {status?.status || 'En attente'}</div>
              <div>Audio URL: {audioUrl ? 'Disponible' : 'En attente'}</div>
              <div>Polling: {isPolling ? 'Actif' : 'Inactif'}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};