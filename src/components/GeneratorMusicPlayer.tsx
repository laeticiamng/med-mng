
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, Library, Bug, Loader2, Share2, Clock } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { DebugAudioButton } from './DebugAudioButton';
import { useMusicGenerationStatus } from '@/hooks/useMusicGenerationStatus';
import { Progress } from '@/components/ui/progress';
import { ENABLE_DEBUG } from '@/config/env';
import { useToast } from '@/hooks/use-toast';

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
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const { toast } = useToast();

  // Détecter si c'est une génération en cours (trackId sans audioUrl)
  const isGenerating = generatedSong?.audioUrl && !generatedSong.audioUrl.startsWith('http');
  const trackIdForPolling = isGenerating ? generatedSong.audioUrl : null;
  
  // Utiliser le hook de statut pour suivre la génération
  const { status, isPolling, startPolling, audioUrl, imageUrl, progress } = useMusicGenerationStatus(trackIdForPolling);

  // Démarrer le polling automatiquement si nécessaire
  useEffect(() => {
    if (trackIdForPolling && !isPolling) {
      console.log('🚀 Démarrage du polling pour trackId:', trackIdForPolling);
      startPolling();
    }
  }, [trackIdForPolling, isPolling, startPolling]);

  // Notification quand l'audio est prêt et auto-update du song avec animation
  useEffect(() => {
    if (audioUrl && audioUrl.startsWith('http') && isGenerating) {
      console.log('🎉 Audio disponible ! Mise à jour automatique:', audioUrl);
      
      // Mettre à jour le generatedSong avec le nouveau audioUrl
      if (generatedSong && typeof generatedSong === 'object') {
        generatedSong.audioUrl = audioUrl;
      }
      
      // Animation de succès
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
      
      // Notification toast
      toast({
        title: "🎵 Musique prête !",
        description: "Votre musique a été générée avec succès",
      });
    }
  }, [audioUrl, isGenerating, generatedSong, toast]);

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
      toast({
        title: "Génération en cours",
        description: "Votre musique est en cours de génération. Veuillez patienter...",
        variant: "default"
      });
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
      toast({
        title: "Erreur",
        description: "URL audio manquante ou invalide. Veuillez regénérer la musique.",
        variant: "destructive"
      });
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

  const handleShare = async () => {
    const shareData = {
      title: generatedSong.title || 'Musique générée',
      text: `Écoutez cette musique générée avec EDN Melody ! Style: ${generatedSong.style || 'Personnalisé'}`,
      url: finalAudioUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Partagé !",
          description: "Le lien a été partagé avec succès",
        });
      } else {
        // Fallback: copier dans le presse-papier
        await navigator.clipboard.writeText(finalAudioUrl);
        toast({
          title: "Lien copié !",
          description: "Le lien audio a été copié dans votre presse-papier",
        });
      }
    } catch (error) {
      console.error('Erreur de partage:', error);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`mt-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20 transition-all duration-500 ${
      showSuccessAnimation ? 'animate-scale-in ring-4 ring-success/50' : ''
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-success">
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
        {/* Image de couverture dynamique */}
        <div className={`relative aspect-square bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 max-w-xs mx-auto overflow-hidden transition-all duration-500 ${
          showSuccessAnimation ? 'scale-105' : ''
        }`}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={generatedSong.title}
              className="w-full h-full object-cover"
            />
          ) : isGenerating && !audioUrl ? (
            <Loader2 className="h-16 w-16 text-primary-foreground/80 animate-spin" />
          ) : (
            <Music className="h-16 w-16 text-primary-foreground/80" />
          )}
          {showSuccessAnimation && (
            <div className="absolute inset-0 bg-success/30 animate-pulse" />
          )}
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-foreground">
              {generatedSong.title}
            </h3>
            {status?.metadata?.duration && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(status.metadata.duration)}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mb-4">
            Style: {generatedSong.style || 'Personnalisé'}
          </p>
          
          {/* Barre de progression si génération en cours */}
          {isGenerating && !audioUrl && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-primary">
                Génération en cours... {progress}% complété
              </p>
            </div>
          )}
        </div>

        {/* Lecteur audio natif avec contrôles */}
        {finalAudioUrl && finalAudioUrl.startsWith('http') && (
          <div className="bg-card rounded-lg p-4 border border-success/20">
            <audio 
              controls 
              className="w-full"
              src={finalAudioUrl}
              preload="metadata"
            >
              Votre navigateur ne supporte pas l'élément audio.
            </audio>
          </div>
        )}

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
            Ajouter à la bibliothèque
          </Button>
          
          {/* Bouton de partage */}
          {finalAudioUrl && finalAudioUrl.startsWith('http') && (
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
              size="lg"
              title="Partager"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          
          {ENABLE_DEBUG && (
            <Button
              onClick={() => setShowDebug(!showDebug)}
              variant="ghost"
              size="lg"
              className="text-gray-500 hover:text-gray-700"
              title="Debug audio"
            >
              <Bug className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Debug Panel - Only in development */}
        {ENABLE_DEBUG && showDebug && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm text-foreground">🐛 Debug Audio</h4>
            <DebugAudioButton 
              audioUrl={generatedSong.audioUrl} 
              title={generatedSong.title}
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Object: {JSON.stringify(generatedSong, null, 2).substring(0, 200)}...</div>
              <div>Current Track: {currentTrack?.url}</div>
              <div>Is Playing: {isPlaying ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center mt-4 space-y-1">
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
