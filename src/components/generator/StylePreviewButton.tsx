/**
 * Bouton de prévisualisation audio d'un style musical
 * Joue un sample de 10s du style sélectionné
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TranslatedText } from '@/components/TranslatedText';

// Samples audio pour chaque style (URLs Pixabay/Freesound CDN)
// Ces URLs sont des samples libres de droits utilisables en preview
const STYLE_SAMPLES: Record<string, string> = {
  'lofi-piano': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_ee1e3a8c8a.mp3',
  'ambient': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6f8c2f3.mp3',
  'jazz': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_5b56a79ef4.mp3',
  'pop': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_8bfed7c5eb.mp3',
  'rock': 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_1c1d6c3b3a.mp3',
  'electronic': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
  'classical': 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3',
  'hip-hop': 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3',
  'r&b': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  'country': 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3',
  'folk': 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_8553db7ea0.mp3',
  'metal': 'https://cdn.pixabay.com/download/audio/2022/09/06/audio_7e7a80c4cf.mp3',
  'reggae': 'https://cdn.pixabay.com/download/audio/2022/06/03/audio_1f2dd4dd60.mp3',
  'blues': 'https://cdn.pixabay.com/download/audio/2022/03/22/audio_49a3c4526f.mp3',
  'soul': 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_ad3e9ef0a7.mp3'
};

interface StylePreviewButtonProps {
  style: string;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'ghost' | 'outline' | 'default';
  showLabel?: boolean;
}

export const StylePreviewButton: React.FC<StylePreviewButtonProps> = ({
  style,
  disabled = false,
  size = 'icon',
  variant = 'ghost',
  showLabel = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Normaliser le style pour trouver le sample
  const normalizedStyle = style.toLowerCase().replace(/[^a-z-]/g, '');
  const sampleUrl = STYLE_SAMPLES[normalizedStyle];
  const hasSample = !!sampleUrl;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePlay = useCallback(async () => {
    if (!hasSample || disabled || hasError) return;

    try {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);

      // Créer l'audio si nécessaire
      if (!audioRef.current) {
        audioRef.current = new Audio(sampleUrl);
        audioRef.current.volume = 0.5;
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
        
        audioRef.current.onerror = () => {
          setHasError(true);
          setIsPlaying(false);
          setIsLoading(false);
        };

        audioRef.current.oncanplaythrough = () => {
          setIsLoading(false);
        };
      }

      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);

      // Auto-stop après 10 secondes
      timeoutRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
      }, 10000);

    } catch (err) {
      console.error('Erreur lecture sample:', err);
      setHasError(true);
      setIsLoading(false);
    }
  }, [hasSample, disabled, hasError, isPlaying, sampleUrl]);

  if (!hasSample) {
    return null; // Pas de sample disponible pour ce style
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handlePlay}
            disabled={disabled || hasError}
            className={`${isPlaying ? 'text-primary' : ''}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : hasError ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {showLabel && (
              <span className="ml-2">
                <TranslatedText text={isPlaying ? "Stop" : "Aperçu"} />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {hasError 
              ? "Sample non disponible" 
              : isPlaying 
                ? "Arrêter l'aperçu" 
                : `Écouter un aperçu de ${style}`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
