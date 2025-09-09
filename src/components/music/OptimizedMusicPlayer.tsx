// ==========================================
// MED-MNG OPTIMIZED MUSIC PLAYER - Lecteur musical optimisé
// ==========================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { MusicTrack } from '@/types';

interface OptimizedMusicPlayerProps {
  track: MusicTrack;
  onNext?: () => void;
  onPrevious?: () => void;
  autoPlay?: boolean;
  showDownload?: boolean;
  className?: string;
}

export const OptimizedMusicPlayer: React.FC<OptimizedMusicPlayerProps> = ({ 
  track, 
  onNext, 
  onPrevious,
  autoPlay = false,
  showDownload = true,
  className = ""
}) => {
  const { toast } = useToast();
  
  // State du lecteur
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'track' | 'queue'>('none');
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Effets audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
      if (autoPlay) {
        audio.play().catch(handlePlayError);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (repeatMode === 'track') {
        audio.currentTime = 0;
        audio.play().catch(handlePlayError);
      } else if (onNext) {
        onNext();
      }
    };
    const handleError = (e: any) => {
      console.error('❌ Erreur audio:', e);
      setError('Impossible de charger l\'audio');
      setIsLoading(false);
      setIsPlaying(false);
      toast({
        title: "Erreur audio",
        description: "Impossible de charger la piste audio",
        variant: "destructive"
      });
    };

    // Event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [autoPlay, repeatMode, onNext, toast]);

  // Reset quand track change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
  }, [track.id]);

  // Gestion d'erreurs de lecture
  const handlePlayError = useCallback((error: any) => {
    console.error('❌ Erreur lecture:', error);
    setIsPlaying(false);
    setError('Erreur de lecture');
    toast({
      title: "Erreur de lecture",
      description: "Impossible de lire cette piste",
      variant: "destructive"
    });
  }, [toast]);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      handlePlayError(error);
    }
  }, [isPlaying, isLoading, handlePlayError]);

  // Seek dans la piste
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar || !duration) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = Math.max(0, Math.min(newTime, duration));
    setCurrentTime(newTime);
  }, [duration]);

  // Changement de volume
  const handleVolumeChange = useCallback((values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  // Changement de vitesse
  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  // Téléchargement
  const handleDownload = useCallback(() => {
    if (!track.audio_url) return;
    
    const link = document.createElement('a');
    link.href = track.audio_url;
    link.download = `${track.title}.mp3`;
    link.click();
    
    toast({
      title: "Téléchargement démarré",
      description: `${track.title} en cours de téléchargement...`
    });
  }, [track.audio_url, track.title, toast]);

  // Formatage du temps
  const formatTime = useCallback((time: number): string => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Pourcentage de progression
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        <audio
          ref={audioRef}
          src={track.audio_url}
          preload="metadata"
        />
        
        {/* Info du track */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground truncate flex-1">
              {track.title || 'Musique sans titre'}
            </h3>
            {track.metadata?.rang && (
              <Badge variant="secondary" className="ml-2">
                Rang {String(track.metadata.rang)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {String(track.metadata?.style || 'Style non défini')} • {String(track.metadata?.item_code || 'Item médical')}
          </p>
          {error && (
            <p className="text-sm text-destructive mt-1">{error}</p>
          )}
        </div>

        {/* Barre de progression interactive */}
        <div className="mb-6">
          <div 
            ref={progressRef}
            onClick={handleSeek}
            className="relative w-full h-2 bg-secondary rounded-lg cursor-pointer group"
          >
            <div 
              className="absolute top-0 left-0 h-full bg-primary rounded-lg transition-all duration-200 group-hover:bg-primary-hover"
              style={{ width: `${progressPercentage}%` }}
            />
            {/* Indicateur de position */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Contrôles principaux */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!onPrevious}
            className="hover:bg-secondary"
          >
            <SkipBack size={20} />
          </Button>
          
          <Button
            onClick={togglePlay}
            disabled={isLoading || !!error}
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
            ) : isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!onNext}
            className="hover:bg-secondary"
          >
            <SkipForward size={20} />
          </Button>
        </div>

        {/* Contrôles secondaires */}
        <div className="flex items-center justify-between">
          {/* Volume */}
          <div className="flex items-center space-x-2 flex-1 max-w-32">
            <Volume2 size={16} className="text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.05}
              className="flex-1"
            />
          </div>

          {/* Vitesse de lecture */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePlaybackRateChange(playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1)}
              className="text-xs"
            >
              {playbackRate}x
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRepeatMode(repeatMode === 'none' ? 'track' : 'none')}
              className={repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'}
            >
              <Repeat size={16} />
            </Button>
            
            {showDownload && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                disabled={!track.audio_url}
                className="hover:bg-secondary"
              >
                <Download size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};