
import { Loader2, Music } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MusicLoadingIndicatorProps {
  rang: 'A' | 'B' | 'AB';
  duration: number;
  isVisible: boolean;
}

export const MusicLoadingIndicator = ({ rang, duration, isVisible }: MusicLoadingIndicatorProps) => {
  if (!isVisible) return null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const cardColor = rang === 'AB' ? 'purple' : rang === 'A' ? 'amber' : 'blue';
  const bgColor = rang === 'AB' ? 'bg-purple-100' : rang === 'A' ? 'bg-amber-100' : 'bg-blue-100';
  const borderColor = rang === 'AB' ? 'border-purple-300' : rang === 'A' ? 'border-amber-300' : 'border-blue-300';
  const textColor = rang === 'AB' ? 'text-purple-800' : rang === 'A' ? 'text-amber-800' : 'text-blue-800';
  const iconColor = rang === 'AB' ? 'text-purple-600' : rang === 'A' ? 'text-amber-600' : 'text-blue-600';
  const progressColor = rang === 'AB' ? 'bg-purple-500' : rang === 'A' ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className={`${bgColor} ${borderColor} border-2 rounded-lg p-6 mb-6 shadow-lg`}>
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-3">
          <Loader2 className={`h-8 w-8 ${iconColor} animate-spin`} />
          <Music className={`h-6 w-6 ${iconColor}`} />
        </div>
        
        <div className="flex-1 text-center">
          <h3 className={`text-xl font-bold ${textColor} mb-2`}>
            🎵 Génération en cours - {rang === 'AB' ? 'Fusion A+B' : `Rang ${rang}`}
          </h3>
          <p className={`text-lg ${textColor} font-medium mb-3`}>
            Création de votre chanson ({formatDuration(duration)})
          </p>
          
          <div className="w-full max-w-md mx-auto">
            <Progress 
              value={75} 
              className={`h-3 mb-2`}
              aria-label={`Génération musicale en cours - ${rang === 'AB' ? 'Fusion A+B' : `Rang ${rang}`}`}
            />
            <p className={`text-sm ${textColor} opacity-80`}>
              🎤 Génération avec Suno AI en cours...
            </p>
            <p className={`text-xs ${textColor} opacity-60 mt-1`}>
              Cela peut prendre quelques minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
