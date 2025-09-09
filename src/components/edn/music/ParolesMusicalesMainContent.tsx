import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ParolesMusicalesRangSection } from './ParolesMusicalesRangSection';
import { SunoGenerationStatus } from './SunoGenerationStatus';
import { logger } from '@/utils/structuredLogger';

interface ParolesMusicalesMainContentProps {
  paroles: string[] | string[][];
  itemCode: string;
  musicDuration: number;
  selectedStyle: string; // Add this prop
  isGenerating: { rangA: boolean; rangB: boolean };
  generatedAudio: { rangA?: string; rangB?: string };
  currentTrack: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  generationProgress?: {
    rangA?: {
      progress: number;
      attempts: number;
      maxAttempts: number;
      estimatedTimeRemaining?: number;
    };
    rangB?: {
      progress: number;
      attempts: number;
      maxAttempts: number;
      estimatedTimeRemaining?: number;
    };
  };
  onGenerate: (rang: 'A' | 'B') => void;
  onGenerateMix: () => void;
  onPlayAudio: (audioUrl: string, title: string) => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
  pollingTracks?: number; // Ajout pour le status
}

export const ParolesMusicalesMainContent: React.FC<ParolesMusicalesMainContentProps> = ({
  paroles,
  itemCode,
  musicDuration,
  selectedStyle,
  isGenerating,
  generatedAudio,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  generationProgress,
  onGenerate,
  onGenerateMix,
  onPlayAudio,
  onSeek,
  onVolumeChange,
  onStop,
  pollingTracks = 0
}) => {
  logger.debug('ParolesMusicalesMainContent reçu', {
    component: 'ParolesMusicalesMainContent',
    metadata: {
      itemCode,
      parolesType: typeof paroles,
      isArray: Array.isArray(paroles)
    }
  });
  
  // Normaliser les paroles en format attendu avec debugging renforcé
  let normalizedParoles: string[] = [];
  
  if (Array.isArray(paroles) && paroles.length > 0) {
    logger.debug('Première entrée paroles analysée', {
      component: 'ParolesMusicalesMainContent',
      metadata: {
        firstEntryType: typeof paroles[0],
        isFirstArray: Array.isArray(paroles[0])
      }
    });
    
    if (Array.isArray(paroles[0])) {
      // Format string[][]
      logger.debug('Format détecté: string[][]', {
        component: 'ParolesMusicalesMainContent'
      });
      normalizedParoles = (paroles as string[][]).map((section, index) => {
        const result = Array.isArray(section) ? section.join('\n') : String(section);
        logger.trace(`Section ${index} normalisée`, {
          component: 'ParolesMusicalesMainContent',
          metadata: { sectionIndex: index, preview: result.substring(0, 100) }
        });
        return result;
      });
    } else {
      // Format string[]
      logger.debug('Format détecté: string[]', {
        component: 'ParolesMusicalesMainContent'
      });
      normalizedParoles = (paroles as string[]).map((section, index) => {
        const result = String(section);
        logger.trace(`Section ${index} convertie`, {
          component: 'ParolesMusicalesMainContent',
          metadata: { sectionIndex: index, preview: result.substring(0, 100) }
        });
        return result;
      });
    }
  } else {
    logger.warn('Paroles non valides ou vides', {
      component: 'ParolesMusicalesMainContent',
      metadata: { paroles }
    });
  }

  logger.debug('Paroles normalisées', {
    component: 'ParolesMusicalesMainContent',
    metadata: { count: normalizedParoles.length }
  });

  // Vérifier si on a vraiment des paroles utilisables
  const hasUsableParoles = normalizedParoles && 
    normalizedParoles.length > 0 && 
    normalizedParoles.some((p, index) => {
      const isUsable = p && typeof p === 'string' && p.trim().length > 0;
      logger.trace(`Parole ${index} analysée`, {
        component: 'ParolesMusicalesMainContent',
        metadata: { index, isUsable, length: p?.length || 0 }
      });
      return isUsable;
    });

  logger.debug('Paroles utilisables vérifiées', {
    component: 'ParolesMusicalesMainContent',
    metadata: { hasUsableParoles }
  });

  if (!hasUsableParoles) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold text-container">Aucune parole disponible</span>
        </div>
        <p className="text-yellow-700 mt-2 text-container">
          Cet item ne contient pas encore de paroles musicales pour Suno.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 main-content-container">
      <h3 className="font-semibold title-container-multiline">Paroles disponibles pour génération musicale Suno :</h3>
      
      {normalizedParoles[0] && (
        <div className="space-y-2">
          <SunoGenerationStatus 
            isPolling={isGenerating.rangA}
            pollingCount={pollingTracks}
            hasAudio={!!generatedAudio.rangA}
            rang="A"
          />
          <ParolesMusicalesRangSection
            rang="A"
            paroles={normalizedParoles[0]}
            musicDuration={musicDuration}
            selectedStyle={selectedStyle}
            isGenerating={isGenerating.rangA}
            generatedAudio={generatedAudio.rangA}
            itemCode={itemCode}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onGenerate={() => onGenerate('A')}
            onPlayAudio={onPlayAudio}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onStop={onStop}
            generationProgress={generationProgress?.rangA}
          />
        </div>
      )}

      {normalizedParoles[1] && (
        <div className="space-y-2">
          <SunoGenerationStatus 
            isPolling={isGenerating.rangB}
            pollingCount={pollingTracks}
            hasAudio={!!generatedAudio.rangB}
            rang="B"
          />
          <ParolesMusicalesRangSection
            rang="B"
            paroles={normalizedParoles[1]}
            musicDuration={musicDuration}
            selectedStyle={selectedStyle}
            isGenerating={isGenerating.rangB}
            generatedAudio={generatedAudio.rangB}
            itemCode={itemCode}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onGenerate={() => onGenerate('B')}
            onPlayAudio={onPlayAudio}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onStop={onStop}
            generationProgress={generationProgress?.rangB}
          />
        </div>
      )}

      {normalizedParoles[0] && normalizedParoles[1] && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg main-content-container">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2 title-container-multiline">
            🎵 Section Combinée Rang A+B - Fusion des compétences
          </h4>
          <ParolesMusicalesRangSection
            rang="AB"
            paroles={`${normalizedParoles[0]}\n\n--- TRANSITION RANG B ---\n\n${normalizedParoles[1]}`}
            musicDuration={musicDuration * 1.5} // Durée augmentée pour la fusion
            selectedStyle={selectedStyle}
            isGenerating={isGenerating.rangA || isGenerating.rangB}
            generatedAudio={undefined} // Pas encore d'audio combiné
            itemCode={`${itemCode}-FUSION`}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onGenerate={() => {
              // Générer Mix A+B avec toutes les compétences
              onGenerateMix();
            }}
            onPlayAudio={onPlayAudio}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onStop={onStop}
            generationProgress={generationProgress?.rangA}
            title="Musique Complète A+B"
          />
          <p className="text-blue-600 text-sm mt-2 description-text">
            ✨ Cette section combine les compétences Rang A et Rang B pour une expérience musicale complète de {itemCode}
          </p>
        </div>
      )}
    </div>
  );
};