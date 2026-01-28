import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, HardDrive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AIGeneratedBadge } from '@/components/common/AIGeneratedBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAudioWithCache } from '@/hooks/useAudioWithCache';
import { cn } from '@/lib/utils';

interface SupabaseMusicTrack {
  id: string;
  title: string;
  audio_url: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  suno_track_id?: string;
  task_id?: string;
}

interface MusicPlayerProps {
  track: SupabaseMusicTrack;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  track, 
  onNext, 
  onPrevious 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isCached, setIsCached] = useState(false);
  const [audioSrc, setAudioSrc] = useState(track.audio_url);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { cacheAudio, isAudioCached, getAudioUrl, isCaching } = useAudioWithCache({ type: 'music' });

  // Check cache on mount and track change
  useEffect(() => {
    const checkCache = async () => {
      const cached = await isAudioCached(track.id);
      setIsCached(cached);
      if (cached) {
        const cachedUrl = await getAudioUrl(track.id, track.audio_url);
        setAudioSrc(cachedUrl);
      } else {
        setAudioSrc(track.audio_url);
      }
    };
    checkCache();
  }, [track.id, track.audio_url, isAudioCached, getAudioUrl]);

  const handleCacheTrack = async () => {
    const success = await cacheAudio(track.id, track.audio_url, track.title);
    if (success) {
      setIsCached(true);
      const cachedUrl = await getAudioUrl(track.id, track.audio_url);
      setAudioSrc(cachedUrl);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onNext) onNext();
    };
    const handleLoadedData = () => {
      // Audio chargé
    };
    const handleError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
    };
  }, [onNext, track.title]);

  // Reset when track changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [track.id]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          aria-label={`Lecteur audio pour ${track.title || 'musique sans titre'}`}
        />
        
        {/* Info du track */}
        <div className="mb-4" role="region" aria-label="Informations de la piste">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground" id="track-title">
                {track.title || 'Musique sans titre'}
              </h3>
              <p className="text-sm text-muted-foreground" id="track-tags">
                {track.metadata?.tags || 'Aucun tag'}
              </p>
            </div>
            <AIGeneratedBadge type="music" provider="Suno AI" model="v4.5 Plus" variant="compact" />
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-4" role="region" aria-label="Contrôle de lecture">
          <label htmlFor="seek-slider" className="sr-only">
            Barre de progression de lecture
          </label>
          <input
            id="seek-slider"
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            aria-label={`Position de lecture: ${formatTime(currentTime)} sur ${formatTime(duration)}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={duration ? (currentTime / duration) * 100 : 0}
            aria-valuetext={`${formatTime(currentTime)} sur ${formatTime(duration)}`}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider touch-target"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span aria-live="polite">{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex items-center justify-center space-x-4 mb-4" role="group" aria-label="Contrôles de lecture">
          <button
            onClick={onPrevious}
            disabled={!onPrevious}
            aria-label="Piste précédente"
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <SkipBack size={20} aria-hidden="true" />
          </button>
          
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Mettre en pause' : 'Lire la musique'}
            aria-pressed={isPlaying}
            className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors touch-target min-w-[52px] min-h-[52px] flex items-center justify-center"
          >
            {isPlaying ? <Pause size={24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
          </button>
          
          <button
            onClick={onNext}
            disabled={!onNext}
            aria-label="Piste suivante"
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <SkipForward size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Contrôle du volume et cache */}
        <div className="flex items-center justify-between gap-4" role="group" aria-label="Contrôles secondaires">
          <div className="flex items-center space-x-2 flex-1">
            <Volume2 size={16} className="text-muted-foreground" aria-hidden="true" />
            <label htmlFor="volume-slider" className="sr-only">
              Contrôle du volume
            </label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              aria-label={`Volume: ${Math.round(volume * 100)}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(volume * 100)}
              aria-valuetext={`${Math.round(volume * 100)}%`}
              className="flex-1 h-1 bg-secondary rounded-lg appearance-none cursor-pointer slider touch-target"
            />
          </div>
          
          {/* Cache button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCacheTrack}
            disabled={isCached || isCaching(track.id)}
            className={cn("gap-1", isCached && "text-success border-success/30")}
            title={isCached ? "Disponible hors-ligne" : "Mettre en cache"}
          >
            <HardDrive size={14} className={cn(isCached && "fill-current")} />
            {isCached ? "Hors-ligne" : "Cacher"}
          </Button>
        </div>
        
        {/* Offline indicator */}
        {isCached && (
          <div className="mt-3 flex justify-center">
            <Badge variant="outline" className="text-success border-success/30 text-xs">
              <HardDrive className="h-3 w-3 mr-1" />
              Disponible hors-ligne
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};