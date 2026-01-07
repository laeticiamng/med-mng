import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, Library, Bug, Loader2, Share2, Clock, Heart, Download, RefreshCw } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { DebugAudioButton } from './DebugAudioButton';
import { useMusicGenerationStatus } from '@/hooks/useMusicGenerationStatus';
import { Progress } from '@/components/ui/progress';
import { ENABLE_DEBUG } from '@/config/env';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { TranslatedText } from '@/components/TranslatedText';

interface GeneratorMusicPlayerProps {
  generatedSong: any;
  onAddToLibrary: () => void;
  onRetry?: () => void;
}

export const GeneratorMusicPlayer: React.FC<GeneratorMusicPlayerProps> = ({
  generatedSong,
  onAddToLibrary,
  onRetry
}) => {
  const { currentTrack, isPlaying, play, pause, resume } = useGlobalAudio();
  const { user } = useAuth();
  const [showDebug, setShowDebug] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();
  const playStartTimeRef = useRef<number | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Détecter si c'est une génération en cours (trackId sans audioUrl)
  const isGenerating = generatedSong?.audioUrl && !generatedSong.audioUrl.startsWith('http');
  const trackIdForPolling = isGenerating ? generatedSong.audioUrl : null;
  
  // Utiliser le hook de statut pour suivre la génération
  const { status, isPolling, startPolling, audioUrl, imageUrl, progress } = useMusicGenerationStatus(trackIdForPolling);

  // Démarrer le polling automatiquement si nécessaire
  useEffect(() => {
    if (trackIdForPolling && !isPolling) {
      startPolling();
    }
  }, [trackIdForPolling, isPolling, startPolling]);

  // Jouer son de notification quand l'audio est prêt
  const playNotificationSound = useCallback(() => {
    try {
      if (!notificationSoundRef.current) {
        notificationSoundRef.current = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 
          'tvT19' + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      }
      // Simple bell sound
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.warn('AudioContext non disponible:', err);
    }
  }, []);

  // Notification quand l'audio est prêt avec animation
  useEffect(() => {
    if (audioUrl && audioUrl.startsWith('http') && isGenerating) {
      // Animation de succès
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
      
      // Jouer le son de notification
      playNotificationSound();
      
      // Notification toast
      toast({
        title: "🎵 Musique prête !",
        description: "Votre musique a été générée avec succès",
      });
    }
  }, [audioUrl, isGenerating, toast, playNotificationSound]);

  // Gérer les favoris - Correction: utiliser item_code + music_style pour identifier la chanson
  const handleToggleFavorite = useCallback(async () => {
    if (!user || !generatedSong) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour ajouter aux favoris",
        variant: "destructive"
      });
      return;
    }

    setFavoriteLoading(true);
    try {
      const finalUrl = audioUrl || generatedSong.audioUrl;
      
      // Stratégie 1: Recherche par audio_url exacte
      let existingRecords: { id: string; is_favorite: boolean | null }[] | null = null;
      
      if (finalUrl && finalUrl.startsWith('http')) {
        const { data } = await supabase
          .from('user_generated_music')
          .select('id, is_favorite')
          .eq('user_id', user.id)
          .eq('audio_url', finalUrl)
          .limit(1);
        existingRecords = data;
      }
      
      // Stratégie 2: Si pas trouvé, chercher par item_code + style
      if (!existingRecords || existingRecords.length === 0) {
        const { data } = await supabase
          .from('user_generated_music')
          .select('id, is_favorite')
          .eq('user_id', user.id)
          .eq('item_code', generatedSong.itemCode)
          .eq('music_style', generatedSong.style)
          .order('created_at', { ascending: false })
          .limit(1);
        existingRecords = data;
      }

      if (existingRecords && existingRecords.length > 0) {
        const record = existingRecords[0];
        const newFavoriteState = !(record.is_favorite || false);
        
        await supabase
          .from('user_generated_music')
          .update({ is_favorite: newFavoriteState } as any)
          .eq('id', record.id);
          
        setIsFavorite(newFavoriteState);
        toast({ title: newFavoriteState ? "❤️ Ajouté aux favoris !" : "💔 Retiré des favoris" });
      } else {
        // Aucun record trouvé, créer un nouveau avec le favori
        const { error } = await supabase
          .from('user_generated_music')
          .insert({
            user_id: user.id,
            title: generatedSong.title,
            audio_url: finalUrl,
            music_style: generatedSong.style,
            rang: generatedSong.rang,
            item_code: generatedSong.itemCode,
            is_favorite: true
          } as any);
          
        if (!error) {
          setIsFavorite(true);
          toast({ title: "❤️ Ajouté aux favoris et à la bibliothèque !" });
        }
      }
    } catch (err) {
      console.error('Erreur toggle favori:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris",
        variant: "destructive"
      });
    } finally {
      setFavoriteLoading(false);
    }
  }, [user, generatedSong, audioUrl, toast]);


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

    // Vérifier que l'URL audio finale est valide
    if (!finalAudioUrl || 
        finalAudioUrl === '' || 
        finalAudioUrl === 'undefined' ||
        finalAudioUrl === null ||
        !finalAudioUrl.startsWith('http')) {
      toast({
        title: "Erreur",
        description: "URL audio manquante ou invalide. Veuillez regénérer la musique.",
        variant: "destructive"
      });
      return;
    }

    if (isCurrentTrack) {
      if (isPlaying) {
        // Track listening duration on pause
        if (playStartTimeRef.current) {
          const listenDuration = Math.floor((Date.now() - playStartTimeRef.current) / 1000);
          logActivity({ activity_type: 'music_generation', duration_seconds: listenDuration });
          playStartTimeRef.current = null;
        }
        pause();
      } else {
        playStartTimeRef.current = Date.now();
        resume();
      }
    } else {
      playStartTimeRef.current = Date.now();
      logActivity({ activity_type: 'music_generation', metadata: { action: 'music_play' } });
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
    } catch (err) {
      console.warn('Erreur partage:', err);
    }
  };

  // Télécharger l'audio
  const handleDownload = async () => {
    if (!finalAudioUrl || !finalAudioUrl.startsWith('http')) {
      toast({
        title: "Erreur",
        description: "Aucun fichier audio disponible",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(finalAudioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedSong.title || 'musique-generee'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Téléchargement lancé !",
        description: "Le fichier audio est en cours de téléchargement",
      });
      
      logActivity({ activity_type: 'music_generation', metadata: { action: 'download' } });
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive"
      });
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
        <div className={`relative aspect-square bg-gradient-success rounded-lg flex items-center justify-center mb-4 max-w-xs mx-auto overflow-hidden transition-all duration-500 ${
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
            className="flex-1 bg-success hover:bg-success/90"
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
            className="flex-1 border-success/30 text-success hover:bg-success/10"
            size="lg"
            disabled={isGenerating && !audioUrl}
          >
            <Library className="h-4 w-4 mr-2" />
            Ajouter à la bibliothèque
          </Button>
          
          {/* Bouton Favori */}
          {user && finalAudioUrl && finalAudioUrl.startsWith('http') && (
            <Button
              onClick={handleToggleFavorite}
              variant="outline"
              className={`border-success/30 hover:bg-success/10 ${isFavorite ? 'text-destructive' : 'text-success'}`}
              size="lg"
              title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              disabled={favoriteLoading}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}
          
          {/* Bouton Téléchargement */}
          {finalAudioUrl && finalAudioUrl.startsWith('http') && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-success/30 text-success hover:bg-success/10"
              size="lg"
              title="Télécharger"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          {/* Bouton de partage */}
          {finalAudioUrl && finalAudioUrl.startsWith('http') && (
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-success/30 text-success hover:bg-success/10"
              size="lg"
              title="Partager"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Bouton Retry - Affiché en cas d'échec OU si pas d'audio après polling */}
          {onRetry && (status?.status === 'failed' || (isGenerating && progress >= 95 && !audioUrl)) && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-warning/30 text-warning hover:bg-warning/10"
              size="lg"
              title="Réessayer la génération"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
          
          {ENABLE_DEBUG && (
            <Button
              onClick={() => setShowDebug(!showDebug)}
              variant="ghost"
              size="lg"
              className="text-muted-foreground hover:text-foreground"
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
