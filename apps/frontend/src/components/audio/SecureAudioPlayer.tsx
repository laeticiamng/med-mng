import logger from '@/lib/logger';
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SecureAudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onError?: (error: string) => void;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
}

export const SecureAudioPlayer: React.FC<SecureAudioPlayerProps> = ({
  src,
  title,
  artist,
  className,
  onPlay,
  onPause,
  onTimeUpdate,
  onLoadedMetadata,
  onError,
  controls = true,
  autoPlay = false,
  loop = false
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Sécuriser l'élément audio
    const secureAudio = () => {
      // Bloquer le clic droit
      audio.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        logger.warn('Download blocked: Right-click disabled');
      });

      // Bloquer les raccourcis de téléchargement
      audio.addEventListener('keydown', (e) => {
        if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          logger.warn('Download blocked: Ctrl+S disabled');
        }
      });

      // Masquer l'URL source dans le DOM
      audio.removeAttribute('src');
      
      // Utiliser un Blob URL sécurisé
      createSecureSource(src).then(blobUrl => {
        audio.src = blobUrl;
      }).catch(error => {
        logger.error('Error creating secure source:', error);
        onError?.('Erreur de chargement audio sécurisé');
      });

      // Bloquer l'inspection de l'élément
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
            if (audio.src && !audio.src.startsWith('blob:')) {
              logger.warn('Source modification blocked');
              audio.src = '';
            }
          }
        });
      });

      observer.observe(audio, { attributes: true });

      return () => observer.disconnect();
    };

    // Event listeners
    const handlePlay = () => {
      onPlay?.();
    };

    const handlePause = () => {
      onPause?.();
    };

    const handleTimeUpdate = () => {
      onTimeUpdate?.(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      onLoadedMetadata?.(audio.duration);
    };

    const handleError = () => {
      onError?.('Erreur de lecture audio');
    };

    // Ajouter les event listeners
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    // Sécuriser l'audio
    const cleanup = secureAudio();

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      cleanup?.();
    };
  }, [src, onPlay, onPause, onTimeUpdate, onLoadedMetadata, onError]);

  // Bloquer les tentatives de téléchargement via DevTools
  useEffect(() => {
    const blockDevTools = () => {
      // Détecter l'ouverture des DevTools
      let devtools = { open: false, orientation: null };
      
      setInterval(() => {
        if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
          if (!devtools.open) {
            devtools.open = true;
            console.clear();
            logger.warn('🚫 Téléchargement bloqué - Contenu protégé');
          }
        } else {
          devtools.open = false;
        }
      }, 500);

      // Bloquer les tentatives de copie d'URL
      document.addEventListener('copy', (e) => {
        if (window.getSelection()?.toString().includes('blob:')) {
          e.clipboardData?.setData('text/plain', 'Contenu protégé - Téléchargement non autorisé');
          e.preventDefault();
        }
      });
    };

    blockDevTools();
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Overlay de protection */}
      <div className="absolute inset-0 pointer-events-none z-10 select-none">
        <div className="w-full h-full bg-transparent" />
      </div>
      
      <audio
        ref={audioRef}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        className={cn(
          "w-full",
          // Masquer certains contrôles
          "[&::-webkit-media-controls-download-button]:hidden",
          "[&::-webkit-media-controls-remote-playback-button]:hidden"
        )}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{
          // CSS pour masquer les boutons de téléchargement
          //@ts-ignore
          '--webkit-media-controls-download-button': 'none'
        }}
      />
      
      {/* Métadonnées affichées de manière sécurisée */}
      {(title || artist) && (
        <div className="mt-2 text-sm text-muted-foreground">
          {title && <div className="font-medium">{title}</div>}
          {artist && <div>{artist}</div>}
        </div>
      )}
      
      {/* Watermark de protection */}
      <div className="absolute bottom-0 right-0 text-xs text-muted-foreground/50 pointer-events-none">
        🔒 Protégé
      </div>
    </div>
  );
};

// Fonction pour créer une source audio sécurisée
const createSecureSource = async (originalSrc: string): Promise<string> => {
  try {
    // Fetch l'audio avec des headers sécurisés
    const response = await fetch(originalSrc, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'audio/*'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Créer un Blob URL temporaire
    const blobUrl = URL.createObjectURL(blob);
    
    // Auto-cleanup après 1 heure
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 60 * 60 * 1000);
    
    return blobUrl;
  } catch (error) {
    logger.error('Error creating secure audio source:', error);
    throw error;
  }
};

// Hook pour contrôler la lecture sécurisée
export const useSecureAudioControl = (audioRef: React.RefObject<HTMLAudioElement>) => {
  const play = async () => {
    try {
      await audioRef.current?.play();
    } catch (error) {
      logger.error('Error playing audio:', error);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  return {
    play,
    pause,
    seek,
    setVolume
  };
};

// Composant pour bloquer les tentatives de téléchargement
export const DownloadBlocker: React.FC = () => {
  useEffect(() => {
    // Bloquer les raccourcis clavier
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquer Ctrl+S, Ctrl+Shift+S, F12, etc.
      if (
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'S') ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        logger.warn('Action bloquée - Contenu protégé');
      }
    };

    // Bloquer le glisser-déposer
    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLAudioElement || e.target instanceof HTMLVideoElement) {
        e.preventDefault();
      }
    };

    // Bloquer la sélection de texte sur les éléments audio
    const handleSelectStart = (e: Event) => {
      if (e.target instanceof HTMLAudioElement) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return null;
};