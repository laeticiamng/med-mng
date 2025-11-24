import logger from '@/lib/logger';
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AIGeneratedBadge } from '@/components/common/AIGeneratedBadge';

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
  const audioRef = useRef<HTMLAudioElement>(null);

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
      logger.debug('🎵 Audio chargé:', track.title);
    };
    const handleError = (e: any) => {
      logger.error('❌ Erreur audio:', e);
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
    } catch (error) {
      logger.error('Erreur lecture audio:', error);
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
          src={track.audio_url}
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

        {/* Contrôle du volume */}
        <div className="flex items-center space-x-2" role="group" aria-label="Contrôle du volume">
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
      </CardContent>
    </Card>
  );
};