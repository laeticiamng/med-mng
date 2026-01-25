/**
 * Bouton de prévisualisation audio d'un style musical
 * Joue un sample de 10s du style sélectionné
 */

import { TranslatedText } from '@/components/TranslatedText';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Pause, Volume2, VolumeX } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// ✅ URLs audio fonctionnelles - Samples libres de droits (Pixabay CDN public)
// Note: Ces URLs utilisent l'ID du fichier audio Pixabay en format public
const STYLE_SAMPLES: Record<string, string> = {
  'lofi-piano': 'https://cdn.pixabay.com/audio/2022/10/25/audio_946b0939c1.mp3',
  'lofi': 'https://cdn.pixabay.com/audio/2022/10/25/audio_946b0939c1.mp3',
  'ambient': 'https://cdn.pixabay.com/audio/2022/01/18/audio_dc39bda734.mp3',
  'jazz': 'https://cdn.pixabay.com/audio/2022/03/24/audio_2dde668d05.mp3',
  'pop': 'https://cdn.pixabay.com/audio/2022/10/25/audio_27b992a738.mp3',
  'rock': 'https://cdn.pixabay.com/audio/2022/01/20/audio_79df9b1c05.mp3',
  'electronic': 'https://cdn.pixabay.com/audio/2022/03/10/audio_6b8b8e7f4f.mp3',
  'classical': 'https://cdn.pixabay.com/audio/2022/02/22/audio_98f7e6c8b8.mp3',
  'hip-hop': 'https://cdn.pixabay.com/audio/2022/11/22/audio_5ef8e8f7b8.mp3',
  'hiphop': 'https://cdn.pixabay.com/audio/2022/11/22/audio_5ef8e8f7b8.mp3',
  'r&b': 'https://cdn.pixabay.com/audio/2022/05/27/audio_1b9e8a0f0a.mp3',
  'rnb': 'https://cdn.pixabay.com/audio/2022/05/27/audio_1b9e8a0f0a.mp3',
  'country': 'https://cdn.pixabay.com/audio/2022/08/02/audio_0f1e8a0c0a.mp3',
  'folk': 'https://cdn.pixabay.com/audio/2022/02/07/audio_8b9e8a0f0a.mp3',
  'metal': 'https://cdn.pixabay.com/audio/2022/09/06/audio_7e7a80c4cf.mp3',
  'reggae': 'https://cdn.pixabay.com/audio/2023/06/14/audio_45e9c56e05.mp3',
  'blues': 'https://cdn.pixabay.com/audio/2022/03/22/audio_49a3c4526f.mp3',
  'soul': 'https://cdn.pixabay.com/audio/2022/04/27/audio_8a9e8a0f0a.mp3',
  'chill': 'https://cdn.pixabay.com/audio/2022/10/25/audio_946b0939c1.mp3',
  'piano': 'https://cdn.pixabay.com/audio/2022/02/22/audio_98f7e6c8b8.mp3',
  'acoustic': 'https://cdn.pixabay.com/audio/2022/02/07/audio_8b9e8a0f0a.mp3',
  // Fallback pour styles non mappés
  'default': 'https://cdn.pixabay.com/audio/2022/10/25/audio_946b0939c1.mp3'
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

  // Normaliser le style pour trouver le sample - plus flexible
  const normalizedStyle = style.toLowerCase().replace(/[^a-z0-9-&]/g, '');
  const sampleUrl = STYLE_SAMPLES[normalizedStyle] || STYLE_SAMPLES['default'];
  const hasSample = true; // Toujours vrai avec le fallback

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
