/**
 * Bouton de prévisualisation audio d'un style musical
 * Joue un sample de 10s du style sélectionné
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TranslatedText } from '@/components/TranslatedText';

// Samples audio pour chaque style (URLs statiques ou générées)
const STYLE_SAMPLES: Record<string, string> = {
  'lofi-piano': '/audio/samples/lofi-piano.mp3',
  'ambient': '/audio/samples/ambient.mp3',
  'jazz': '/audio/samples/jazz.mp3',
  'pop': '/audio/samples/pop.mp3',
  'rock': '/audio/samples/rock.mp3',
  'electronic': '/audio/samples/electronic.mp3',
  'classical': '/audio/samples/classical.mp3',
  'hip-hop': '/audio/samples/hiphop.mp3',
  'r&b': '/audio/samples/rnb.mp3',
  'country': '/audio/samples/country.mp3',
  'folk': '/audio/samples/folk.mp3',
  'metal': '/audio/samples/metal.mp3',
  'reggae': '/audio/samples/reggae.mp3',
  'blues': '/audio/samples/blues.mp3',
  'soul': '/audio/samples/soul.mp3'
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
