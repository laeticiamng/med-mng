import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Download,
} from 'lucide-react';
import './AudioPlayer.css';

interface Song {
  id: string;
  title: string;
  audio_url: string;
  duration?: string;
  style?: string;
  created_at?: string;
}

interface AudioPlayerProps {
  song: Song;
  playlist?: Song[];
  onSongChange?: (song: Song) => void;
  autoPlay?: boolean;
  showDownload?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  song,
  playlist = [],
  onSongChange,
  autoPlay = false,
  showDownload = true,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentIndex = playlist.findIndex((s) => s.id === song.id);

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError('Erreur de lecture audio');
      setIsLoading(false);
      setIsPlaying(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.audio_url) return;

    setError(null);
    audio.src = song.audio_url;
    audio.load();

    if (autoPlay) {
      audio.play().catch((err) => {
        console.error('Autoplay failed:', err);
        setError('Autoplay bloqué par le navigateur');
      });
    }
  }, [song?.audio_url, autoPlay]);

  const togglePlay = useCallback(async () => {
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
    } catch (err) {
      console.error('Play error:', err);
      setError('Erreur de lecture');
    }
  }, [isPlaying]);

  const handleVolumeChange = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setVolume(newVolume);
    audio.volume = newVolume;

    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePrevious = () => {
    if (currentIndex > 0 && onSongChange) {
      onSongChange(playlist[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1 && onSongChange) {
      onSongChange(playlist[currentIndex + 1]);
    }
  };

  const handleDownload = async () => {
    if (!song?.audio_url) return;

    try {
      const response = await fetch(song.audio_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title || 'chanson'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Erreur de téléchargement');
    }
  };

  if (!song?.audio_url) {
    return null;
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} preload="metadata" />

      <div className="song-info">
        <h3 className="song-title">{song.title}</h3>
        <p className="song-meta">
          {song.style} • {formatTime(duration)}
        </p>
      </div>

      <div className="main-controls">
        <button
          onClick={handlePrevious}
          disabled={currentIndex <= 0}
          className="control-btn"
        >
          <SkipBack size={20} />
        </button>

        <button onClick={togglePlay} disabled={isLoading} className="play-btn">
          {isLoading ? (
            <div className="spinner" />
          ) : isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} />
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex >= playlist.length - 1}
          className="control-btn"
        >
          <SkipForward size={20} />
        </button>
      </div>

      <div className="progress-section">
        <span className="time-current">{formatTime(currentTime)}</span>

        <div
          ref={progressRef}
          className="progress-bar"
          onClick={handleProgressClick}
        >
          <div
            className="progress-fill"
            style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
          <div
            className="progress-handle"
            style={{
              left: `${duration ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
        </div>

        <span className="time-duration">{formatTime(duration)}</span>
      </div>

      <div className="secondary-controls">
        <div className="volume-control">
          <button onClick={toggleMute} className="volume-btn">
            {isMuted || volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
          />
        </div>

        {showDownload && (
          <button onClick={handleDownload} className="download-btn">
            <Download size={20} />
          </button>
        )}
      </div>

      {error && (
        <div className="player-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
    </div>
  );
};
