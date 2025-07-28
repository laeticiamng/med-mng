import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play } from 'lucide-react';

interface AudioLoadingIndicatorProps {
  isBuffering: boolean;
  bufferPercent: number;
  readyToPlay: boolean;
  estimatedLoadTime: number;
  onRetry?: () => void;
}

export const AudioLoadingIndicator: React.FC<AudioLoadingIndicatorProps> = ({
  isBuffering,
  bufferPercent,
  readyToPlay,
  estimatedLoadTime,
  onRetry
}) => {
  if (readyToPlay && !isBuffering) {
    return null; // Pas d'indicateur si tout va bien
  }

  const getLoadingMessage = () => {
    if (bufferPercent < 10) {
      return "Connexion au streaming...";
    } else if (bufferPercent < 50) {
      return `Chargement ${bufferPercent.toFixed(0)}%`;
    } else {
      return "Presque prêt...";
    }
  };

  const getEstimatedTimeLeft = () => {
    if (estimatedLoadTime > 0 && bufferPercent > 0) {
      const timePerPercent = estimatedLoadTime / bufferPercent;
      const remainingTime = (timePerPercent * (100 - bufferPercent)) / 1000;
      return remainingTime > 1 ? `${remainingTime.toFixed(0)}s` : "quelques secondes";
    }
    return "quelques secondes";
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {isBuffering ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
          ) : (
            <Play className="h-5 w-5 text-amber-600" />
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-900">
              {getLoadingMessage()}
            </span>
            <span className="text-xs text-amber-600">
              {isBuffering ? getEstimatedTimeLeft() : "Prêt"}
            </span>
          </div>
          
          <Progress 
            value={bufferPercent} 
            className="h-2 bg-amber-100"
          />
        </div>
      </div>
      
      {!readyToPlay && estimatedLoadTime > 5000 && onRetry && (
        <div className="flex justify-center">
          <button
            onClick={onRetry}
            className="text-xs text-amber-600 hover:text-amber-800 underline"
          >
            Réessayer le chargement
          </button>
        </div>
      )}
    </div>
  );
};