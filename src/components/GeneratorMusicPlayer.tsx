
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, Download, Library, Bug, Loader2 } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { DebugAudioButton } from './DebugAudioButton';
import { useMusicGenerationStatus } from '@/hooks/useMusicGenerationStatus';
import { Progress } from '@/components/ui/progress';
import { ENABLE_DEBUG } from '@/config/env';

interface GeneratorMusicPlayerProps {
  generatedSong: any;
  onAddToLibrary: () => void;
}

export const GeneratorMusicPlayer: React.FC<GeneratorMusicPlayerProps> = ({
  generatedSong,
  onAddToLibrary
}) => {
  const { currentTrack, isPlaying, play, pause, resume } = useGlobalAudio();
  const [showDebug, setShowDebug] = useState(false);

  // Détecter si c'est une génération en cours (trackId sans audioUrl)
  const isGenerating = generatedSong?.audioUrl && !generatedSong.audioUrl.startsWith('http');
  const trackIdForPolling = isGenerating ? generatedSong.audioUrl : null;
  
  // Utiliser le hook de statut pour suivre la génération
  const { status, isPolling, startPolling, audioUrl, progress } = useMusicGenerationStatus(trackIdForPolling);

  // Démarrer le polling automatiquement si nécessaire
  useEffect(() => {
    if (trackIdForPolling && !isPolling) {
      console.log('🚀 Démarrage du polling pour trackId:', trackIdForPolling);
      startPolling();
    }
  }, [trackIdForPolling, isPolling, startPolling]);

  // Notification quand l'audio est prêt et auto-update du song
  useEffect(() => {
    if (audioUrl && audioUrl.startsWith('http') && isGenerating) {
      console.log('🎉 Audio disponible ! Mise à jour automatique:', audioUrl);
      
      // Mettre à jour le generatedSong avec le nouveau audioUrl
      if (generatedSong && typeof generatedSong === 'object') {
        generatedSong.audioUrl = audioUrl;
      }
      
      // Notification toast (si disponible)
      if (typeof window !== 'undefined' && 'toast' in window) {
        (window as any).toast?.success?.('🎵 Votre musique est prête !');
      }
    }
  }, [audioUrl, isGenerating, generatedSong]);

  console.log('🎵 GeneratorMusicPlayer render:', {
    hasGeneratedSong: !!generatedSong,
    audioUrl: generatedSong?.audioUrl,
    isCurrentTrack: currentTrack?.url === generatedSong?.audioUrl,
    isPlaying,
    currentTrack
  });

  if (!generatedSong) return null;

  // Utiliser l'audioUrl du statut si disponible, sinon l'URL originale
  const finalAudioUrl = audioUrl || generatedSong.audioUrl;
  const isCurrentTrack = currentTrack?.url === finalAudioUrl;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handlePlay = () => {
    // Si la génération est en cours, afficher un message
    if (isGenerating && !audioUrl) {
      alert('🎵 Votre musique est en cours de génération. Veuillez patienter quelques instants...');
      return;
    }
    console.log('🎵 GeneratorMusicPlayer: Tentative de lecture', {
      audioUrl: generatedSong.audioUrl,
      title: generatedSong.title,
      isCurrentTrack,
      isPlaying,
      hasGeneratedSong: !!generatedSong,
      urlType: generatedSong.audioUrl?.startsWith('http') ? 'http' : 'relative',
      generatedSongObject: generatedSong
    });

    // Vérifier que l'URL audio finale est valide
    if (!finalAudioUrl || 
        finalAudioUrl === '' || 
        finalAudioUrl === 'undefined' ||
        finalAudioUrl === null) {
      console.error('❌ URL audio invalide dans GeneratorMusicPlayer:', finalAudioUrl);
      alert('❌ Erreur: URL audio manquante ou invalide. Veuillez regénérer la musique.');
      return;
    }

    if (isCurrentTrack) {
      if (isPlaying) {
        console.log('⏸️ Pause audio en cours');
        pause();
      } else {
        console.log('▶️ Reprise audio');
        resume();
      }
    } else {
      console.log('🎵 Démarrage nouveau track avec URL:', finalAudioUrl);
      play({
        url: finalAudioUrl,
        title: generatedSong.title || 'Musique générée',
        rang: 'A'
      });
    }
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
          
          {/* Barre de progression si génération en cours */}
          {isGenerating && !audioUrl && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-blue-600">
                Génération en cours... {progress}% complété
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePlay}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={isGenerating && !audioUrl}
          >
            {isGenerating && !audioUrl ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                En cours...
              </>
            ) : isCurrentlyPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Écouter
              </>
            )}
          </Button>
          <Button
            onClick={onAddToLibrary}
            variant="outline"
            className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
            size="lg"
            disabled={isGenerating && !audioUrl}
          >
            <Library className="h-4 w-4 mr-2" />
            Bibliothèque
          </Button>
          <Button
            onClick={() => setShowDebug(!showDebug)}
            variant="ghost"
            size="lg"
            className="text-gray-500 hover:text-gray-700"
            title="Debug audio"
          >
            <Bug className="h-4 w-4" />
          </Button>
        </div>

        {/* Debug Panel - Only in development */}
        {ENABLE_DEBUG && showDebug && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">🐛 Debug Audio</h4>
            <DebugAudioButton 
              audioUrl={generatedSong.audioUrl} 
              title={generatedSong.title}
            />
            <div className="text-xs text-gray-500 space-y-1">
              <div>Object: {JSON.stringify(generatedSong, null, 2).substring(0, 200)}...</div>
              <div>Current Track: {currentTrack?.url}</div>
              <div>Is Playing: {isPlaying ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center mt-4 space-y-1">
          {isGenerating && !audioUrl ? (
            <p>⏳ Votre musique est en cours de génération. Le processus peut prendre 1-2 minutes...</p>
          ) : (
            <p>🎵 Votre musique est prête ! Utilisez les contrôles pour l'écouter.</p>
          )}
          {(finalAudioUrl || generatedSong.audioUrl) && (
            <p className="break-all">🔗 URL: {(finalAudioUrl || generatedSong.audioUrl).substring(0, 80)}...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
