import { useState, useEffect, useCallback } from 'react';

interface AudioBufferingState {
  isBuffering: boolean;
  bufferPercent: number;
  readyToPlay: boolean;
  estimatedLoadTime: number;
}

export const useAudioBuffering = (audioElement: HTMLAudioElement | null) => {
  const [bufferingState, setBufferingState] = useState<AudioBufferingState>({
    isBuffering: false,
    bufferPercent: 0,
    readyToPlay: false,
    estimatedLoadTime: 0
  });

  const updateBufferStatus = useCallback(() => {
    if (!audioElement) return;

    const buffered = audioElement.buffered;
    const duration = audioElement.duration || 0;
    
    if (buffered.length > 0 && duration > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const bufferPercent = (bufferedEnd / duration) * 100;
      
      setBufferingState(prev => ({
        ...prev,
        bufferPercent,
        readyToPlay: bufferPercent > 10, // 10% buffer minimum pour lecture fluide
        isBuffering: audioElement.readyState < 3 && bufferPercent < 50
      }));
    }
  }, [audioElement]);

  useEffect(() => {
    if (!audioElement) return;

    const startTime = performance.now();

    const handleProgress = () => {
      updateBufferStatus();
    };

    const handleCanPlay = () => {
      const loadTime = performance.now() - startTime;
      setBufferingState(prev => ({
        ...prev,
        readyToPlay: true,
        isBuffering: false,
        estimatedLoadTime: loadTime
      }));
    };

    const handleWaiting = () => {
      setBufferingState(prev => ({ ...prev, isBuffering: true }));
    };

    const handleCanPlayThrough = () => {
      setBufferingState(prev => ({
        ...prev,
        isBuffering: false,
        readyToPlay: true,
        bufferPercent: 100
      }));
    };

    audioElement.addEventListener('progress', handleProgress);
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('waiting', handleWaiting);
    audioElement.addEventListener('canplaythrough', handleCanPlayThrough);

    // Vérification initiale
    updateBufferStatus();

    return () => {
      audioElement.removeEventListener('progress', handleProgress);
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('waiting', handleWaiting);
      audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [audioElement, updateBufferStatus]);

  return bufferingState;
};